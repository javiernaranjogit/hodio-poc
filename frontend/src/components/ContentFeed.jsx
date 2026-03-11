function categoryBadge(category) {
  const styles = {
    odio_directo: 'bg-red-500/20 text-red-400 border-red-500/30',
    amplificacion: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    polarizador: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    discutible: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    neutro: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    contra_odio: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return styles[category] || styles.neutro;
}

function scoreColor(score) {
  if (score < 30) return 'text-green-400';
  if (score < 60) return 'text-yellow-400';
  return 'text-red-400';
}

const SOURCE_LABELS = {
  twitter: '🐦 X', x_twitter: '🐦 X',
  instagram: '📸 Instagram', tiktok: '🎵 TikTok',
  youtube: '▶️ YouTube', facebook: '👤 Facebook',
  reddit: '💬 Reddit', google_news: '🔍 GNews',
  elpais: '📰 El País', elmundo: '📰 El Mundo',
  abc: '📰 ABC', '20minutos': '📰 20min',
  lavanguardia: '📰 LaVanguardia', elconfidencial: '📰 ElConfidencial',
  eldiario: '📰 elDiario', publico: '📰 Público',
  libertaddigital: '📰 LibDigital', okdiario: '📰 OKDiario',
};

export default function ContentFeed({ items = [] }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        📡 Feed en Tiempo Real
      </h3>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-4">Sin contenido</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors slide-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                      {SOURCE_LABELS[item.source] || item.source}
                    </span>
                    {item.author && (
                      <span className="text-xs text-gray-600">@{item.author}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{item.text}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-lg font-bold ${scoreColor(item.hate_score)}`}>
                    {Math.round(item.hate_score)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryBadge(item.category)}`}>
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
