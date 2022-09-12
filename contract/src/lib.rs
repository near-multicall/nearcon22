use std::collections::HashSet;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::collections::{UnorderedMap};
use near_sdk::{near_bindgen, AccountId, BorshStorageKey, PanicOnDefault, env};

#[derive(BorshStorageKey, BorshSerialize)]
pub(crate) enum StorageKey {
    Airdrops,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    airdrops: UnorderedMap<u64, Airdrop>
}

#[near_bindgen]
impl Contract {

    #[init]
    pub fn new() -> Self {
        Self {
            airdrops: UnorderedMap::new(StorageKey::Airdrops),
        }
    }

    pub fn get_number_airdrops(&self) -> u64 {
        return self.airdrops.len();
    }

    pub fn get_airdrop_info(&self, airdrop_id: u64) -> Airdrop {
        return self.airdrops.get(&airdrop_id).expect("no airdrop with found!").into();
    }

    pub fn create_new_airdrop(
        &mut self, 
        token_id: AccountId, 
        ipfs_cid: String, 
        root_hash: String, 
        expiry_date: u64,
        description: String
    ) -> u64 {
        let new_airdrop = Airdrop {
            description,
            creator: env::predecessor_account_id(),
            token_id,
            ipfs_cid,
            root_hash,
            expiry_date,
            claimed_users: HashSet::new()
        };
        let key = self.airdrops.len();
        self.airdrops.insert(&key, &new_airdrop);
        return key;
    }

}

#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Airdrop {
    description: String,
    creator: AccountId,
    token_id: AccountId,
    ipfs_cid: String,
    root_hash: String,
    expiry_date: u64,
    claimed_users: HashSet<AccountId>
}