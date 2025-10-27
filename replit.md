# Chain Clash - Linera Microchains Strategy Game

## Project Overview
Chain Clash is a comprehensive turn-based PvP strategy arena game built entirely on Linera microchains, demonstrating the full power of the Linera SDK and protocol features.

## Architecture
- **Backend**: Rust smart contracts compiled to WASM using linera-sdk 0.15.3
  - `game_contract`: Deterministic game logic, state management with Views
  - `game_service`: GraphQL API service for queries and mutations
- **Frontend**: React + TypeScript + Tailwind CSS + Apollo Client
  - Interactive 10x10 game board
  - Real-time player information
  - Unit deployment and combat controls
- **NPC Agent**: Node.js bot with minimax algorithm
  - Autonomous gameplay
  - GraphQL API integration
  - Move evaluation and execution

## Linera Features Demonstrated
1. **Microchains**: Personal player chains, temporary game chains, tournament app chain
2. **Cross-chain Messaging**: JoinGame, MoveMessage, AttackMessage, ResolveGame
3. **Views**: RegisterView, MapView, LogView for state persistence
4. **Contract/Service Split**: Separate logic and API layers
5. **GraphQL Service**: async-graphql integration
6. **Authentication Forwarding**: Preserves signer identity across chains
7. **Real-time Notifications**: Push updates to clients

## Development Status
- ✅ Complete Rust contract implementation
- ✅ GraphQL service with queries and mutations
- ✅ React frontend with game UI
- ✅ NPC agent with AI algorithm
- ✅ Deployment scripts and tooling
- ✅ Comprehensive documentation
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Netlify & Vercel deployment configurations
- ✅ Ready for web hosting deployment

## Technical Stack
- Linera SDK: 0.15.3
- Rust: 1.86.0
- WASM target: wasm32-unknown-unknown
- GraphQL: async-graphql 7.0
- Frontend: React 18, TypeScript, Vite, Tailwind
- Agent: Node.js with graphql-request

## Local Development Requirements
This is a Linera blockchain project requiring:
1. Rust toolchain with wasm32-unknown-unknown target
2. Protobuf compiler (protoc v21.11)
3. Linera CLI tools (linera-service, linera-storage-service)
4. Node.js for frontend and agent
5. Local Linera network for testing

## User Preferences
- Focus on complete, production-ready implementations
- Comprehensive documentation with examples
- Demonstrate all Linera features explicitly
- Include deployment scripts and CI/CD
- Real-time UI with proper state management

## Recent Changes (2025-10-27)
- ✅ Added Netlify deployment configuration (netlify.toml)
- ✅ Added Vercel deployment configuration (vercel.json)
- ✅ Created comprehensive deployment guides:
  - DEPLOYMENT.md: Complete deployment guide with troubleshooting
  - QUICK_START_DEPLOY.md: 5-minute quick start for hosting
- ✅ Updated frontend environment variable examples
- ✅ Added deployment sections to README
- ✅ Frontend ready for one-click deployment to hosting platforms

## Notes
- Project follows Linera SDK 0.15.3 (Testnet Conway) conventions
- All cross-chain messages use authentication forwarding
- State management uses Linera Views (RegisterView, MapView)
- Game logic is fully deterministic for verifiability
- Horizontal scaling via microchains architecture
