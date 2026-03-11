const PRESETS = [
  { key: 'progresista', emoji: '🔴', name: 'Progresista', color: '#ef4444' },
  { key: 'conservador', emoji: '🔵', name: 'Conservador', color: '#3b82f6' },
  { key: 'neutro', emoji: '⚖️', name: 'Neutro', color: '#a855f7' },
  { key: 'gubernamental', emoji: '🏛️', name: 'Gubernamental', color: '#f59e0b' },
  { key: 'corporativo', emoji: '💰', name: 'Corporativo', color: '#10b981' },
];

export default function PresetSelector({ active, onChange, size = 'normal' }) {
  const isLarge = size === 'large';

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {PRESETS.map(p => {
        const isActive = active === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`
              ${isLarge ? 'px-6 py-4 text-lg' : 'px-4 py-2.5 text-sm'}
              rounded-xl font-semibold transition-all duration-300 border-2
              ${isActive
                ? 'scale-105 shadow-lg shadow-white/10'
                : 'opacity-60 hover:opacity-90 hover:scale-[1.02]'
              }
            `}
            style={{
              borderColor: isActive ? p.color : 'transparent',
              backgroundColor: isActive ? `${p.color}20` : 'rgba(255,255,255,0.05)',
              color: isActive ? p.color : '#9ca3af'
            }}
          >
            <span className={isLarge ? 'text-2xl mr-2' : 'mr-1.5'}>{p.emoji}</span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

export { PRESETS };
