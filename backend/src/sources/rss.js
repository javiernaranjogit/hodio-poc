import Parser from 'rss-parser';
import { getActiveSources, insertContentItem, existsByUrl } from '../db.js';
import { classifyText } from '../classifier.js';

const parser = new Parser();
const MAX_TEXT_LEN = 500;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch and parse RSS feed. Returns array of { text, url, published_at, source_name, source_id }.
 */
export async function fetchRssFeed(source) {
  const items = [];
  try {
    const feed = await parser.parseURL(source.url);
    const sourceName = source.name;
    const sourceId = source.id;

    for (const item of feed.items || []) {
      const title = item.title || '';
      const content = item.contentSnippet || item.content || '';
      const text = `${title} ${content}`.trim().slice(0, MAX_TEXT_LEN);
      const url = item.link || item.guid || null;
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : null;

      if (text.length < 10) continue;

      items.push({
        text,
        url,
        published_at: publishedAt,
        source_name: sourceName,
        source_id: sourceId,
        source_type: 'rss',
      });
    }
  } catch (err) {
    console.error(`[RSS] Error fetching ${source.name}:`, err.message);
  }
  return items;
}

/**
 * Fetch all active RSS sources, deduplicate, insert new items, queue for classification.
 * Classification is async and non-blocking.
 */
export async function fetchAllRssSources() {
  const sources = getActiveSources('rss');
  const allItems = [];

  for (const source of sources) {
    try {
      const items = await fetchRssFeed(source);
      allItems.push(...items);
    } catch (err) {
      console.error(`[RSS] Failed ${source.name}:`, err.message);
    }
  }

  const inserted = [];
  for (const item of allItems) {
    const url = item.url || `hash:${hashText(item.text)}`;
    if (existsByUrl(url)) continue;

    const result = insertContentItem({
      source_id: item.source_id,
      source_name: item.source_name,
      source_type: item.source_type,
      text: item.text,
      url,
      published_at: item.published_at,
    });

    inserted.push({ id: result.lastInsertRowid, ...item });
  }

  // Classify in background (non-blocking)
  if (inserted.length > 0) {
    classifyBatchInBackground(inserted);
  }

  return inserted.length;
}

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
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
      if (i < items.length - 1) {
        await delay(500);
      }
    } catch (err) {
      console.error('[RSS] Classification error:', err.message);
    }
  }
}
