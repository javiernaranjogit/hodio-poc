import axios from 'axios';
import cheerio from 'cheerio';

// Scrape YouTube search results page (no API key needed)
// We search for Spanish political/social content and extract titles + metadata

// YouTube RSS feeds — verified channel IDs (RSS 200 OK)
const CHANNEL_FEEDS = [
  { id: 'UCCJs5mITIqxqJGeFjt9N1Mg', label: 'laSexta Noticias' },
  { id: 'UC_Oni82GyYcabEr3rd-eJkg', label: 'Antena 3 Noticias' },
  { id: 'UC7QZIf0dta-XPXsp9Hv4dTw', label: 'RTVE Noticias' },
  { id: 'UCnsvJeZO4RigQ898WdDNoBw', label: 'El Pais' },
];

export async function scrapeYouTube(maxPerChannel = 5) {
  const allItems = [];
  const seen = new Set();

  // Method 1: RSS feeds from news channels (reliable, no auth)
  for (const channel of CHANNEL_FEEDS) {
    try {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      const res = await axios.get(feedUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const $ = cheerio.load(res.data, { xmlMode: true });
      let count = 0;

      $('entry').each((i, el) => {
        if (count >= maxPerChannel) return false;

        const title = $(el).find('title').text().trim();
        const videoId = $(el).find('yt\\:videoId, videoId').text().trim();
        const published = $(el).find('published').text().trim();
        const authorName = $(el).find('author name').text().trim();

        if (!title || title.length < 10 || seen.has(title)) return;
        seen.add(title);

        allItems.push({
          source: 'youtube',
          sourceLabel: 'YouTube',
          sourceDetail: channel.label || authorName,
          text: title,
          author: channel.label || authorName,
          url: videoId ? `https://youtube.com/watch?v=${videoId}` : '',
          timestamp: published ? new Date(published).toISOString() : new Date().toISOString()
        });
        count++;
      });

      console.log(`[YouTube] ${channel.label}: ${count} vídeos`);
    } catch (err) {
      console.error(`[YouTube] Error ${channel.label}:`, err.message);
    }
  }

  console.log(`[YouTube] Total: ${allItems.length} vídeos`);
  return allItems;
}

export default { scrapeYouTube };
