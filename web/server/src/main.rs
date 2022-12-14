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

use std::net::{Ipv4Addr, SocketAddr};

use axum::http::Method;
use axum::{http::StatusCode, response::IntoResponse, routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use tower_http::trace::TraceLayer;
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::prelude::*;

use drop_core::{Leaves};
use drop_methods::{PROVEDROP_ID, PROVEDROP_PATH};
use risc0_zkvm_host::Prover;

#[derive(Deserialize, Serialize)]
pub struct Receipt {
    journal: Vec<u8>,
    seal: Vec<u32>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        // Filter spans based on the RUST_LOG env var.
        .with(tracing_subscriber::EnvFilter::new(
            "info,server,tower_http=debug",
        ))
        // Send a copy of all spans to stdout as JSON.
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .with_level(true)
                .compact(),
        )
        // Install this registry as the global tracing registry.
        .try_init()
        .unwrap();

    let cors = CorsLayer::new()
        .allow_methods(vec![Method::POST])
        .allow_origin(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/prove", post(prove_drop))
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    let addr = SocketAddr::from((Ipv4Addr::LOCALHOST, 3001));
    tracing::info!("listening on {}", addr);
    let server = axum::Server::bind(&addr).serve(app.into_make_service());

    server.await.unwrap();
}

fn do_drop_proof(name: &str, input: Leaves) -> Result<String, risc0_zkvm_host::Exception> {
    let elf_contents = std::fs::read(name).unwrap();
    let mut prover = Prover::new(&elf_contents, PROVEDROP_ID)?;
    let vec = risc0_zkvm_serde::to_vec(&input).unwrap();
    prover.add_input(vec.as_slice())?;
    println!("running prover...");
    let receipt = prover.run()?;
    println!("prover run success!");
    let receipt = Receipt {
        journal: receipt.get_journal().unwrap().to_vec(),
        seal: receipt.get_seal().unwrap().to_vec(),
    };
    println!("zk receipt success!");
    Ok(base64::encode(bincode::serialize(&receipt).unwrap()))
}

async fn prove_drop(Json(payload): Json<Leaves>) -> impl IntoResponse {
    let out = match do_drop_proof(PROVEDROP_PATH, payload) {
        Ok(receipt) => receipt,
        Err(_e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                String::from("bad proof load"),
            )
        }
    };
    (StatusCode::OK, out)
}
