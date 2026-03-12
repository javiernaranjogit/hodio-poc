const BASE = import.meta.env.VITE_API_URL || '';

async function fetchJson(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getHealth: () => fetchJson('/api/health'),
  getItems: (limit = 50, offset = 0) => fetchJson(`/api/items?limit=${limit}&offset=${offset}`),
  getItem: (id) => fetchJson(`/api/items/${id}`),
  getStatsOverview: () => fetchJson('/api/stats/overview'),
  getStatsTrend: (days = 7) => fetchJson(`/api/stats/trend?days=${days}`),
  getSources: () => fetchJson('/api/sources'),
  addSource: (name, type, url) =>
    fetchJson('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, url }),
    }),
  toggleSource: (id) =>
    fetchJson(`/api/sources/${id}/toggle`, { method: 'PUT' }),
  analyze: (text) =>
    fetchJson('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }),
  fetchRss: () =>
    fetchJson('/api/fetch/rss', { method: 'POST' }),
};
