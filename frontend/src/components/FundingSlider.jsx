import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const CATEGORIES = ['Discurso político', 'Crítica religiosa', 'Feminismo', 'Antiinmigración', 'Anticorporativo'];

export default function FundingSlider() {
  const [govFunding, setGovFunding] = useState(50);

  const data = useMemo(() => {
    const govBias = govFunding / 100;
    const privBias = 1 - govBias;

    return CATEGORIES.map((cat, i) => {
      // Simulate how funding shifts thresholds
      const baseThreshold = 50;
      const govShifts = [-25, -5, -10, 5, 15]; // Gov lowers political criticism threshold
      const privShifts = [10, 5, 5, 10, -30]; // Corps lower anticorp threshold

      const threshold = Math.round(
        baseThreshold + govShifts[i] * govBias + privShifts[i] * privBias
      );

      return { name: cat, threshold: Math.max(10, Math.min(90, threshold)) };
    });
  }, [govFunding]);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-200 mb-1">💸 Quién paga, quién define</h3>
      <p className="text-xs text-gray-500 mb-6">
        El clasificador de HODIO será financiado por el Gobierno de España
      </p>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>🏛️ 100% Fondos Gubernamentales</span>
          <span>💰 100% Fondos Privados</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={govFunding}
          onChange={e => setGovFunding(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-sm mt-2">
          <span className="text-amber-400 font-bold">{govFunding}% público</span>
          <span className="text-emerald-400 font-bold">{100 - govFunding}% privado</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" domain={[0, 100]} stroke="#555" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" stroke="#555" tick={{ fontSize: 10 }} width={120} />
            <Bar dataKey="threshold" radius={[0, 4, 4, 0]} animationDuration={500}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.threshold > 60 ? '#ef4444' : entry.threshold > 40 ? '#eab308' : '#22c55e'}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-gray-600 text-center mt-2">
        Umbral = puntuación mínima para clasificar como "odio" en cada categoría. Menor umbral = más contenido censurado.
      </p>
    </div>
  );
}
