// Copyright 2022 Risc0, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![no_main]

use risc0_zkvm_guest::env;

use drop_core::{Leaves, ZkProofCommit, MerkleDropTree};


risc0_zkvm_guest::entry!(main);

pub fn main() {
    let my_vec: Vec<u128> = vec![1, 2, 3];
    // let balances: Leaves = env::read();
    // sum of all token allocations
    //let drop_sum: u128 = balances.data
    //    .iter()
    //    .map(|claim| claim.amt.parse::<u128>().unwrap())
    //    .sum::<u128>();
    let drop_sum: u128 = my_vec
        .iter()
        .sum::<u128>();
    // convert claims into a merkle tree
    //let tree: MerkleDropTree = balances.gen_tree();
    // commit results
    // env::commit(&ZkProofCommit {
    //    base64_root_hash: tree.root(),
    //    token_sum: drop_sum
    //});
    env::commit(&drop_sum);
}