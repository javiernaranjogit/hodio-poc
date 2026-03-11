const BASE = '/api';

async function fetchJson(url, opts) {
  const res = await fetch(`${BASE}${url}`, opts);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getStats: () => fetchJson('/stats'),
  getSources: () => fetchJson('/sources'),
  getFeed: (page = 1) => fetchJson(`/feed?page=${page}`),
  getAmplifiers: () => fetchJson('/amplifiers'),
  getDefenders: () => fetchJson('/defenders'),
  getTrends: (days = 7) => fetchJson(`/trends?days=${days}`),
  getPresets: () => fetchJson('/presets'),
  getDemoTexts: () => fetchJson('/demo/texts'),
  analyze: (text, preset = 'neutro') =>
    fetchJson('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, preset })
    }),
  analyzeAllPresets: (text) =>
    fetchJson('/analyze/preset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }),
  classifyDemo: () =>
    fetchJson('/demo/classify', { method: 'POST' }),
  submitContent: (text, { url, author, source, preset } = {}) =>
    fetchJson('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, url, author, source, preset })
    }),
  exportPdf: () =>
    fetch(`${BASE}/export/pdf`, { method: 'POST' })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hodio-evidencia-manipulacion.pdf';
        a.click();
        URL.revokeObjectURL(url);
      })
};
