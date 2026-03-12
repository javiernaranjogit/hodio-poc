import { insertContentItem, existsByUrl } from '../db.js';
import { classifyText } from '../classifier.js';

const MOCK_TWEETS = [
  {
    text: 'Los inmigrantes nos quitan el trabajo y destruyen nuestra cultura',
    url: 'mock://1',
    published_at: new Date().toISOString(),
  },
  {
    text: 'El presidente es un traidor que vende España a sus amos',
    url: 'mock://2',
    published_at: new Date().toISOString(),
  },
  {
    text: 'Debate necesario sobre políticas de integración y su impacto económico',
    url: 'mock://3',
    published_at: new Date().toISOString(),
  },
  {
    text: 'La oposición ha presentado una propuesta interesante sobre fiscalidad',
    url: 'mock://4',
    published_at: new Date().toISOString(),
  },
  {
    text: 'Muerte a todos los que no piensan como nosotros, esto no puede seguir',
    url: 'mock://5',
    published_at: new Date().toISOString(),
  },
];

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch tweets from X API v2 or return mock data if no bearer token.
 * Never throws — always returns array.
 */
export async function fetchTweets() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token || !token.trim()) {
    return MOCK_TWEETS;
  }

  try {
    const query = encodeURIComponent('(odio OR miedo OR invasión OR traidores) lang:es -is:retweet');
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn('[Twitter] API error:', res.status, '- using mock');
      return MOCK_TWEETS;
    }

    const data = await res.json();
    const tweets = (data.data || []).map((t) => ({
      text: t.text,
      url: `https://twitter.com/i/status/${t.id}`,
      published_at: t.created_at,
    }));
    return tweets.length > 0 ? tweets : MOCK_TWEETS;
  } catch (err) {
    console.warn('[Twitter] Error:', err.message, '- using mock');
    return MOCK_TWEETS;
  }
}

/**
 * Fetch tweets, deduplicate, insert new items, classify in background.
 */
export async function fetchAndStoreTweets() {
  const tweets = await fetchTweets();
  const inserted = [];

  for (const t of tweets) {
    if (existsByUrl(t.url)) continue;

    const result = insertContentItem({
      source_id: null,
      source_name: 'X (Twitter)',
      source_type: 'twitter',
      text: t.text,
      url: t.url,
      published_at: t.published_at,
    });

    inserted.push({ id: result.lastInsertRowid, text: t.text, url: t.url, published_at: t.published_at });
  }

  if (inserted.length > 0) {
    const { updateContentItemClassification } = await import('../db.js');
    for (let i = 0; i < inserted.length; i++) {
      try {
        const item = inserted[i];
        const result = await classifyText(item.text);
        updateContentItemClassification(
          item.id,
          result.hate_score,
          result.category,
          result.targets,
          result.confidence,
          result.reasoning
        );
        if (i < inserted.length - 1) await delay(500);
      } catch (err) {
        console.error('[Twitter] Classification error:', err.message);
      }
    }
  }

  return inserted.length;
}
