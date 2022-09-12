mod merkle;

#[macro_use]
extern crate merkle_light_derive;
extern crate console_error_panic_hook;

use drop_core::{
    Leaves,
    LeafInfo,
    gen_proofs, 
    sha256_to_base64_string, 
    MerkleDropTree, 
    MerkleDropProof 
}

use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Claim {
    amount: String,
    memo: String,
    proof: MerkleDropProof
}

#[derive(Serialize, Deserialize)]
pub struct MerkleDropInfo {
    merkle_root: String,
    token_total: String,
    claims: HashMap<String, Claim>
}

#[wasm_bindgen]
// Generates Merkle Tree from 
// returns Merkle info, like root hash and total airdrop amount
pub fn parse_balance_map (balances_js: &JsValue) -> JsValue {
    console_error_panic_hook::set_once();

    // de-serialize balances array from JS readable value
    let balances: Leaves = Leaves { data: balances_js.into_serde().unwrap() };

    // sum of all token allocations
    let drop_sum: String = balances.data
        .iter()
        .map(|claim| claim.amt.parse::<u128>().unwrap())
        .sum::<u128>()
        .to_string();

    // convert claims into a merkle tree
    let tree: MerkleDropTree = balances.gen_tree();
    // get merkle root in base64 encoding
    let base64_root: String = sha256_to_base64_string( &tree.root() );
    // generate and save a proof for each address
    let proofs = gen_proofs(&tree, 0, balances.data.len() as u32);
    let all_claims: HashMap<String, Claim> = proofs
        .into_iter()
        .enumerate()
        .map(|(i, curr_proof)| {
            let LeafInfo { addr, amt, memo } = &balances.data[i];
            return (
                addr.clone(),
                Claim { amount: amt.clone(), memo: memo.to_owned(), proof: curr_proof }
            );
        })
        .collect();
    
    // merkle drop information
    let merkle_drop_info = MerkleDropInfo {
        merkle_root: base64_root,
        token_total: drop_sum,
        claims: all_claims
    };
    // serialize return object to be JS readable
    return JsValue::from_serde(&merkle_drop_info).unwrap()
}