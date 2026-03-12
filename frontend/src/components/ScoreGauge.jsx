import { useState, useEffect } from 'react';

function scoreColor(score) {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#eab308';
  if (score < 80) return '#f97316';
  return '#ef4444';
}

export default function ScoreGauge({ score = 0, label = 'Score' }) {
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
    }, 15);
    return () => clearInterval(timer);
  }, [score]);

  const color = scoreColor(displayed);
  const rotation = (displayed / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</h3>
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full border-4 border-gray-700" />
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
          <path d="M 10 100 A 90 90 0 0 1 76 17" stroke="#22c55e" strokeWidth="6" fill="none" opacity="0.3" />
          <path d="M 76 17 A 90 90 0 0 1 124 17" stroke="#eab308" strokeWidth="6" fill="none" opacity="0.3" />
          <path d="M 124 17 A 90 90 0 0 1 190 100" stroke="#ef4444" strokeWidth="6" fill="none" opacity="0.3" />
        </svg>
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-14 origin-bottom transition-transform duration-500"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            background: color,
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-gray-800" style={{ border: `2px solid ${color}` }} />
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color }} key={displayed}>
        {displayed}
      </div>
      <div className="text-[10px] text-gray-500">0–100</div>
    </div>
  );
}
