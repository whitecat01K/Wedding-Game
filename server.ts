import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Data storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data dir:', err);
  }
}

// Initial empty leaderboard
const DEFAULT_LEADERBOARD: any[] = [];

function readLeaderboard(): any[] {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const content = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
  }
  return DEFAULT_LEADERBOARD;
}

function writeLeaderboard(data: any[]) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing leaderboard file:', err);
  }
}

// ----------------- API ROUTES -----------------
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// GET /api/leaderboard - 获取所有賓客排行榜
app.get('/api/leaderboard', (req, res) => {
  const list = readLeaderboard();
  const sorted = [...list].sort((a, b) => b.finalScore - a.finalScore);
  res.json({
    success: true,
    totalCount: sorted.length,
    leaderboard: sorted
  });
});

// POST /api/leaderboard - 儲存親友作答結果
app.post('/api/leaderboard', (req, res) => {
  const result = req.body;
  if (!result || !result.playerName || typeof result.finalScore !== 'number') {
    return res.status(400).json({ error: 'Invalid quiz result data' });
  }

  // Ensure tableNumber is not empty
  if (!result.tableNumber || !result.tableNumber.trim()) {
    result.tableNumber = '自由入座 / 現場親友';
  }

  const current = readLeaderboard();
  // Filter out any duplicate submission by same ID
  const updated = [result, ...current.filter((item) => item.id !== result.id)].sort(
    (a, b) => b.finalScore - a.finalScore
  );

  // Keep up to 200 records
  const trimmed = updated.slice(0, 200);
  writeLeaderboard(trimmed);

  res.json({
    success: true,
    message: 'Score submitted successfully',
    totalCount: trimmed.length
  });
});

// DELETE /api/leaderboard - 清空排行榜 (供新人宴席前歸零)
app.delete('/api/leaderboard', (req, res) => {
  writeLeaderboard([]);
  res.json({ success: true, message: 'Leaderboard cleared' });
});

// ----------------- VITE & STATIC FILES -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
