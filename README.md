# Chain Clash ⚔️

A turn-based PvP strategy arena built on **Linera microchains**, demonstrating the full power of Linera's protocol features including microchains, cross-chain messaging, Views, GraphQL services, and real-time notifications.

## Overview

Chain Clash is a strategic battle game where:
- **Each player has their own personal microchain** for instant move submissions
- **Each match runs on a temporary game microchain** spawned dynamically
- **A tournament app chain** manages matchmaking, rankings, and prizes
- **Cross-chain messages** handle all player interactions (moves, attacks, results)
- **AI bots** can play autonomously using local agents

> **📖 Important**: See [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) for detailed information about Linera's Service vs Contract architecture and how to integrate the frontend with blockchain operations. The backend proxy server in `backend_proxy/` bridges the UI with Linera operations.

## Linera Features Demonstrated

This project showcases comprehensive usage of Linera SDK features:

### ✅ Microchains Architecture
- **Personal player chains**: Each player operates their own microchain
- **Temporary game chains**: New microchain spawned per match
- **Tournament chain**: Manages game lifecycle and rankings
- **Horizontal scaling**: Unlimited concurrent games across microchains

### ✅ Cross-Chain Messaging
- `JoinGame`: Players join matches from their personal chains
- `MoveMessage`: Moves sent from player chain to game chain
- `AttackMessage`: Cross-chain attacks between players
- `ResolveGame`: Results propagated to tournament chain
- **Authentication forwarding**: Preserves signer identity across chains

### ✅ Views (State Management)
- `RegisterView<Vec<Owner>>`: Player list
- `RegisterView<u8>`: Turn tracking
- `RegisterView<String>`: Board state (serialized)
- `MapView<Owner, u64>`: Resources and HP per player
- `LogView<Move>`: Immutable move history (anti-cheat)

### ✅ Contract & Service Split
- **Contract** (`game_contract`): Deterministic game logic, state transitions
- **Service** (`game_service`): GraphQL API for queries and mutations

### ✅ GraphQL Service
```graphql
query {
  gameState {
    players
    turnIndex
    board { units { owner unitType position hp } }
    result
  }
}

mutation {
  submitMove(moveData: {...})
  createMatch(params: {...})
}
```

### ✅ Real-Time Notifications
- Push notifications from validators to clients
- Instant UI updates on move submission
- No polling required for blockchain state

### ✅ Agentic NPCs
- Local bot agent with minimax algorithm
- Signs operations using player wallet
- Autonomous gameplay without central server

## Project Structure

```
chain-clash/
├── backend/
│   ├── game_contract/          # Contract binary (WASM)
│   │   ├── src/lib.rs          # State, Operations, Messages
│   │   └── Cargo.toml
│   └── game_service/           # Service binary (WASM)
│       ├── src/lib.rs          # GraphQL API
│       └── Cargo.toml
├── backend_proxy/              # HTTP server to bridge frontend ↔ operations
│   ├── server.js               # Express server wrapping linera CLI
│   └── README.md
├── frontend/                   # React + TypeScript UI
│   ├── src/
│   │   ├── App.tsx
│   │   └── components/         # GameBoard, PlayerInfo, Controls
│   └── package.json
├── npc_agent/                  # AI bot (Node.js)
│   ├── agent.js                # Minimax algorithm
│   └── package.json
├── tools/
│   ├── deploy_scripts.sh       # Deployment automation
│   └── local_setup.sh          # Local network setup
├── tests/
│   └── integration_tests.rs    # Unit tests
├── IMPLEMENTATION_NOTES.md     # ⭐ Architecture guide
└── README.md
```

## Prerequisites

### Required Tools

```bash
# 1. Rust and WASM target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# 2. Protobuf compiler (protoc)
curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.11/protoc-21.11-linux-x86_64.zip
unzip protoc-21.11-linux-x86_64.zip -d $HOME/.local
export PATH="$HOME/.local/bin:$PATH"

# 3. Linera CLI tools (matching Testnet version)
cargo install --locked linera-storage-service@0.15.3
cargo install --locked linera-service@0.15.3
```

