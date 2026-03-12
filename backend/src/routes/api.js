import { Router } from 'express';
import {
  getDb,
  getContentCount,
  getContentItems,
  getContentItemById,
  getStatsOverview,
  getDailyStats,
  getAllSources,
  addSource,
  toggleSource,
} from '../db.js';
import { processManualSubmission } from '../sources/manual.js';
import { fetchAllRssSources } from '../sources/rss.js';

const router = Router();

// GET /api/health
router.get('/health', (req, res) => {
  try {
    const db = getDb();
    const items = getContentCount();
    res.json({ status: 'ok', db: 'connected', items });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'error', items: 0 });
  }
});

// GET /api/items?limit=50&offset=0
router.get('/items', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const items = getContentItems(limit, offset);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/:id
router.get('/items/:id', (req, res) => {
  try {
    const item = getContentItemById(parseInt(req.params.id, 10));
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/overview
router.get('/stats/overview', (req, res) => {
  try {
    res.json(getStatsOverview());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/trend?days=7
router.get('/stats/trend', (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    res.json(getDailyStats(days));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sources
router.get('/sources', (req, res) => {
  try {
    res.json(getAllSources());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sources
router.post('/sources', (req, res) => {
  try {
    const { name, type, url } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'name and type required' });
    if (!['rss', 'scraper', 'twitter', 'manual'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    if ((type === 'rss' || type === 'scraper') && !url) {
      return res.status(400).json({ error: 'url required for rss/scraper' });
    }
    const result = addSource(name, type, url || null);
    res.status(201).json({ id: result.lastInsertRowid, name, type, url: url || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sources/:id/toggle
router.put('/sources/:id/toggle', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newActive = toggleSource(id);
    if (newActive === null) return res.status(404).json({ error: 'Source not found' });
    res.json({ id, active: newActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text required' });
    }
    if (text.trim().length < 50) {
      return res.status(400).json({ error: 'Mínimo 50 caracteres' });
    }
    const result = await processManualSubmission(text);
    if (result.duplicate) {
      return res.status(409).json({ error: 'Texto duplicado', duplicate: true });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fetch/rss
router.post('/fetch/rss', async (req, res) => {
  try {
    const count = await fetchAllRssSources();
    res.json({ fetched: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
