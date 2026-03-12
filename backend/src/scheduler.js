import cron from 'node-cron';
import { fetchAllRssSources } from './sources/rss.js';
import { getDb, upsertDailyStat } from './db.js';

export function startScheduler() {
  // RSS fetch every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('[Scheduler] RSS fetch...');
      const count = await fetchAllRssSources();
      console.log(`[Scheduler] RSS: ${count} new items`);
    } catch (err) {
      console.error('[Scheduler] RSS error:', err.message);
    }
  });

  // Regenerate daily_stats every 60 minutes
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Scheduler] Regenerating daily stats...');
      regenerateDailyStats();
      console.log('[Scheduler] Daily stats done');
    } catch (err) {
      console.error('[Scheduler] Stats error:', err.message);
    }
  });

  // Run RSS fetch immediately on startup
  (async () => {
    try {
      console.log('[Scheduler] Initial RSS fetch on startup...');
      const count = await fetchAllRssSources();
      console.log(`[Scheduler] Initial RSS: ${count} new items`);
    } catch (err) {
      console.error('[Scheduler] Initial RSS error:', err.message);
    }
  })();

  console.log('[Scheduler] RSS: every 30 min | Stats: every 60 min');
}

function regenerateDailyStats() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      date(fetched_at) as date,
      source_name,
      AVG(hate_score) as avg_score,
      COUNT(*) as item_count,
      SUM(CASE WHEN category = 'hate_speech' THEN 1 ELSE 0 END) as hate_count,
      SUM(CASE WHEN category = 'polarization' THEN 1 ELSE 0 END) as polarization_count
    FROM content_items
    WHERE hate_score IS NOT NULL AND source_name IS NOT NULL
    GROUP BY date(fetched_at), source_name
  `).all();

  for (const r of rows) {
    upsertDailyStat(
      r.date,
      r.source_name,
      r.avg_score,
      r.item_count,
      r.hate_count || 0,
      r.polarization_count || 0
    );
  }
}