### Verify Installation

```bash
rustc --version          # Should be 1.86.0 or compatible
cargo --version
protoc --version         # Should be 21.11+
linera --version         # Should be 0.15.3
```

## Quick Start (Local Development)

### 1. Start Local Linera Network

```bash
# Start local network with faucet
linera net up --with-faucet --faucet-port 8080
```

In a **new terminal**:

```bash
# Initialize wallet and request a chain
linera wallet init --faucet http://localhost:8080
linera wallet request-chain --faucet http://localhost:8080

# Verify setup
linera sync
linera query-balance
```

### 2. Build and Deploy the Game

```bash
# Build WASM binaries
cd backend/game_contract
cargo build --release --target wasm32-unknown-unknown
cd ../game_service
cargo build --release --target wasm32-unknown-unknown
cd ../..

# Or use the deployment script
chmod +x tools/deploy_scripts.sh
./tools/deploy_scripts.sh local
```

### 3. Publish the Application

```bash
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/game_service.wasm \
  --json-argument '{"players": [], "seed": 42}'
```

Save the application ID from the output!

### 4. Start Linera GraphQL Service

```bash
linera service --port 8080
```

Navigate to http://localhost:8080 to access **GraphiQL** interface.

### 5. Launch Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5000 to play!

### 6. (Optional) Run NPC Agent

In a **new terminal**:

```bash
cd npc_agent
npm install
GRAPHQL_ENDPOINT=http://localhost:8080/chains/<your-chain-id>/applications/<app-id> npm start
```

## 🚀 Frontend Deployment (Netlify/Vercel)

You can deploy the frontend UI to Netlify or Vercel for easy access and demonstration!

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Push code to GitHub
2. Import repository on Netlify
3. Auto-detects settings from `netlify.toml`
4. Deploy! ✨

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import repository on Vercel
3. Auto-detects settings from `vercel.json`
4. Deploy! ✨

### Environment Variables (Optional)

To connect to a live Linera network, add these environment variables:

```bash
VITE_GRAPHQL_ENDPOINT=https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>
VITE_BACKEND_PROXY_URL=https://your-backend-proxy.com
```

**📖 See [`DEPLOYMENT.md`](DEPLOYMENT.md) for complete deployment guide**

---

## Deployment to Testnet (Conway)

### 1. Create Testnet Wallet

```bash
linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

### 2. Build Release Binaries

```bash
cargo build --release --target wasm32-unknown-unknown
```

### 3. Deploy to Testnet

```bash
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/game_service.wasm \
  --json-argument '{"players": [], "seed": 12345}'
```

### 4. Start Service

```bash
linera service --port 8080
```

## Game Mechanics

### Unit Types

| Unit    | Cost | HP  | Attack | Icon |
|---------|------|-----|--------|------|
| Warrior | 20   | 100 | 20     | ⚔️   |
| Archer  | 30   | 60  | 30     | 🏹   |
| Mage    | 40   | 40  | 50     | ✨   |

### Actions

- **Deploy**: Spend resources to place a unit on the board
- **Move**: Move your unit up to 2 tiles (Manhattan distance)
- **Attack**: Attack adjacent enemy units

### Winning Conditions

- Eliminate all enemy units
- Force opponent to surrender

## Architecture Deep Dive

### Cross-Chain Message Flow

```
Player Chain A              Game Chain              Player Chain B
     │                          │                         │
     │  JoinGame                │                         │
     ├─────────────────────────►│                         │
     │                          │  JoinGame               │
     │                          │◄────────────────────────┤
     │                          │                         │
     │  MoveMessage             │                         │
     ├─────────────────────────►│                         │
     │                          │  Update State           │
     │                          │  Notify via Events      │
     │                          │                         │
     │                          │  MoveMessage            │
     │                          │◄────────────────────────┤
     │                          │                         │
     │  ResolveGame             │                         │
     ◄─────────────────────────┤                         │
     │                          │  ResolveGame            │
     │                          ├────────────────────────►│
