import { LineChart, Line, ResponsiveContainer } from 'recharts';

function scoreColor(score) {
  if (score < 30) return 'text-green-400';
  if (score < 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBg(score) {
  if (score < 30) return 'bg-green-500/10 border-green-500/20';
  if (score < 60) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

const SOURCE_LABELS = {
  // Redes sociales
  twitter: { name: 'X / Twitter', icon: '🐦' },
  x_twitter: { name: 'X / Twitter', icon: '🐦' },
  instagram: { name: 'Instagram', icon: '📸' },
  tiktok: { name: 'TikTok', icon: '🎵' },
  youtube: { name: 'YouTube', icon: '▶️' },
  facebook: { name: 'Facebook', icon: '👤' },
  reddit: { name: 'Reddit', icon: '💬' },
  // Noticias
  google_news: { name: 'Google News', icon: '🔍' },
  elpais: { name: 'El País', icon: '📰' },
  elmundo: { name: 'El Mundo', icon: '📰' },
  abc: { name: 'ABC', icon: '📰' },
  '20minutos': { name: '20 Minutos', icon: '📰' },
  lavanguardia: { name: 'La Vanguardia', icon: '📰' },
  elconfidencial: { name: 'El Confidencial', icon: '📰' },
  eldiario: { name: 'elDiario.es', icon: '📰' },
  publico: { name: 'Público', icon: '📰' },
  libertaddigital: { name: 'Libertad Digital', icon: '📰' },
  okdiario: { name: 'OKDiario', icon: '📰' },
};

export default function SourceCard({ source, avgScore, contentCount, trendData }) {
  const info = SOURCE_LABELS[source] || { name: source, icon: '📊' };
  const score = Math.round(avgScore || 0);

  return (
    <div className={`rounded-xl border p-4 ${scoreBg(score)} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{info.icon}</span>
          <span className="font-semibold text-sm">{info.name}</span>
        </div>
        <span className="text-xs text-gray-500">{contentCount || 0} items</span>
      </div>

      <div className={`text-3xl font-bold ${scoreColor(score)}`}>
        {score}
      </div>

      {trendData && trendData.length > 1 && (
        <div className="h-10 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line
                type="monotone"
                dataKey="avg_score"
                stroke={score >= 60 ? '#ef4444' : score >= 30 ? '#eab308' : '#22c55e'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
