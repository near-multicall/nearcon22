#!/bin/bash
#!/bin/bash

cargo build --release
cargo build --release --manifest-path contract/Cargo.toml
# compile the contract
cd ./contract
cargo build --release
cd ..

cd ./web/client/merkle
wasm-pack build --target web --release