```

### State Management with Views

```rust
#[derive(RootView)]
pub struct GameState {
    pub players: RegisterView<Vec<Owner>>,       // Player list
    pub turn_index: RegisterView<u8>,            // Current turn
    pub board_state: RegisterView<String>,       // Serialized board
    pub resources: MapView<Owner, u64>,          // Per-player resources
    pub hp: MapView<Owner, u64>,                 // Per-player HP
    pub game_result: RegisterView<Option<GameResult>>,
}
```

### Contract Hooks

- `instantiate()`: Initialize game with players and seed
- `execute_operation()`: Handle player operations, create outgoing messages
- `execute_message()`: Process incoming cross-chain messages, update state
- `store()`: Persist state to storage

## Testing

### Run Unit Tests

```bash
cargo test --workspace
```

### Integration Tests

```bash
# Start local network
linera net up --with-faucet --faucet-port 8080

# In another terminal, run deployment script
./tools/deploy_scripts.sh local

# Test via GraphiQL
# Navigate to http://localhost:8080 and run queries
```

### Load Testing

Spawn multiple game chains to demonstrate horizontal scaling:

```bash
# Script to create 100 concurrent games
for i in {1..100}; do
  linera publish-and-create \
    backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
    backend/target/wasm32-unknown-unknown/release/game_service.wasm \
    --json-argument "{\"players\": [], \"seed\": $i}" &
done
wait
```

## Monitoring & Metrics

- **Active microchains**: Number of game chains spawned
- **Latency**: Time from move submission to block inclusion (<0.5s typical)
- **Message throughput**: Cross-chain messages per second
- **Validator resources**: CPU/memory during high load

## Anti-Cheat Features

- **Canonical move log**: Immutable history on game chain
- **Authentication forwarding**: Preserves signer for all messages
- **Deterministic logic**: Contract ensures identical execution
- **Verifiable replay**: Tournament chain can verify game results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `cargo test --workspace`
5. Submit a pull request

## Troubleshooting

### "wasm target not found"
```bash
rustup target add wasm32-unknown-unknown
```

### "protoc not found"
```bash
# Install protobuf compiler as shown in Prerequisites
export PATH="$HOME/.local/bin:$PATH"
```

### "linera command not found"
```bash
cargo install --locked linera-service@0.15.3
```

### Frontend not connecting
- Ensure `linera service` is running on port 8080
- Check GraphQL endpoint in frontend environment variables
- Verify application is deployed: `linera wallet show`

## Demo Video Checklist

1. ✅ Show local network startup
2. ✅ Deploy application (publish-and-create)
3. ✅ Start GraphQL service and show GraphiQL
4. ✅ Launch frontend and demonstrate gameplay
5. ✅ Show two players making moves
6. ✅ Demonstrate cross-chain messages (GraphiQL inspector)
7. ✅ Run NPC agent playing autonomously
8. ✅ Spawn multiple game chains (scalability)
9. ✅ Show game resolution and results

## License

MIT License - See LICENSE file for details

## Built With

- **Linera SDK 0.15.3** - Microchains protocol
- **Rust** - Smart contract language
- **WebAssembly (WASM)** - Contract compilation target
- **async-graphql** - GraphQL server
- **React + TypeScript** - Frontend UI
- **Tailwind CSS** - Styling
- **Apollo Client** - GraphQL client
- **Node.js** - NPC agent runtime

## Resources

- [Linera Documentation](https://docs.linera.io)
- [Linera GitHub](https://github.com/linera-io/linera-protocol)
- [Testnet Conway Faucet](https://faucet.testnet-conway.linera.net)

---

**Built for Linera Buildathon** - Demonstrating the full capabilities of microchains, cross-chain messaging, Views, GraphQL services, and agentic applications.
