#!/bin/bash

cargo build --release
cargo build --release --manifest-path contract/Cargo.toml
cargo test --release
