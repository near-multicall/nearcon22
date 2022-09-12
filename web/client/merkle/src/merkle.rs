use serde::{Serialize, Deserialize};
use std::hash::Hasher;
use sha2::{Digest, Sha256};
use merkle_light::hash::Algorithm;
use merkle_light::merkle::MerkleTree;
use merkle_light::proof::Proof;
use crate::LeafInfo;
use base64ct::{ Base64, Encoding };


// Sha256 Hash type alias
pub type Sha256Hash = [u8; 32];

/// Sha256 implementations of Algorithm abstraction that we use in our integration tests
pub struct Sha256Hasher(Sha256);

// Type for our merkle-drop tree
pub type MerkleDropTree = MerkleTree<Sha256Hash, Sha256Hasher>;

#[derive(Serialize, Deserialize)]
pub struct MerkleDropProof {
    // Sha256Hash encoded as base64 string
    lemma: Vec<String>,
    // how to combine hashes in each proof step (left vs. right hash)
    path: Vec<bool>
}

impl Sha256Hasher {
    pub fn new() -> Sha256Hasher {
        Sha256Hasher(Sha256::new())
    }
}

impl Default for Sha256Hasher {
    fn default() -> Sha256Hasher {
        Sha256Hasher::new()
    }
}

impl Hasher for Sha256Hasher {
    #[inline]
    fn write(&mut self, msg: &[u8]) {
        self.0.update(msg)
    }

    #[inline]
    fn finish(&self) -> u64 {
        unimplemented!()
    }
}

impl Algorithm<Sha256Hash> for Sha256Hasher {
    #[inline]
    fn hash(&mut self) -> Sha256Hash {
        self.0.clone().finalize().as_slice().try_into().unwrap()
    }

    #[inline]
    fn reset(&mut self) {
        self.0.reset();
    }
}

pub fn gen_tree (leaf_infos: &Vec<LeafInfo>) -> MerkleDropTree {
    // construct merkle tree
    let tree: MerkleDropTree = MerkleTree::from_data(leaf_infos);
    return tree;
}

// generate merkle proof for every specified element
pub fn gen_proofs (tree: &MerkleDropTree, from_index: u32, limit: u32) -> Vec<MerkleDropProof> {
    let result = (from_index..limit).map(|i| {
        let proof: Proof<Sha256Hash> = tree.gen_proof(i.try_into().unwrap());
        return MerkleDropProof {
            lemma: proof.lemma()
                .into_iter()
                .map(|hash| sha256_to_base64_string(hash))
                .collect(),
            path: proof.path().to_vec()
        }
    }).collect();

    return result;
}

pub fn sha256_to_base64_string (raw_hash: &Sha256Hash) -> String {
    // encode hash in base64 string
    return Base64::encode_string(raw_hash).to_owned();
}