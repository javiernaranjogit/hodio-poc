import axios from 'axios';
import cheerio from 'cheerio';

// Google News RSS feeds for Spanish topics related to hate speech / polarization
const FEEDS = [
  { query: 'discurso+odio+España', label: 'Discurso de odio' },
  { query: 'racismo+España', label: 'Racismo' },
  { query: 'xenofobia+inmigración+España', label: 'Xenofobia' },
  { query: 'homofobia+LGTBi+España', label: 'LGTBfobia' },
  { query: 'polarización+política+España', label: 'Polarización' },
  { query: 'odio+redes+sociales+España', label: 'Odio en redes' },
];

const RSS_BASE = 'https://news.google.com/rss/search';

export async function scrapeGoogleNews(maxPerFeed = 8) {
  const allItems = [];
  const seen = new Set();

  for (const feed of FEEDS) {
    try {
      const url = `${RSS_BASE}?q=${feed.query}&hl=es&gl=ES&ceid=ES:es`;
      const res = await axios.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const $ = cheerio.load(res.data, { xmlMode: true });
      let count = 0;

      $('item').each((i, el) => {
        if (count >= maxPerFeed) return false;

        const title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        const sourceEl = $(el).find('source').text().trim();

        if (!title || title.length < 15 || seen.has(title)) return;
        seen.add(title);

        allItems.push({
          source: 'google_news',
          sourceLabel: 'Google News',
          sourceDetail: sourceEl || feed.label,
          text: title,
          author: sourceEl || 'Google News',
          url: link,
          timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          feedCategory: feed.label
        });
        count++;
      });
    } catch (err) {
      console.error(`[GoogleNews] Error feed "${feed.label}":`, err.message);
    }
  }

  console.log(`[GoogleNews] ${allItems.length} noticias recopiladas`);
  return allItems;
}

export default { scrapeGoogleNews };
