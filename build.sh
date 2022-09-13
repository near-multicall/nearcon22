#!/bin/bash

cargo build --release
cd ./contract
cargo build --release
cd ..

cd ./web/client/merkle
wasm-pack build --release
cd ..
cp ./merkle/pkg ./src