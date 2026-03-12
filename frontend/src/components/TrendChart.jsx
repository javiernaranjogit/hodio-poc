import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TrendChart({ data = [] }) {
  const byDate = {};
  for (const row of data) {
    const key = row.source_name || row.source;
    if (!key) continue;
    if (!byDate[row.date]) byDate[row.date] = { date: row.date };
    byDate[row.date][key] = Math.round(parseFloat(row.avg_score) || 0);
  }
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  const sources = [...new Set(data.map((d) => d.source_name || d.source).filter(Boolean))];

  return (
    <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Evolución (últimos 7 días)
      </h3>

      {chartData.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-8">Sin datos de tendencias</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#555"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => d?.slice(5) || ''}
              />
              <YAxis stroke="#555" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#9ca3af' }}
                labelFormatter={(d) => d}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              {sources.map((src, i) => (
                <Line
                  key={src}
                  type="monotone"
                  dataKey={src}
                  name={src}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
