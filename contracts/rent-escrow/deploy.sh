#!/bin/bash
set -e

# Configuration
NETWORK="testnet"
SOURCE_ACCOUNT="default"

echo "Building contract..."
cargo build --target wasm32-unknown-unknown --release

WASM_FILE="target/wasm32-unknown-unknown/release/rent_escrow.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "Error: WASM file not found at $WASM_FILE"
    exit 1
fi

echo "Deploying to $NETWORK..."
# Note: Requires Soroban CLI to be installed and account configured
# soroban contract deploy \
#   --wasm "$WASM_FILE" \
#   --source "$SOURCE_ACCOUNT" \
#   --network "$NETWORK"

echo "Build successful. Deployment command prepared (commented out in script)."
