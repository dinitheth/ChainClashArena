# Chain Clash Implementation Notes

## Important: Linera Service vs Contract Architecture

### How Linera Applications Work

Linera separates concerns between **Contracts** (write operations) and **Services** (read-only queries):

1. **Contract** (`game_contract`):
   - Executes operations that modify state
   - Handles cross-chain messages
   - Runs deterministically in validators
   - **Cannot** be called directly from GraphQL

2. **Service** (`game_service`):
   - Provides **read-only** GraphQL API
   - Queries blockchain state
   - **Cannot** execute operations or modify state
   - Runs in the client, not validators

### Proper Integration Flow

#### Reading Game State (✓ Implemented)

```graphql
query {
  gameState {
    players
    turnIndex
    board { units { owner unitType position hp } }
    result
  }
}
```

This works because services can read state through Views.

#### Submitting Moves (Requires Client Integration)

To submit moves, the **frontend must use the Linera client** to create and sign operations:

**Option 1: Using `linera` CLI (Development)**
```bash
# Frontend calls this via exec or HTTP proxy
linera execute-operation \
  --application-id <app-id> \
  --operation '{"MakeMove": {"game_chain": "<chain-id>", "move_data": {...}}}'
```

**Option 2: Using Linera Client Library (Production)**
```typescript
// Frontend uses @linera/sdk (when available)
import { LimeraClient } from '@linera/sdk';

const client = new LineraClient(wallet);
await client.submitOperation({
  applicationId: APP_ID,
  operation: {
    MakeMove: {
      game_chain: gameChainId,
      move_data: moveData
    }
  }
});
```

**Option 3: HTTP Proxy to Client (Current Workaround)**
```typescript
// Create a simple Node.js server that wraps linera CLI
// Frontend → HTTP POST → Node server → linera CLI → Blockchain

// server.js
app.post('/api/submit-move', async (req, res) => {
  const { moveData } = req.body;
  const result = await exec(`linera execute-operation ...`);
  res.json(result);
});
```

### Current Implementation Status

#### ✅ Fully Implemented
- Contract state management with Views
- Operation types (RequestMatch, MakeMove, Surrender)
- Message types (JoinGame, MoveMessage, AttackMessage, ResolveGame)
- Contract hooks (instantiate, execute_operation, execute_message)
- Authentication forwarding
- GraphQL queries for reading state
- Frontend UI components
- NPC agent structure

#### ⚠️ Requires Integration
- **GraphQL Mutations**: Currently return placeholder strings
  - **Why**: Services are read-only in Linera
  - **Solution**: Frontend must call operations directly via client
  
- **Frontend State Fetching**: Currently uses hardcoded data
  - **Why**: Needs actual GraphQL endpoint with application ID
  - **Solution**: Update VITE_GRAPHQL_ENDPOINT to point to deployed app
  
- **NPC Agent Operations**: Currently calls stub mutations
  - **Why**: Needs to sign and submit real operations
  - **Solution**: Use `linera` CLI or client library to submit authenticated operations

### Production Deployment Flow

1. **Deploy Contract**:
```bash
linera publish-and-create \
  game_contract.wasm \
  game_service.wasm \
  --json-argument '{"players": [], "seed": 42}'
```
Note the returned `application-id` and `chain-id`.

2. **Start Service**:
```bash
linera service --port 8080
```
The GraphQL endpoint will be:
`http://localhost:8080/chains/<chain-id>/applications/<app-id>`

3. **Configure Frontend**:
```bash
# frontend/.env
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/chains/<chain-id>/applications/<app-id>
VITE_APPLICATION_ID=<app-id>
VITE_CHAIN_ID=<chain-id>
```

4. **Update Frontend to Submit Operations**:

```typescript
// src/utils/lineraClient.ts
export async function submitMove(moveData: MoveData) {
  // Call HTTP proxy or use linera CLI
  const response = await fetch('/api/linera/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: {
        MakeMove: {
          game_chain: import.meta.env.VITE_CHAIN_ID,
          move_data: moveData
        }
      }
    })
  });
  return response.json();
}

// src/components/Controls.tsx
const handleSubmitMove = async () => {
  await submitMove(selectedMove);
  // State will update via GraphQL subscription or polling
};
```

