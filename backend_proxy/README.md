# Backend Proxy Server

This HTTP server bridges the frontend with Linera operations by wrapping the `linera` CLI.

## Why This is Needed

Linera's architecture separates:
- **Service**: Read-only GraphQL queries
- **Contract**: Write operations (executed via client)

The frontend needs to submit operations, but services can't execute them. This proxy:
1. Receives HTTP requests from frontend
2. Translates them to Linera operations
3. Executes them via `linera` CLI
4. Returns results to frontend

## Setup

```bash
cd backend_proxy
npm install
```

## Usage

### 1. Deploy your application and note the IDs

```bash
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/game_service.wasm \
  --json-argument '{"players": [], "seed": 42}'

# Note the APPLICATION_ID and CHAIN_ID from output
```

### 2. Start the proxy

```bash
APPLICATION_ID=<your-app-id> \
CHAIN_ID=<your-chain-id> \
npm start
```

### 3. Frontend integration

Update your frontend to call the proxy:

```typescript
// frontend/src/utils/api.ts
const API_BASE = 'http://localhost:3001/api';

export async function submitMove(moveData: any) {
  const response = await fetch(`${API_BASE}/submit-move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moveData })
  });
  return response.json();
}

export async function createMatch(params: any) {
  const response = await fetch(`${API_BASE}/create-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params })
  });
  return response.json();
}

export async function surrender() {
  const response = await fetch(`${API_BASE}/surrender`, {
    method: 'POST'
  });
  return response.json();
}
```

## API Endpoints

### POST /api/submit-move

Submit a game move.

**Request:**
```json
{
  "moveData": {
    "type": "Deploy",
    "unit_type": "Warrior",
    "position": { "x": 5, "y": 5 }
  }
}
```

Or for moving a unit:
```json
{
  "moveData": {
    "type": "MoveUnit",
    "from": { "x": 1, "y": 1 },
    "to": { "x": 2, "y": 2 }
  }
}
```

Or for attacking:
```json
{
  "moveData": {
    "type": "Attack",
    "from": { "x": 2, "y": 2 },
    "target": { "x": 3, "y": 3 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Move submitted successfully"
}
```

### POST /api/create-match

Request a new match.

**Request:**
```json
{
  "params": {
    "maxPlayers": 2,
    "boardSize": 10
  }
}
```

### POST /api/surrender

Surrender the current game.

### GET /health

Check server status and configuration.

## Environment Variables

- `PORT`: Server port (default: 3001)
- `APPLICATION_ID`: Linera application ID (required)
- `CHAIN_ID`: Linera chain ID (required)

## Production Considerations

For production, you should:
1. Add authentication and authorization
2. Use HTTPS
3. Implement rate limiting
4. Add request validation
5. Use a proper logging system
6. Consider using Linera's client library instead of CLI

## Future: Direct Client Integration

When Linera releases browser wallet support, this proxy won't be needed. The frontend will directly:
1. Connect to user's wallet
2. Sign operations locally
3. Submit to validators

This proxy is a development/demo solution.
