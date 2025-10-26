#!/bin/bash

set -e

echo "==================================="
echo "Chain Clash Deployment Script"
echo "==================================="

# Build backend WASM binaries
echo "Building game contract and service..."
cd backend/game_contract
cargo build --release --target wasm32-unknown-unknown
cd ../game_service
cargo build --release --target wasm32-unknown-unknown
cd ../..

echo "✓ Backend built successfully"

# Check if we should deploy to local or testnet
NETWORK=${1:-local}

if [ "$NETWORK" = "local" ]; then
    echo "Deploying to local network..."
    
    # Start local network (if not already running)
    echo "Checking local network status..."
    
    # Publish and create application
    linera publish-and-create \
        backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
        backend/target/wasm32-unknown-unknown/release/game_service.wasm \
        --json-argument '{"players": [], "seed": 42}'
    
    echo "✓ Application deployed to local network"
    
elif [ "$NETWORK" = "testnet" ]; then
    echo "Deploying to Testnet Conway..."
    
    # Publish and create application on testnet
    linera publish-and-create \
        backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
        backend/target/wasm32-unknown-unknown/release/game_service.wasm \
        --json-argument '{"players": [], "seed": 42}'
    
    echo "✓ Application deployed to Testnet"
else
    echo "Unknown network: $NETWORK"
    echo "Usage: ./deploy_scripts.sh [local|testnet]"
    exit 1
fi

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Start the Linera service:"
echo "   linera service --port 8080"
echo ""
echo "2. Navigate to http://localhost:8080 to access GraphiQL"
echo ""
echo "3. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. (Optional) Start the NPC agent:"
echo "   cd npc_agent && npm start"
