use std::collections::HashSet;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::collections::{UnorderedMap};
use near_sdk::{near_bindgen, AccountId, BorshStorageKey, PanicOnDefault, env, ext_contract, PromiseResult, Promise};
use near_sdk::json_types::{U128};
use drop_core::{LeafInfo, MerkleDropProof, Sha256Hasher};
use base64ct::{ Base64, Encoding };
use merkle_light::proof::Proof;
use near_contract_standards::fungible_token::core_impl::ext_fungible_token;
use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;

pub const GAS_FOR_WITHDRAW: u64 = 20_000_000_000;
pub const GAS_FOR_CLAIM: u64 = 40_000_000_000;
pub const GAS_FOR_CLAIM_CALLBACK: u64 = 10_000_000_000;

#[derive(BorshStorageKey, BorshSerialize)]
pub(crate) enum StorageKey {
    Airdrops,
    AllBalances,
    Balances {account_id: AccountId}
}

#[ext_contract(ext_self)]
pub trait DropContract {
    fn claim_callback(
        &mut self,
        airdrop_id: u64,
        user: AccountId,
        amount: U128,
    );
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    airdrops: UnorderedMap<u64, Airdrop>,
    balances: UnorderedMap<AccountId, UnorderedMap<AccountId, U128>>
}

#[near_bindgen]
impl Contract {

    #[init]
    pub fn new() -> Self {
        Self {
            airdrops: UnorderedMap::new(StorageKey::Airdrops),
            balances: UnorderedMap::new(StorageKey::AllBalances)
        }
    }

    pub fn get_number_airdrops(&self) -> u64 {
        return self.airdrops.len();
    }

    pub fn get_airdrop_info(&self, airdrop_id: u64) -> Airdrop {
        return self.airdrops.get(&airdrop_id).expect("no airdrop with found!").into();
    }

    pub fn get_balance(&self, account_id: AccountId) -> Vec<(AccountId, U128)> {
        return self.balances.get(&account_id).expect("user has no funds!").to_vec();
    }

    pub fn create_new_airdrop(
        &mut self, 
        amount: U128,
        token_id: AccountId, 
        ipfs_cid: String, 
        root_hash: String, 
        expiry_date: u64,
        description: String
    ) -> u64 {
        // validate creator has enough funds
        let creator = env::predecessor_account_id();
        let mut token_table = self.balances.get(&creator).unwrap();
        assert!(token_table.is_some(), "creator does not have funds!");
        let balance = token_table.get(&token_id).unwrap();
        assert!(balance.is_some(), "creator did not deposit correct token!");
        assert!(balance >= amount, "creator does not have enough funds!");
        
        // reduce creators balance and give it to the airdrop
        let new_balance = U128(balance.0 - amount.0);
        token_table.insert(&token_id, &new_balance);
        self.balances.insert(&creator, &token_table);

        let new_airdrop = Airdrop {
            description,
            creator,
            token_id,
            ipfs_cid,
            root_hash,
            expiry_date,
            claimed_users: HashSet::new(),
            amount
        };
        let key = self.airdrops.len();
        self.airdrops.insert(&key, &new_airdrop);
        return key;
    }

    #[allow(unreachable_code)]
    pub fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> U128 {
        let token_in = env::predecessor_account_id();

        let mut token_table: UnorderedMap<AccountId, U128> = UnorderedMap::new(StorageKey::Balances {account_id: sender_id.clone()});
        if self.balances.get(&sender_id).is_some() {
            token_table = self.balances.get(&sender_id).unwrap();

            if token_table.get(&token_in).is_some() {
                // update token amount
                let old_token_amt: U128 = token_table.get(&token_in).unwrap();
                let new_token_amt = U128(old_token_amt.0 + amount.0);
                token_table.insert(&token_in, &new_token_amt);
            } else {
                // add token to token table
                token_table.insert(&token_in, &amount);
            }

        } else {
            // add user and token
            token_table.insert(&token_in, &amount);
        }

        self.balances.insert(&sender_id, &token_table);
        0.into()
    }

    pub fn claim(&self, airdrop_id: u64, amt: String, memo: String, proof: MerkleDropProof) -> Promise {

        // ensure airdrop with id exists
        assert!(self.airdrops.get(&airdrop_id).is_some(), "no airdrop with this id!"); 
    
        // ensure account + amount + memo hashed is in a leaf
        let user = env::predecessor_account_id();
        let hash = LeafInfo { addr: user.clone(), amt: amt.clone(), memo: memo.clone() }.to_hash();
        assert!(Base64::encode_string(&hash).to_owned() == proof.lemma[0], "proof incompatible with claim!");
    
        // ensure merkle root is our merkle root
        let mut airdrop: Airdrop = self.airdrops.get(&airdrop_id).expect("no airdrop with found!").into();
        assert!(&airdrop.root_hash == proof.lemma.last().unwrap(), "merkel root does not match the airdrops root hash!");
    
        // ensure merkle proof is valid
        let merkle_light_proof = Proof::new(
            proof.lemma
                .iter()
                .map(|l| Base64::decode_vec(l).unwrap().as_slice().try_into().unwrap())
                .collect(), 
            proof.path
        );
        assert!(merkle_light_proof.validate::<Sha256Hasher>(), "invalid merkle proof!");

        // ensure user has not yet claimed the airdrop
        assert!(!airdrop.claimed_users.contains(&user), "user already claimed airdrop!");

        // set user to claimed
        airdrop.claimed_users.insert(user.clone());

        // transfer token amount
        return ext_fungible_token::ft_transfer(
            user.to_owned(),
            U128(amt.parse::<u128>().unwrap()),
            Some(memo.to_owned()),
            &airdrop.token_id,
            1,
            GAS_FOR_CLAIM,
        )
        // on error revoke claimed
        // on success decrease airdrop amount
        .then(ext_self::claim_callback(
            airdrop_id,
            user.clone(),
            U128(amt.parse::<u128>().unwrap()),
            &env::current_account_id(),
            0,
            GAS_FOR_CLAIM_CALLBACK,
        ));

    }

    #[private]
    pub fn claim_callback(
        &mut self,
        airdrop_id: u64,
        user: AccountId,
        amount: U128,
    ) -> U128 {
        assert_eq!(
            env::promise_results_count(),
            1,
            "{}",
            "expected 1 promise result from claim!"
        );
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(_) => {
                let airdrop = self.airdrops.get(&airdrop_id).unwrap();
                airdrop.amount = U128(airdrop.amount.0 - amount.0);
                self.airdrops.insert(&airdrop_id, &airdrop);
                amount
            },
            PromiseResult::Failed => {
                let mut airdrop: Airdrop = self.airdrops.get(&airdrop_id).expect("no airdrop with found!").into();
                airdrop.claimed_users.remove(&user);
                0.into()
            }
        }
    }
}

// TODO move claimed users into own struct
#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Airdrop {
    description: String,
    creator: AccountId,
    token_id: AccountId,
    ipfs_cid: String,
    root_hash: String,
    expiry_date: u64,
    claimed_users: HashSet<AccountId>,
    amount: U128
}