5. **Enable Real-time Updates**:

```typescript
// Use GraphQL subscriptions or polling
const { data, refetch } = useQuery(GAME_STATE_QUERY, {
  pollInterval: 1000, // Poll every second
});

// Or use Linera notifications (when available)
client.subscribeToChain(chainId, (notification) => {
  refetch(); // Refresh state on new blocks
});
```

### NPC Agent Integration

The NPC agent needs to sign operations with a player wallet:

```javascript
// npc_agent/agent.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function submitOperation(operation) {
  const operationJson = JSON.stringify(operation);
  const command = `linera execute-operation \
    --application-id ${APP_ID} \
    --operation '${operationJson}'`;
  
  const { stdout, stderr } = await execAsync(command);
  return JSON.parse(stdout);
}

async function playMove(gameState) {
  const move = chooseBestMove(gameState);
  await submitOperation({
    MakeMove: {
      game_chain: gameState.chainId,
      move_data: move
    }
  });
}
```

### Testing the Full Flow

1. **Start local network**:
```bash
linera net up --with-faucet --faucet-port 8080
```

2. **Create two wallets** (for two players):
```bash
# Terminal 1 - Player 1
export LINERA_WALLET="$PWD/wallet1.json"
export LINERA_STORAGE="rocksdb:$PWD/wallet1.db"
linera wallet init --faucet http://localhost:8080

# Terminal 2 - Player 2
export LINERA_WALLET="$PWD/wallet2.json"
export LINERA_STORAGE="rocksdb:$PWD/wallet2.db"
linera wallet init --faucet http://localhost:8080
```

3. **Deploy application** (from Player 1):
```bash
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/game_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/game_service.wasm \
  --json-argument '{"players": [], "seed": 42}'
```

4. **Both players join** by executing operations:
```bash
# Player 1
linera execute-operation \
  --application-id <app-id> \
  --operation '{"RequestMatch": {"tournament_id": "<chain-id>", "params": {"max_players": 2, "board_size": 10}}}'

# Player 2 (with their wallet)
linera execute-operation \
  --application-id <app-id> \
  --operation '{"RequestMatch": {"tournament_id": "<chain-id>", "params": {"max_players": 2, "board_size": 10}}}'
```

5. **Start service and frontend**:
```bash
# Terminal 3 - Service
linera service --port 8080

# Terminal 4 - Frontend
cd frontend
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/chains/<chain-id>/applications/<app-id> npm run dev
```

6. **Submit moves** using the frontend → HTTP proxy → linera CLI flow.

### Known Limitations

1. **No Direct GraphQL Mutations**: Linera services are read-only. Operations must go through the client.
2. **Wallet Management**: Frontend needs access to user's private key or wallet to sign operations.
3. **Real-time Updates**: Currently requires polling or manual refetch. Native subscriptions coming in future SDK versions.
4. **Browser Wallet**: For production, need browser extension or WalletConnect integration.

### Recommended Next Steps

1. Create HTTP proxy server (`backend-proxy/server.js`) that wraps `linera` CLI
2. Update frontend to call proxy for mutations
3. Add GraphQL query integration to fetch live state
4. Implement polling or subscription for real-time updates
5. Add wallet connection UI (when browser wallets become available)
6. Test end-to-end flow with two player wallets

### Reference

- [Linera SDK Documentation](https://docs.linera.io)
- [GraphQL Service Examples](https://github.com/linera-io/linera-protocol/tree/main/examples)
- [Wallet Integration Guide](https://docs.linera.io/wallet)

---

**Note**: This implementation provides the complete smart contract logic and UI framework. The integration layer (operation submission) is documented here because it depends on the client runtime, which varies based on deployment environment (CLI, browser wallet, mobile app, etc.).
