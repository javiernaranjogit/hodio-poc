function scoreColor(score) {
  if (score < 30) return 'text-green-400';
  if (score < 60) return 'text-yellow-400';
  return 'text-red-400';
}

export default function LeaderboardTable({ title, data = [], type = 'amplifier' }) {
  const isAmplifier = type === 'amplifier';

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        {isAmplifier ? '🔥' : '🛡️'} {title}
      </h3>

      {data.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-4">Sin datos</p>
      ) : (
        <div className="space-y-2">
          {data.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-xs font-mono w-5">#{i + 1}</span>
                <div>
                  <span className="text-sm font-medium">@{item.author}</span>
                  <span className="text-xs text-gray-500 ml-2">{item.source}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{item.content_count} posts</span>
                <span className={`text-lg font-bold ${scoreColor(Math.round(item.avg_score))}`}>
                  {Math.round(isAmplifier ? item.avg_score : (item.counter_count || 0))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
