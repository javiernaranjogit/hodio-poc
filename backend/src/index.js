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

app.use(cors());
app.use(express.json());

// Serve static frontend build
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

// API routes
app.use('/api', apiRoutes);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

// Initialize DB
getDb();

// Start scheduler
startScheduler();

app.listen(PORT, () => {
  console.log(`HODIO backend running on http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
