import { scrapeHeadlines, getMediaSources } from './media.js';
import { scrapeGoogleNews } from './googlenews.js';
import { scrapeReddit } from './reddit.js';
import { scrapeYouTube } from './youtube.js';

// All available scrapers (only sources that work server-side)
const SCRAPERS = {
  medios: { fn: scrapeHeadlines, label: 'Medios de comunicacion', icon: '📰' },
  google_news: { fn: scrapeGoogleNews, label: 'Google News', icon: '🔍' },
  reddit: { fn: scrapeReddit, label: 'Reddit', icon: '💬' },
  youtube: { fn: scrapeYouTube, label: 'YouTube', icon: '▶️' },
};

// Platform categories for the frontend
export const PLATFORMS = [
  { key: 'x_twitter', label: 'X / Twitter', icon: '🐦', color: '#1d9bf0' },
  { key: 'instagram', label: 'Instagram', icon: '📸', color: '#e1306c' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', color: '#010101' },
  { key: 'youtube', label: 'YouTube', icon: '▶️', color: '#ff0000' },
  { key: 'facebook', label: 'Facebook', icon: '👤', color: '#1877f2' },
  { key: 'reddit', label: 'Reddit', icon: '💬', color: '#ff4500' },
  { key: 'google_news', label: 'Google News', icon: '🔍', color: '#4285f4' },
  { key: 'medios', label: 'Medios españoles', icon: '📰', color: '#f59e0b' },
];

/**
 * Scrape all sources in parallel
 * @param {string[]} sourceFilter - optional list of source keys to scrape
 * @returns {Promise<Array>} all scraped items
 */
export async function scrapeAll(sourceFilter = null) {
  const keys = sourceFilter || Object.keys(SCRAPERS);
  const activeScrapers = keys.filter(k => SCRAPERS[k]);

  console.log(`[ScrapeAll] Iniciando scraping de: ${activeScrapers.join(', ')}`);

  const results = await Promise.allSettled(
    activeScrapers.map(async key => {
      const items = await SCRAPERS[key].fn();
      return items.map(item => ({
        ...item,
        // Normalize source field if not set
        source: item.source || key,
        sourceLabel: item.sourceLabel || SCRAPERS[key].label,
      }));
    })
  );

  const allItems = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      allItems.push(...results[i].value);
    } else {
      console.error(`[ScrapeAll] Error en ${activeScrapers[i]}:`, results[i].reason?.message);
    }
  }

  console.log(`[ScrapeAll] Total recopilado: ${allItems.length} items`);
  return allItems;
}

export function getAvailableSources() {
  return PLATFORMS;
}

export { scrapeHeadlines, getMediaSources, scrapeGoogleNews, scrapeReddit, scrapeYouTube };
