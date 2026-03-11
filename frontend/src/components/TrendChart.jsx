import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SOURCE_COLORS = {
  twitter: '#1d9bf0', x_twitter: '#1d9bf0',
  instagram: '#e1306c', tiktok: '#fe2c55',
  youtube: '#ff0000', facebook: '#1877f2',
  reddit: '#ff4500', google_news: '#4285f4',
  elpais: '#e74c3c', elmundo: '#3498db',
  abc: '#f39c12', '20minutos': '#2ecc71',
  lavanguardia: '#1a1a2e', elconfidencial: '#ff6b00',
  eldiario: '#00b894', publico: '#e84393',
  libertaddigital: '#c0392b', okdiario: '#2980b9',
};

export default function TrendChart({ data = [] }) {
  // Pivot data: group by date, one key per source
  const byDate = {};
  for (const row of data) {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date };
    byDate[row.date][row.source] = Math.round(row.avg_score);
  }
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

  const sources = [...new Set(data.map(d => d.source))];

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        📈 Tendencias (últimos 7 días)
      </h3>

      {chartData.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-8">Sin datos de tendencias</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#555"
                tick={{ fontSize: 11 }}
                tickFormatter={d => d.slice(5)}
              />
              <YAxis stroke="#555" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              {sources.map(src => (
                <Line
                  key={src}
                  type="monotone"
                  dataKey={src}
                  name={src}
                  stroke={SOURCE_COLORS[src] || '#888'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
