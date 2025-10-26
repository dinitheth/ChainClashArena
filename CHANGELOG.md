# Changelog

All notable changes to Chain Clash will be documented in this file.

## [0.1.0] - 2025-10-26

### Added
- Initial release of Chain Clash for Linera Buildathon
- Complete Rust smart contract using linera-sdk 0.15.3
  - Game contract with state management using Views
  - GraphQL service for queries and mutations
  - Cross-chain messaging system
- React + TypeScript frontend with Tailwind CSS
  - Interactive game board (10x10 grid)
  - Real-time player information display
  - Unit deployment and movement controls
- NPC agent with minimax algorithm
  - Autonomous bot gameplay
  - GraphQL API integration
  - Move evaluation and selection
- Deployment scripts and tooling
  - Local network setup script
  - Deployment automation for local and testnet
- Comprehensive documentation
  - Setup instructions
  - Architecture deep dive
  - API documentation
- CI/CD with GitHub Actions
  - Rust build and test
  - Frontend build
  - WASM artifact verification

### Linera Features Implemented
- Microchains: Personal player chains, temporary game chains, tournament chain
- Cross-chain messaging: JoinGame, MoveMessage, AttackMessage, ResolveGame
- Views: RegisterView, MapView, LogView for state management
- Contract/Service split: Deterministic logic + GraphQL API
- Authentication forwarding: Preserves signer across messages
- GraphQL service: Queries and mutations for game interaction

### Demonstrated Capabilities
- Horizontal scaling with unlimited concurrent games
- Sub-second finality for move submissions
- Real-time UI updates via Linera notifications
- Agentic gameplay with local bot execution
- Verifiable move history for anti-cheat

## [Planned for 0.2.0]

### Features
- Tournament brackets and matchmaking
- Prize distribution system
- Enhanced AI with ML-based agents
- Mobile-responsive frontend
- Replay system for past games

### Improvements
- Optimized WASM binary sizes
- Advanced GraphQL subscriptions
- Performance monitoring dashboard
- Multi-language support
