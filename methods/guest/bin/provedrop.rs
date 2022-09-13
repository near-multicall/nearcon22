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
#![no_std]

use risc0_zkvm_guest::env;

use drop_core::{Leaves, ZkProofCommit};

risc0_zkvm_guest::entry!(main);

pub fn main() {
    let balances: Leaves = env::read();
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
    // commit results
    env::commit(&ZkProofCommit {
        base64_root_hash: &base64_root,
        token_sum: &drop_sum
    });
}
