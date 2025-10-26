import { GraphQLClient, gql } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql';
const POLL_INTERVAL = 2000;

const client = new GraphQLClient(GRAPHQL_ENDPOINT);

const GAME_STATE_QUERY = gql`
  query GameState {
    gameState {
      players
      turnIndex
      board {
        units {
          owner
          unitType
          position {
            x
            y
          }
          hp
        }
        size
      }
      result {
        __typename
        ... on Victory {
          winner
        }
      }
    }
  }
`;

const SUBMIT_MOVE_MUTATION = gql`
  mutation SubmitMove($moveData: MoveInput!) {
    submitMove(moveData: $moveData)
  }
`;

class ChainClashAgent {
  constructor() {
    this.playerId = 'bot_player';
    this.running = true;
  }

  evaluatePosition(gameState) {
    const myUnits = gameState.board.units.filter(u => u.owner === this.playerId);
    const enemyUnits = gameState.board.units.filter(u => u.owner !== this.playerId);
    
    let score = 0;
    score += myUnits.length * 50;
    score += myUnits.reduce((sum, u) => sum + u.hp, 0);
    score -= enemyUnits.length * 50;
    score -= enemyUnits.reduce((sum, u) => sum + u.hp, 0);
    
    return score;
  }

  minimax(gameState, depth, isMaximizing) {
    if (depth === 0 || gameState.result) {
      return this.evaluatePosition(gameState);
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      const moves = this.generatePossibleMoves(gameState, this.playerId);
      
      for (const move of moves) {
        const newState = this.simulateMove(gameState, move);
        const score = this.minimax(newState, depth - 1, false);
        maxScore = Math.max(maxScore, score);
      }
      
      return maxScore;
    } else {
      let minScore = Infinity;
      const enemyId = gameState.players.find(p => p !== this.playerId);
      const moves = this.generatePossibleMoves(gameState, enemyId);
      
      for (const move of moves) {
        const newState = this.simulateMove(gameState, move);
        const score = this.minimax(newState, depth - 1, true);
        minScore = Math.min(minScore, score);
      }
      
      return minScore;
    }
  }

  generatePossibleMoves(gameState, playerId) {
    const moves = [];
    const myUnits = gameState.board.units.filter(u => u.owner === playerId);
    
    for (const unit of myUnits) {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const newX = unit.position.x + dx;
          const newY = unit.position.y + dy;
          
          if (newX >= 0 && newX < gameState.board.size && 
              newY >= 0 && newY < gameState.board.size) {
            const targetUnit = gameState.board.units.find(
              u => u.position.x === newX && u.position.y === newY
            );
            
            if (!targetUnit) {
              moves.push({
                moveType: 'move',
                from_x: unit.position.x,
                from_y: unit.position.y,
                to_x: newX,
                to_y: newY,
              });
            } else if (targetUnit.owner !== playerId && Math.abs(dx) + Math.abs(dy) <= 1) {
              moves.push({
                moveType: 'attack',
                from_x: unit.position.x,
                from_y: unit.position.y,
                to_x: newX,
                to_y: newY,
              });
            }
          }
        }
      }
    }
    
    return moves;
  }

  simulateMove(gameState, move) {
    const newState = JSON.parse(JSON.stringify(gameState));
    return newState;
  }

  chooseBestMove(gameState) {
    const possibleMoves = this.generatePossibleMoves(gameState, this.playerId);
    
    if (possibleMoves.length === 0) {
      return null;
    }

    let bestMove = possibleMoves[0];
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
      const newState = this.simulateMove(gameState, move);
      const score = this.minimax(newState, 2, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  async pollAndPlay() {
    try {
      const data = await client.request(GAME_STATE_QUERY);
      const gameState = data.gameState;

      if (gameState.result) {
        console.log('Game ended:', gameState.result);
        return;
      }

      const currentPlayerIndex = gameState.turnIndex % gameState.players.length;
      const currentPlayer = gameState.players[currentPlayerIndex];

      if (currentPlayer === this.playerId) {
        console.log('Bot turn - thinking...');
        const move = this.chooseBestMove(gameState);
        
        if (move) {
          console.log('Executing move:', move);
          await client.request(SUBMIT_MOVE_MUTATION, { moveData: move });
          console.log('Move submitted successfully');
        } else {
          console.log('No valid moves available');
        }
      }
    } catch (error) {
      console.error('Error during bot operation:', error);
    }
  }

  async start() {
    console.log('Chain Clash NPC Agent starting...');
    console.log(`GraphQL endpoint: ${GRAPHQL_ENDPOINT}`);
    console.log(`Bot Player ID: ${this.playerId}`);
    console.log('Using minimax algorithm for move selection');
    
    while (this.running) {
      await this.pollAndPlay();
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
  }

  stop() {
    this.running = false;
    console.log('Agent stopped');
  }
}

const agent = new ChainClashAgent();

process.on('SIGINT', () => {
  console.log('\\nReceived SIGINT, shutting down gracefully...');
  agent.stop();
  process.exit(0);
});

agent.start().catch(console.error);

export default ChainClashAgent;
