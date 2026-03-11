import axios from 'axios';
import cheerio from 'cheerio';

// 10 medios españoles cubriendo todo el espectro ideológico
const MEDIA_SOURCES = [
  // Centro-izquierda
  { name: 'elpais', label: 'El País', url: 'https://elpais.com', selectors: ['h2.c_t', 'h3.c_t'] },
  { name: 'eldiario', label: 'elDiario.es', url: 'https://www.eldiario.es', selectors: ['h2.ni-title'] },
  { name: 'publico', label: 'Público', url: 'https://www.publico.es', selectors: ['article h2.title'] },

  // Centro
  { name: 'elmundo', label: 'El Mundo', url: 'https://www.elmundo.es', selectors: ['.ue-c-cover-content__headline'] },
  { name: '20minutos', label: '20 Minutos', url: 'https://www.20minutos.es', selectors: ['h2.c-article__title'] },
  { name: 'lavanguardia', label: 'La Vanguardia', url: 'https://www.lavanguardia.com', selectors: ['h2.title'] },
  { name: 'elconfidencial', label: 'El Confidencial', url: 'https://www.elconfidencial.com', selectors: ['.titleArticleEditable'] },

  // Centro-derecha / Derecha
  { name: 'abc', label: 'ABC', url: 'https://www.abc.es', selectors: ['h2.v-a-t'] },
  { name: 'libertaddigital', label: 'Libertad Digital', url: 'https://www.libertaddigital.com', selectors: ['article header h2'] },
  { name: 'okdiario', label: 'OKDiario', url: 'https://www.okdiario.com', selectors: ['h2.segmento-title'] },
];

const SCRAPE_TIMEOUT = 15000;
const MAX_HEADLINES_PER_SOURCE = 25;

export function getMediaSources() {
  return MEDIA_SOURCES.map(s => ({ name: s.name, label: s.label, url: s.url }));
}

export async function scrapeHeadlines(sourceFilter = null) {
  const sources = sourceFilter
    ? MEDIA_SOURCES.filter(s => sourceFilter.includes(s.name))
    : MEDIA_SOURCES;

  // Scrape all sources in parallel
  const results = await Promise.allSettled(
    sources.map(source => scrapeSource(source))
  );

  const allHeadlines = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      allHeadlines.push(...results[i].value);
    } else {
      console.error(`[Scraper] Error en ${sources[i].name}:`, results[i].reason?.message);
    }
  }

  console.log(`[Scraper] Total titulares recopilados: ${allHeadlines.length}`);
  return allHeadlines;
}

async function scrapeSource(source) {
  const response = await axios.get(source.url, {
    timeout: SCRAPE_TIMEOUT,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-ES,es;q=0.9',
    }
  });

  const $ = cheerio.load(response.data);
  const headlines = [];
  const seen = new Set();

  for (const selector of source.selectors) {
    $(selector).each((i, el) => {
      if (headlines.length >= MAX_HEADLINES_PER_SOURCE) return false;

      // Get text — handle both direct text and nested <a> text
      let text = $(el).text().trim();
      if (!text) text = $(el).find('a').first().text().trim();

      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();

      // Skip too short, duplicates, or navigation-like text
      if (!text || text.length < 20 || seen.has(text)) return;
      seen.add(text);

      // Get URL if available
      let href = $(el).find('a').attr('href') || $(el).closest('a').attr('href') || '';
      if (href && !href.startsWith('http')) {
        try { href = new URL(href, source.url).toString(); } catch { href = source.url; }
      }

      headlines.push({
        source: source.name,
        sourceLabel: source.label,
        text,
        author: source.name,
        url: href || source.url,
        timestamp: new Date().toISOString()
      });
    });
  }

  console.log(`[Scraper] ${source.label}: ${headlines.length} titulares`);
  return headlines;
}

// Scrape a single source by name
export async function scrapeSingle(sourceName) {
  const source = MEDIA_SOURCES.find(s => s.name === sourceName);
  if (!source) throw new Error(`Fuente desconocida: ${sourceName}`);
  return scrapeSource(source);
}

export default { scrapeHeadlines, scrapeSingle, getMediaSources };
