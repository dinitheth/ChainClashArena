import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const APPLICATION_ID = process.env.APPLICATION_ID || '';
const CHAIN_ID = process.env.CHAIN_ID || '';

async function executeLineraOperation(operation) {
  const operationJson = JSON.stringify(operation).replace(/'/g, "'\\''");
  const command = `linera execute-operation --application-id ${APPLICATION_ID} --operation '${operationJson}'`;
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error('Linera stderr:', stderr);
    }
    return { success: true, output: stdout, error: null };
  } catch (error) {
    console.error('Linera execution error:', error);
    return { success: false, output: null, error: error.message };
  }
}

app.post('/api/submit-move', async (req, res) => {
  try {
    const { moveData } = req.body;
    
    const operation = {
      MakeMove: {
        game_chain: CHAIN_ID,
        move_data: moveData
      }
    };
    
    const result = await executeLineraOperation(operation);
    
    if (result.success) {
      res.json({ success: true, message: 'Move submitted successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Submit move error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/create-match', async (req, res) => {
  try {
    const { params } = req.body;
    
    const operation = {
      RequestMatch: {
        tournament_id: CHAIN_ID,
        params: {
          max_players: params.maxPlayers || 2,
          board_size: params.boardSize || 10
        }
      }
    };
    
    const result = await executeLineraOperation(operation);
    
    if (result.success) {
      res.json({ success: true, message: 'Match request submitted' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/surrender', async (req, res) => {
  try {
    const operation = {
      Surrender: {
        game_chain: CHAIN_ID
      }
    };
    
    const result = await executeLineraOperation(operation);
    
    if (result.success) {
      res.json({ success: true, message: 'Surrender submitted' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Surrender error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    applicationId: APPLICATION_ID,
    chainId: CHAIN_ID
  });
});

app.listen(PORT, () => {
  console.log(`Chain Clash Backend Proxy running on port ${PORT}`);
  console.log(`Application ID: ${APPLICATION_ID}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  POST /api/submit-move');
  console.log('  POST /api/create-match');
  console.log('  POST /api/surrender');
  console.log('  GET  /health');
});

export default app;
