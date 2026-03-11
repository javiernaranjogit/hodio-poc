import { useState, useEffect } from 'react';

function scoreColor(score) {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#eab308';
  return '#ef4444';
}

function scoreBgClass(score) {
  if (score < 30) return 'bg-green-500/10 border-green-500/20';
  if (score < 60) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

const PRESET_ORDER = ['progresista', 'conservador', 'neutro', 'gubernamental', 'corporativo'];
const PRESET_LABELS = {
  progresista: { emoji: '🔴', short: 'PROG' },
  conservador: { emoji: '🔵', short: 'CONS' },
  neutro: { emoji: '⚖️', short: 'NEUT' },
  gubernamental: { emoji: '🏛️', short: 'GOB' },
  corporativo: { emoji: '💰', short: 'CORP' },
};

export default function TextScoreCard({ id, text, scores = {}, activePreset, large = false }) {
  const current = scores[activePreset] || { score: 0, category: 'neutro' };
  const [displayed, setDisplayed] = useState(current.score);

  useEffect(() => {
    let start = displayed;
    const target = current.score;
    if (start === target) return;
    const step = target > start ? 1 : -1;
    const interval = large ? 15 : 25;
    const timer = setInterval(() => {
      start += step;
      setDisplayed(start);
      if (start === target) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [current.score]);

  const color = scoreColor(displayed);

  return (
    <div className={`rounded-xl border ${scoreBgClass(displayed)} p-${large ? 6 : 4} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <span className="text-xs text-gray-500 font-mono">Texto {id}</span>
          <p className={`${large ? 'text-xl' : 'text-sm'} text-gray-200 mt-1 leading-relaxed italic`}>
            "{text}"
          </p>
        </div>

        {/* Big score */}
        <div className="text-center shrink-0">
          <div
            className={`${large ? 'text-7xl' : 'text-4xl'} font-bold transition-colors duration-300 animate-count`}
            style={{ color }}
            key={`${activePreset}-${displayed}`}
          >
            {displayed}
          </div>
          <span
            className={`inline-block mt-1 ${large ? 'text-sm px-3 py-1' : 'text-[10px] px-2 py-0.5'} rounded-full border`}
            style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}
          >
            {current.category}
          </span>
        </div>
      </div>

      {/* Comparison bar */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex gap-1 items-end justify-center">
          {PRESET_ORDER.map(preset => {
            const s = scores[preset]?.score ?? 0;
            const isActive = preset === activePreset;
            const barColor = scoreColor(s);
            const label = PRESET_LABELS[preset];

            return (
              <div key={preset} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-40'}`} style={{ color: barColor }}>
                  {s}
                </span>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}
                  style={{
                    height: `${Math.max(4, s * (large ? 0.8 : 0.5))}px`,
                    backgroundColor: barColor,
                  }}
                />
                <span className={`text-[9px] ${isActive ? 'text-white font-bold' : 'text-gray-600'}`}>
                  {label.emoji}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
