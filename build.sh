#!/bin/bash

cargo build --release
cargo build --package drop-contract --release

cd ./web/client/merkle
wasm-pack build --target web --release
