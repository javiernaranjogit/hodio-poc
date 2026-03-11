import cron from 'node-cron';
import { scrapeAll } from './scrapers/index.js';
import { classifyText, preFilter } from './classifier.js';
import { insertContent, insertPresetScore, insertDailyScore, getDb } from './db.js';

const MAX_API_CALLS_PER_RUN = 10;

export function startScheduler() {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] Iniciando recolección de datos...');
    await collectAndClassify();
  });

  console.log('[Scheduler] Programado: cada 30 minutos');
}

export async function collectAndClassify() {
  let apiCallsUsed = 0;

  try {
    // Scrape all available sources (medios, google news, reddit, youtube, social)
    const allContent = await scrapeAll();
    console.log(`[Scheduler] Recolectados ${allContent.length} items`);

    for (const item of allContent) {
      const needsApi = preFilter(item.text) && apiCallsUsed < MAX_API_CALLS_PER_RUN;

      const result = await classifyText(item.text, 'neutro');
      if (needsApi) apiCallsUsed++;

      const inserted = insertContent({
        ...item,
        hate_score: result.score,
        category: result.category,
        targets: result.targets,
        preset_used: 'neutro',
        confidence: result.confidence
      });

      insertPresetScore(inserted.lastInsertRowid, 'neutro', result.score, result.category);
    }

    updateDailyScores();
    console.log(`[Scheduler] Completado. ${allContent.length} items, ${apiCallsUsed} API calls`);
  } catch (err) {
    console.error('[Scheduler] Error:', err.message);
  }
}

function updateDailyScores() {
  const today = new Date().toISOString().split('T')[0];
  const sources = getDb().prepare(`
    SELECT source, AVG(hate_score) as avg, COUNT(*) as cnt
    FROM content
    WHERE date(timestamp) = date('now')
    GROUP BY source
  `).all();

  for (const s of sources) {
    insertDailyScore(s.source, today, s.avg, s.cnt);
  }
}

export default { startScheduler, collectAndClassify };
