#!/bin/bash

set -e

echo "==================================="
echo "Chain Clash Local Setup"
echo "==================================="

# Start local network with faucet
echo "Starting local Linera network..."
linera net up --with-faucet --faucet-port 8080 &

# Wait for network to be ready
sleep 5

# Initialize wallet
echo "Initializing developer wallet..."
linera wallet init --faucet http://localhost:8080

# Request a chain
echo "Requesting microchain from faucet..."
linera wallet request-chain --faucet http://localhost:8080

# Display wallet info
echo ""
echo "==================================="
echo "Wallet initialized successfully!"
echo "==================================="
linera wallet show

echo ""
echo "Network is ready for development!"
echo "Run ./tools/deploy_scripts.sh local to deploy the game"
