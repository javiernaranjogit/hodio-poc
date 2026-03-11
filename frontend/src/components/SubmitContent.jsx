import { useState } from 'react';
import { api } from '../api';

const SOURCE_OPTIONS = [
  { value: 'x_twitter', label: 'X / Twitter', emoji: '🐦' },
  { value: 'instagram', label: 'Instagram', emoji: '📸' },
  { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { value: 'youtube', label: 'YouTube', emoji: '▶️' },
  { value: 'facebook', label: 'Facebook', emoji: '👤' },
  { value: 'reddit', label: 'Reddit', emoji: '🤖' },
  { value: 'other', label: 'Otro', emoji: '🌐' },
];

export default function SubmitContent({ onSubmitted }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('x_twitter');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 5) {
      setError('Escribe al menos 5 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.submitContent(text.trim(), {
        url: url.trim() || undefined,
        author: author.trim() || undefined,
        source,
      });
      setResult(res);
      onSubmitted?.(res);
      // Clear form after success
      setText('');
      setUrl('');
      setAuthor('');
    } catch (err) {
      setError(err.message || 'Error al clasificar');
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (s) => s > 60 ? 'text-red-400' : s > 30 ? 'text-yellow-400' : 'text-green-400';
  const scoreBg = (s) => s > 60 ? 'bg-red-900/30 border-red-800/50' : s > 30 ? 'bg-yellow-900/30 border-yellow-800/50' : 'bg-green-900/30 border-green-800/50';

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-white/5">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">
        Enviar contenido manualmente
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Pega un tweet, post o texto cualquiera. HODIO lo clasificará y lo añadirá al feed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Text */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí el texto del tweet o publicación..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-800 resize-none"
        />

        {/* URL + Author row */}
        <div className="grid grid-cols-2 gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL del tweet (opcional)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-800"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Autor / @usuario (opcional)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-800"
          />
        </div>

        {/* Source selector */}
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSource(opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                source === opt.value
                  ? 'bg-red-900/40 text-red-300 border border-red-700/50'
                  : 'bg-gray-800 text-gray-500 border border-gray-700 hover:bg-gray-750'
              }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || text.trim().length < 5}
          className="w-full bg-red-900/40 hover:bg-red-900/60 disabled:opacity-40 disabled:cursor-not-allowed text-red-200 font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          {loading ? 'Clasificando...' : 'Clasificar y añadir al feed'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`mt-3 rounded-lg border px-4 py-3 ${scoreBg(result.classification.score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Resultado</span>
              <div className={`text-3xl font-bold ${scoreColor(result.classification.score)}`}>
                {result.classification.score}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {result.classification.category?.replace('_', ' ')}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 max-w-[200px]">
              {result.classification.reasoning && (
                <p className="line-clamp-3">{result.classification.reasoning}</p>
              )}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-600">
            Añadido al feed como {SOURCE_OPTIONS.find(s => s.value === result.source)?.label || result.source}
            {result.author !== 'manual' && ` por @${result.author}`}
          </div>
        </div>
      )}
    </div>
  );
}
