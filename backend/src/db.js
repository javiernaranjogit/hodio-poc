import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'hodio.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      content_id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      text TEXT NOT NULL,
      author TEXT,
      url TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      hate_score REAL DEFAULT 0,
      category TEXT DEFAULT 'neutro',
      targets TEXT DEFAULT '[]',
      preset_used TEXT DEFAULT 'neutro',
      confidence REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS preset_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      preset_name TEXT NOT NULL,
      score REAL NOT NULL,
      category TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (content_id) REFERENCES content(content_id)
    );

    CREATE TABLE IF NOT EXISTS demo_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text_id TEXT NOT NULL,
      preset_name TEXT NOT NULL,
      score REAL NOT NULL,
      category TEXT NOT NULL,
      reasoning TEXT,
      cached_at TEXT DEFAULT (datetime('now')),
      UNIQUE(text_id, preset_name)
    );

    CREATE TABLE IF NOT EXISTS daily_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      date TEXT NOT NULL,
      avg_score REAL NOT NULL,
      content_count INTEGER DEFAULT 0,
      UNIQUE(source, date)
    );
  `);
}

export function insertContent(item) {
  const stmt = getDb().prepare(`
    INSERT INTO content (source, text, author, url, timestamp, hate_score, category, targets, preset_used, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    item.source, item.text, item.author, item.url,
    item.timestamp || new Date().toISOString(),
    item.hate_score || 0, item.category || 'neutro',
    JSON.stringify(item.targets || []), item.preset_used || 'neutro',
    item.confidence || 0
  );
}

export function insertPresetScore(contentId, presetName, score, category) {
  const stmt = getDb().prepare(`
    INSERT INTO preset_scores (content_id, preset_name, score, category)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(contentId, presetName, score, category);
}

export function cacheDemoScore(textId, presetName, score, category, reasoning) {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO demo_cache (text_id, preset_name, score, category, reasoning)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(textId, presetName, score, category, reasoning || '');
}

export function getDemoCached(textId, presetName) {
  return getDb().prepare(
    'SELECT * FROM demo_cache WHERE text_id = ? AND preset_name = ?'
  ).get(textId, presetName);
}

export function getContentFeed(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return getDb().prepare(
    'SELECT * FROM content ORDER BY timestamp DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);
}

export function getGlobalStats() {
  const row = getDb().prepare(`
    SELECT
      AVG(hate_score) as avg_score,
      COUNT(*) as total_content,
      SUM(CASE WHEN hate_score > 60 THEN 1 ELSE 0 END) as high_hate_count,
      SUM(CASE WHEN category = 'contra_odio' THEN 1 ELSE 0 END) as counter_hate_count
    FROM content
  `).get();
  return row;
}

export function getSourceStats() {
  return getDb().prepare(`
    SELECT
      source,
      AVG(hate_score) as avg_score,
      COUNT(*) as content_count,
      MAX(timestamp) as last_update
    FROM content
    GROUP BY source
    ORDER BY avg_score DESC
  `).all();
}

export function getTopAmplifiers(limit = 10) {
  return getDb().prepare(`
    SELECT
      author,
      source,
      AVG(hate_score) as avg_score,
      COUNT(*) as content_count,
      MAX(hate_score) as max_score
    FROM content
    WHERE author IS NOT NULL AND hate_score > 40
    GROUP BY author
    ORDER BY avg_score DESC
    LIMIT ?
  `).all(limit);
}

export function getTopDefenders(limit = 10) {
  return getDb().prepare(`
    SELECT
      author,
      source,
      AVG(hate_score) as avg_score,
      COUNT(*) as content_count,
      SUM(CASE WHEN category = 'contra_odio' THEN 1 ELSE 0 END) as counter_count
    FROM content
    WHERE author IS NOT NULL
    GROUP BY author
    HAVING avg_score < 30
    ORDER BY counter_count DESC, avg_score ASC
    LIMIT ?
  `).all(limit);
}

export function getDailyScores(days = 7) {
  return getDb().prepare(`
    SELECT * FROM daily_scores
    WHERE date >= date('now', '-' || ? || ' days')
    ORDER BY date ASC, source ASC
  `).all(days);
}

export function insertDailyScore(source, date, avgScore, count) {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO daily_scores (source, date, avg_score, content_count)
    VALUES (?, ?, ?, ?)
  `);
  return stmt.run(source, date, avgScore, count);
}

export default { getDb, insertContent, getContentFeed, getGlobalStats, getSourceStats };
