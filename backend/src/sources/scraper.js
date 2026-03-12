import axios from 'axios';
import * as cheerio from 'cheerio';
import { getActiveSources, insertContentItem, existsByUrl } from '../db.js';
import { classifyText } from '../classifier.js';

const MAX_TEXT_LEN = 500;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Scrape a single URL and extract text content.
 */
export async function scrapeUrl(url, sourceName, sourceId) {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'HODIO-MVP/1.0 (research)' },
    });
    const $ = cheerio.load(data);
    $('script, style, nav, footer').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT_LEN);
    if (text.length < 50) return null;

    return {
      text,
      url,
      published_at: null,
      source_name: sourceName,
      source_id: sourceId,
      source_type: 'scraper',
    };
  } catch (err) {
    console.error(`[Scraper] Error ${url}:`, err.message);
    return null;
  }
}

/**
 * Scrape all active scraper sources. Each source has a URL to scrape.
 */
export async function fetchAllScraperSources() {
  const sources = getActiveSources('scraper');
  const inserted = [];

  for (const source of sources) {
    if (!source.url) continue;
    try {
      const item = await scrapeUrl(source.url, source.name, source.id);
      if (!item || existsByUrl(item.url)) continue;

      const result = insertContentItem({
        source_id: item.source_id,
        source_name: item.source_name,
        source_type: item.source_type,
        text: item.text,
        url: item.url,
        published_at: item.published_at,
      });

      inserted.push({ id: result.lastInsertRowid, ...item });
    } catch (err) {
      console.error(`[Scraper] Failed ${source.name}:`, err.message);
    }
  }

  if (inserted.length > 0) {
    classifyBatchInBackground(inserted);
  }

  return inserted.length;
}

async function classifyBatchInBackground(items) {
  const { updateContentItemClassification } = await import('../db.js');
  for (let i = 0; i < items.length; i++) {
    try {
      const item = items[i];
      const result = await classifyText(item.text);
      updateContentItemClassification(
        item.id,
        result.hate_score,
        result.category,
        result.targets,
        result.confidence,
        result.reasoning
      );
      if (i < items.length - 1) await delay(500);
    } catch (err) {
      console.error('[Scraper] Classification error:', err.message);
    }
  }
}
