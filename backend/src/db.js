import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'hodio.db');

let db;

const DEFAULT_SOURCES = [
  { name: 'El País', type: 'rss', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' },
  { name: 'El Mundo', type: 'rss', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml' },
  { name: 'ABC', type: 'rss', url: 'https://www.abc.es/rss/feeds/abc_EspanaEspana.xml' },
  { name: '20 Minutos', type: 'rss', url: 'https://www.20minutos.es/rss/' },
  { name: 'La Vanguardia', type: 'rss', url: 'https://www.lavanguardia.com/rss/home.xml' },
  { name: 'El Español', type: 'rss', url: 'https://www.elespanol.com/rss/' },
];

function ensureDataDir() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getDb() {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedDefaultSources();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('rss', 'scraper', 'twitter', 'manual')),
      url TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER REFERENCES sources(id),
      source_name TEXT,
      source_type TEXT,
      text TEXT NOT NULL,
      url TEXT,
      published_at TEXT,
      fetched_at TEXT DEFAULT (datetime('now')),
      hate_score INTEGER,
      category TEXT,
      targets TEXT,
      confidence REAL,
      reasoning TEXT,
      classified_at TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      source_name TEXT NOT NULL,
      avg_score REAL,
      item_count INTEGER,
      hate_count INTEGER,
      polarization_count INTEGER,
      UNIQUE(date, source_name)
    );

    CREATE INDEX IF NOT EXISTS idx_content_items_url ON content_items(url);
    CREATE INDEX IF NOT EXISTS idx_content_items_fetched ON content_items(fetched_at DESC);
    CREATE INDEX IF NOT EXISTS idx_content_items_source ON content_items(source_id);
  `);
}

function seedDefaultSources() {
  const count = db.prepare('SELECT COUNT(*) as c FROM sources').get();
  if (count.c > 0) return;

  const insert = db.prepare(
    'INSERT INTO sources (name, type, url, active) VALUES (?, ?, ?, 1)'
  );
  for (const s of DEFAULT_SOURCES) {
    insert.run(s.name, s.type, s.url);
  }
  console.log('[DB] Seeded default RSS sources');
}

// --- Sources ---
export function getAllSources() {
  return getDb().prepare('SELECT * FROM sources ORDER BY name').all();
}

export function getActiveSources(type = null) {
  const sql = type
    ? 'SELECT * FROM sources WHERE active = 1 AND type = ? ORDER BY name'
    : 'SELECT * FROM sources WHERE active = 1 ORDER BY name';
  return getDb().prepare(sql).all(type || []);
}

export function addSource(name, type, url) {
  const stmt = getDb().prepare(
    'INSERT INTO sources (name, type, url, active) VALUES (?, ?, ?, 1)'
  );
  return stmt.run(name, type, url);
}

export function toggleSource(id) {
  const row = getDb().prepare('SELECT active FROM sources WHERE id = ?').get(id);
  if (!row) return null;
  const newActive = row.active ? 0 : 1;
  getDb().prepare('UPDATE sources SET active = ? WHERE id = ?').run(newActive, id);
  return newActive;
}

// --- Content items ---
export function insertContentItem(item) {
  const stmt = getDb().prepare(`
    INSERT INTO content_items (source_id, source_name, source_type, text, url, published_at, hate_score, category, targets, confidence, reasoning, classified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    item.source_id ?? null,
    item.source_name ?? null,
    item.source_type ?? null,
    item.text,
    item.url ?? null,
    item.published_at ?? null,
    item.hate_score ?? null,
    item.category ?? null,
    item.targets ? JSON.stringify(item.targets) : null,
    item.confidence ?? null,
    item.reasoning ?? null,
    item.classified_at ?? null
  );
}

export function updateContentItemClassification(id, hate_score, category, targets, confidence, reasoning) {
  return getDb().prepare(`
    UPDATE content_items SET hate_score = ?, category = ?, targets = ?, confidence = ?, reasoning = ?, classified_at = datetime('now')
    WHERE id = ?
  `).run(hate_score, category, JSON.stringify(targets || []), confidence, reasoning, id);
}

export function getContentItemById(id) {
  return getDb().prepare('SELECT * FROM content_items WHERE id = ?').get(id);
}

export function getContentItems(limit = 50, offset = 0) {
  return getDb().prepare(`
    SELECT * FROM content_items ORDER BY fetched_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
}

export function getContentCount() {
  return getDb().prepare('SELECT COUNT(*) as c FROM content_items').get().c;
}

export function existsByUrl(url) {
  if (!url) return false;
  const row = getDb().prepare('SELECT 1 FROM content_items WHERE url = ?').get(url);
  return !!row;
}

export function existsByTextHash(hash) {
  const row = getDb().prepare('SELECT 1 FROM content_items WHERE url = ?').get(`hash:${hash}`);
  return !!row;
}

// --- Daily stats ---
export function getDailyStats(days = 7) {
  return getDb().prepare(`
    SELECT * FROM daily_stats
    WHERE date >= date('now', '-' || ? || ' days')
    ORDER BY date ASC, source_name ASC
  `).all(days);
}

export function upsertDailyStat(date, source_name, avg_score, item_count, hate_count, polarization_count) {
  const stmt = getDb().prepare(`
    INSERT INTO daily_stats (date, source_name, avg_score, item_count, hate_count, polarization_count)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(date, source_name) DO UPDATE SET
      avg_score = excluded.avg_score,
      item_count = excluded.item_count,
      hate_count = excluded.hate_count,
      polarization_count = excluded.polarization_count
  `);
  return stmt.run(date, source_name, avg_score, item_count, hate_count, polarization_count);
}

// --- Stats overview ---
export function getStatsOverview() {
  const total = getDb().prepare(`
    SELECT COUNT(*) as total_items, AVG(hate_score) as avg_score
    FROM content_items WHERE hate_score IS NOT NULL
  `).get();

  const itemsToday = getDb().prepare(`
    SELECT COUNT(*) as c FROM content_items WHERE date(fetched_at) = date('now')
  `).get().c;

  const activeSources = getDb().prepare(`
    SELECT COUNT(*) as c FROM sources WHERE active = 1
  `).get().c;

  const byCategory = getDb().prepare(`
    SELECT category, COUNT(*) as count FROM content_items
    WHERE category IS NOT NULL
    GROUP BY category
  `).all();

  const bySource = getDb().prepare(`
    SELECT source_name, AVG(hate_score) as avg_score, COUNT(*) as count
    FROM content_items
    WHERE source_name IS NOT NULL AND hate_score IS NOT NULL
    GROUP BY source_name
    ORDER BY avg_score DESC
  `).all();

  return {
    total_items: total.total_items || 0,
    avg_score: total.avg_score ? Math.round(total.avg_score * 10) / 10 : 0,
    items_today: itemsToday,
    active_sources: activeSources,
    by_category: Object.fromEntries(byCategory.map(r => [r.category, r.count])),
    by_source: bySource,
  };
}
