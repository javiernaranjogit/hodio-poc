import { useState, useEffect } from 'react';
import { api } from '../api';

const TYPE_LABELS = { rss: 'RSS', scraper: 'Scraper', twitter: 'X', manual: 'Manual' };

export default function SourceManager() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await api.getSources();
      setSources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(id) {
    try {
      await api.toggleSource(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await api.addSource(newName.trim(), 'rss', newUrl.trim());
      setNewName('');
      setNewUrl('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-sm">Cargando fuentes…</p>;
  }

  return (
    <div className="bg-gray-900/80 rounded-xl p-5 border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Gestión de fuentes
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
        {sources.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50"
          >
            <div className="min-w-0 flex-1">
              <span className="font-medium text-gray-200">{s.name}</span>
              <span className="ml-2 text-xs text-gray-500">{TYPE_LABELS[s.type] || s.type}</span>
              {s.url && (
                <p className="text-xs text-gray-600 truncate mt-0.5">{s.url}</p>
              )}
            </div>
            <button
              onClick={() => handleToggle(s.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                s.active
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  : 'bg-gray-600/20 text-gray-500 hover:bg-gray-600/30'
              }`}
            >
              {s.active ? 'Activa' : 'Inactiva'}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="Nombre (ej: El País)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 text-sm"
        />
        <input
          type="url"
          placeholder="URL del feed RSS"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 text-sm"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim() || !newUrl.trim()}
          className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium"
        >
          {adding ? 'Añadiendo…' : 'Añadir fuente RSS'}
        </button>
      </form>

      <button
        onClick={() => api.fetchRss().then(() => setError(null)).catch((e) => setError(e.message))}
        className="w-full mt-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
      >
        Disparar fetch RSS ahora
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
