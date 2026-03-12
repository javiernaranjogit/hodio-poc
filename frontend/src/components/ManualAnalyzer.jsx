import { useState } from 'react';
import { api } from '../api';
import ScoreGauge from './ScoreGauge';

const MIN_CHARS = 50;

const CATEGORY_LABELS = {
  hate_speech: 'Discurso de odio',
  polarization: 'Polarización',
  political_criticism: 'Crítica política',
  neutral: 'Neutral',
};

function categoryBadge(category) {
  const styles = {
    hate_speech: 'bg-red-500/20 text-red-400 border-red-500/40',
    polarization: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    political_criticism: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  };
  return styles[category] || styles.neutral;
}

export default function ManualAnalyzer({ onAnalyzed }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const canAnalyze = text.trim().length >= MIN_CHARS;

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.analyze(text.trim());
      if (data.duplicate) {
        setError('Este texto ya fue analizado.');
        return;
      }
      setResult(data);
      onAnalyzed?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900/80 rounded-xl p-5 border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Analizar texto manual
      </h3>
      <textarea
        className="w-full h-28 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none text-sm"
        placeholder={`Pega aquí el texto a analizar (mínimo ${MIN_CHARS} caracteres)...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">
          {text.length} / {MIN_CHARS} caracteres
        </span>
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
        >
          {loading ? 'Analizando…' : 'Analizar texto'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {result && !result.duplicate && (
        <div className="mt-4 p-4 rounded-lg bg-gray-800/80 border border-gray-700 animate-[slideIn_0.3s_ease-out]">
          <div className="flex flex-wrap gap-6 items-start">
            <ScoreGauge score={result.hate_score} label="Score" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${categoryBadge(result.category)}`}>
                  {CATEGORY_LABELS[result.category] || result.category}
                </span>
              </div>
              {result.targets?.length > 0 && (
                <p className="text-xs text-gray-400 mb-1">
                  Objetivos: {result.targets.join(', ')}
                </p>
              )}
              <p className="text-sm text-gray-300">{result.reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
