import { Router } from 'express';
import { classifyText, classifyWithAllPresets } from '../classifier.js';
import { PRESETS, PRESET_NAMES, DEMO_TEXTS } from '../presets.js';
import {
  getGlobalStats, getSourceStats, getContentFeed,
  getTopAmplifiers, getTopDefenders, getDailyScores,
  cacheDemoScore, getDemoCached,
  insertContent, insertPresetScore
} from '../db.js';
import { generateManipulationPdf } from '../exportPdf.js';
import { scrapeAll, getAvailableSources, scrapeHeadlines } from '../scrapers/index.js';

const router = Router();

// Global metrics
router.get('/stats', (req, res) => {
  try {
    const stats = getGlobalStats();
    res.json({
      globalHateIndex: Math.round(stats.avg_score || 0),
      totalContent: stats.total_content || 0,
      highHateCount: stats.high_hate_count || 0,
      counterHateCount: stats.counter_hate_count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Per-source scores
router.get('/sources', (req, res) => {
  try {
    const sources = getSourceStats();
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paginated feed
router.get('/feed', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const feed = getContentFeed(page);
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboards
router.get('/amplifiers', (req, res) => {
  try {
    res.json(getTopAmplifiers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/defenders', (req, res) => {
  try {
    res.json(getTopDefenders());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trends
router.get('/trends', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    res.json(getDailyScores(days));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze arbitrary text
router.post('/analyze', async (req, res) => {
  try {
    const { text, preset = 'neutro' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const result = await classifyText(text, preset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze text with specific preset, returns all 5 scores
router.post('/analyze/preset', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const results = await classifyWithAllPresets(text);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List presets
router.get('/presets', (req, res) => {
  const presets = {};
  for (const [key, val] of Object.entries(PRESETS)) {
    presets[key] = {
      name: val.name,
      emoji: val.emoji,
      color: val.color,
      description: val.description,
      systemPrompt: val.systemPrompt
    };
  }
  res.json(presets);
});

// Demo texts with all preset scores
router.get('/demo/texts', async (req, res) => {
  try {
    const texts = DEMO_TEXTS.map(dt => {
      const scores = {};
      for (const presetName of PRESET_NAMES) {
        const cached = getDemoCached(dt.id, presetName);
        if (cached) {
          scores[presetName] = { score: cached.score, category: cached.category, reasoning: cached.reasoning };
        } else {
          scores[presetName] = dt.expectedScores[presetName];
        }
      }
      return { id: dt.id, text: dt.text, scores };
    });
    res.json(texts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Classify demo texts with Claude (if API available) and cache
router.post('/demo/classify', async (req, res) => {
  try {
    const results = [];
    for (const dt of DEMO_TEXTS) {
      const textResults = { id: dt.id, text: dt.text, scores: {} };
      for (const presetName of PRESET_NAMES) {
        const result = await classifyText(dt.text, presetName);
        cacheDemoScore(dt.id, presetName, result.score, result.category, result.reasoning);
        textResults.scores[presetName] = result;
      }
      results.push(textResults);
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live scrape — fetch from all sources or specific ones
router.get('/scrape', async (req, res) => {
  try {
    const sources = req.query.sources ? req.query.sources.split(',') : null;
    const items = await scrapeAll(sources);
    res.json({
      count: items.length,
      sources: [...new Set(items.map(h => h.source))],
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scrape + classify + store — full pipeline
router.post('/scrape/analyze', async (req, res) => {
  try {
    const { sources: sourceFilter, preset = 'neutro', limit = 30 } = req.body;
    const items = await scrapeAll(sourceFilter);
    const toAnalyze = items.slice(0, limit);

    const results = [];
    for (const item of toAnalyze) {
      const classification = await classifyText(item.text, preset);

      const inserted = insertContent({
        source: item.source,
        text: item.text,
        author: item.author,
        url: item.url,
        timestamp: item.timestamp,
        hate_score: classification.score,
        category: classification.category,
        targets: classification.targets,
        preset_used: preset,
        confidence: classification.confidence
      });

      insertPresetScore(inserted.lastInsertRowid, preset, classification.score, classification.category);

      results.push({
        ...item,
        classification
      });
    }

    res.json({
      analyzed: results.length,
      totalScraped: items.length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit manual content (tweet, post, etc.) — classify + store
router.post('/submit', async (req, res) => {
  try {
    const { text, url, author, source = 'x_twitter', preset = 'neutro' } = req.body;
    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Texto demasiado corto (mínimo 5 caracteres)' });
    }

    const classification = await classifyText(text.trim(), preset);

    const inserted = insertContent({
      source,
      text: text.trim(),
      author: author || 'manual',
      url: url || '',
      timestamp: new Date().toISOString(),
      hate_score: classification.score,
      category: classification.category,
      targets: classification.targets,
      preset_used: preset,
      confidence: classification.confidence
    });

    insertPresetScore(inserted.lastInsertRowid, preset, classification.score, classification.category);

    res.json({
      id: inserted.lastInsertRowid,
      text: text.trim(),
      source,
      author: author || 'manual',
      url: url || '',
      classification
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all available platforms/sources
router.get('/platforms', (req, res) => {
  res.json(getAvailableSources());
});

// PDF export
router.post('/export/pdf', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=hodio-evidencia-manipulacion.pdf');
    generateManipulationPdf(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
