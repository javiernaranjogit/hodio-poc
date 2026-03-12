import { useState } from 'react';

const CATEGORY_LABELS = {
  hate_speech: 'Odio',
  polarization: 'Polarización',
  political_criticism: 'Crítica política',
  neutral: 'Neutral',
};

function categoryBadge(category) {
  const styles = {
    hate_speech: 'bg-red-500/20 text-red-400 border-red-500/30',
    polarization: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    political_criticism: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return styles[category] || styles.neutral;
}

function scoreBadgeColor(score) {
  if (score == null) return 'bg-gray-600/30 text-gray-500';
  if (score < 30) return 'bg-green-500/20 text-green-400';
  if (score < 60) return 'bg-yellow-500/20 text-yellow-400';
  if (score < 80) return 'bg-orange-500/20 text-orange-400';
  return 'bg-red-500/20 text-red-400';
}

function sourceIcon(type) {
  if (type === 'rss') return '📰';
  if (type === 'twitter') return '🐦';
  if (type === 'manual') return '✏️';
  return '🔗';
}

export default function ContentFeed({ items = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Feed de contenido analizado
      </h3>

      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">Sin contenido</p>
        ) : (
          items.map((item) => {
            const isExpanded = expandedId === item.id;
            let targets = [];
            try {
              targets = typeof item.targets === 'string' ? JSON.parse(item.targets || '[]') : (item.targets || []);
            } catch (_) {}

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">
                        {sourceIcon(item.source_type)} {item.source_name || 'Manual'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {item.fetched_at ? new Date(item.fetched_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">
                      {item.text}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${scoreBadgeColor(item.hate_score)}`}>
                      {item.hate_score != null ? item.hate_score : '—'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryBadge(item.category)}`}>
                      {CATEGORY_LABELS[item.category] || item.category || '—'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-700 text-sm">
                    <p className="text-gray-300 whitespace-pre-wrap">{item.text}</p>
                    {targets.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Objetivos: {targets.join(', ')}</p>
                    )}
                    {item.reasoning && (
                      <p className="text-xs text-gray-400 mt-1 italic">{item.reasoning}</p>
                    )}
                    {item.url && !item.url.startsWith('hash:') && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline mt-1 block">
                        Ver original
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
