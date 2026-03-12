import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { startScheduler } from './scheduler.js';
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Serve static frontend build (when built)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

// SPA fallback (serves built frontend when dist exists)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Frontend not built. Run: cd frontend && npm run build' });
  });
});

// Initialize DB
getDb();

// Start scheduler
startScheduler();

app.listen(PORT, () => {
  console.log(`HODIO backend running on http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
