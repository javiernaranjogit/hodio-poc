import { useState, useEffect } from 'react';

export default function AuditLog({ activePreset, presets }) {
  const [expanded, setExpanded] = useState(false);
  const preset = presets?.[activePreset];

  if (!preset) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-white/5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            🔍 Audit Log — Transparencia Total
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Esto es exactamente lo que se le dice a la IA
          </p>
        </div>
        <span className="text-gray-500 text-lg">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 slide-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{preset.emoji}</span>
            <span className="font-semibold text-sm" style={{ color: preset.color }}>
              {preset.name}
            </span>
            <span className="text-xs text-gray-600">— System Prompt activo</span>
          </div>

          <pre className="bg-black/50 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono border border-white/5 max-h-96 overflow-y-auto">
            {preset.systemPrompt}
          </pre>

          <p className="text-[10px] text-gray-600 mt-2 text-center">
            Este prompt completo se envía a Claude como instrucción del sistema antes de cada clasificación.
            Cambiar el preset = cambiar estas instrucciones = cambiar los resultados.
          </p>
        </div>
      )}
    </div>
  );
}
