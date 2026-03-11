import { useState, useEffect } from 'react';

function scoreColor(score) {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#eab308';
  return '#ef4444';
}

export default function HateGauge({ score = 0, label = 'Índice Global del Odio' }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = displayed;
    const target = Math.round(score);
    if (start === target) return;
    const step = target > start ? 1 : -1;
    const timer = setInterval(() => {
      start += step;
      setDisplayed(start);
      if (start === target) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [score]);

  const color = scoreColor(displayed);
  const rotation = (displayed / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="bg-gray-900 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">{label}</h3>

      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 rounded-t-full border-8 border-gray-800" />
        {/* Colored arc segments */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 10 100 A 90 90 0 0 1 76 17" stroke="#22c55e" strokeWidth="8" fill="none" opacity="0.3" />
            <path d="M 76 17 A 90 90 0 0 1 124 17" stroke="#eab308" strokeWidth="8" fill="none" opacity="0.3" />
            <path d="M 124 17 A 90 90 0 0 1 190 100" stroke="#ef4444" strokeWidth="8" fill="none" opacity="0.3" />
          </svg>
        </div>
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transition-transform duration-500"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            background: `linear-gradient(to top, ${color}, transparent)`
          }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-gray-700 border-2" style={{ borderColor: color }} />
      </div>

      <div className="mt-4 text-5xl font-bold animate-count" style={{ color }} key={displayed}>
        {displayed}
      </div>
      <div className="text-xs text-gray-500 mt-1">de 100</div>
    </div>
  );
}
