/// Hard-coded host (runs ZK prover) for debugging
/// as it's more straightforward than a server environment


use serde::{Deserialize, Serialize};

use drop_core::{sha256_to_base64_string, Leaves, LeafInfo, ZkProofCommit};
use drop_methods::{PROVEDROP_ID, PROVEDROP_PATH};
use risc0_zkvm_host::Prover;

#[derive(Deserialize, Serialize)]
pub struct Receipt {
    journal: Vec<u8>,
    seal: Vec<u32>,
}


fn main() {
    let first_leaf = LeafInfo {
        addr: "a".to_owned(),
        amt: "10".to_owned(),
        memo: "".to_owned()
    };
    let second_leaf = LeafInfo {
        addr: "b".to_owned(),
        amt: "20".to_owned(),
        memo: "".to_owned()
    };
    let test_leaves = Leaves { data: vec![first_leaf, second_leaf] };
    let mut prover = Prover::new(&std::fs::read(PROVEDROP_PATH).unwrap(), PROVEDROP_ID).unwrap();
    let vec = risc0_zkvm_serde::to_vec(&test_leaves).unwrap();
    prover.add_input(vec.as_slice());
    println!("hello 4");
    let receipt = prover.run().unwrap();
    println!("hello 5");
    let receipt = Receipt {
        journal: receipt.get_journal().unwrap().to_vec(),
        seal: receipt.get_seal().unwrap().to_vec(),
    };
    let output_vec = prover.get_output_vec().unwrap();
    let result = risc0_zkvm_serde::from_slice::<ZkProofCommit>(output_vec.as_slice()).unwrap();

    print!("token sum: {}", &result.token_sum.to_string());
    print!("root hash: {}", sha256_to_base64_string(&result.base64_root_hash));
}
