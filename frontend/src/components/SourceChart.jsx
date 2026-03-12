import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function barColor(score) {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#eab308';
  if (score < 80) return '#f97316';
  return '#ef4444';
}

export default function SourceChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.source_name,
    score: Math.round(parseFloat(d.avg_score) || 0),
    count: d.count,
  }));

  return (
    <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Score medio por fuente
      </h3>
      {chartData.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-8">Sin datos</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#555" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" stroke="#555" tick={{ fontSize: 10 }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [`${value}`, 'Score']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
