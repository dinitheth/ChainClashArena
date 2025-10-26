# Chain Clash NPC Agent

An AI bot agent that plays Chain Clash automatically using a minimax algorithm.

## Features

- Polls GraphQL API for game state updates
- Uses minimax algorithm (depth 2) for move selection
- Evaluates board positions based on unit count and HP
- Automatically submits moves when it's the bot's turn

## Usage

### Prerequisites

```bash
npm install
```

### Run the agent

```bash
# With default endpoint (localhost:8080)
npm start

# With custom GraphQL endpoint
GRAPHQL_ENDPOINT=http://localhost:8080/chains/<chain-id>/applications/<app-id> npm start
```

## How It Works

1. **Polling**: Agent polls the GraphQL service every 2 seconds
2. **Turn Detection**: Checks if it's the bot's turn based on turn index
3. **Move Generation**: Generates all possible legal moves (deploy, move, attack)
4. **Evaluation**: Uses minimax with alpha-beta pruning to evaluate positions
5. **Execution**: Submits the best move via GraphQL mutation

## Algorithm

The agent uses a simplified minimax algorithm:
- **Depth**: 2 (can be increased for stronger play)
- **Evaluation**: Based on unit count, HP, and board control
- **Strategy**: Aggressive play focusing on unit preservation

## Integration with Linera

This agent demonstrates:
- Local execution (runs on user's machine)
- GraphQL API consumption
- Operation signing (would use player wallet in production)
- Agentic behavior for autonomous gameplay
