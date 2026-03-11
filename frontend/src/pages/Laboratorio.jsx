import { useState, useEffect } from 'react';
import { api } from '../api';
import PresetSelector from '../components/PresetSelector';
import TextScoreCard from '../components/TextScoreCard';
import FundingSlider from '../components/FundingSlider';
import AuditLog from '../components/AuditLog';
import ExportButton from '../components/ExportButton';

export default function Laboratorio() {
  const [activePreset, setActivePreset] = useState('neutro');
  const [demoTexts, setDemoTexts] = useState([]);
  const [presets, setPresets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [texts, p] = await Promise.all([
          api.getDemoTexts(),
          api.getPresets(),
        ]);
        setDemoTexts(texts);
        setPresets(p);
      } catch (err) {
        console.error('Lab load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Cargando laboratorio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🔬 Laboratorio de Sesgo
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          La misma frase puede puntuar <span className="text-green-400 font-bold">12</span> o{' '}
          <span className="text-red-400 font-bold">95</span> dependiendo de quién configure el algoritmo.
          Selecciona un clasificador y observa cómo cambian los resultados.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-white/5">
        <h2 className="text-center text-sm text-gray-400 mb-4 uppercase tracking-wider">
          Selector de ideología del clasificador
        </h2>
        <PresetSelector active={activePreset} onChange={setActivePreset} />
      </div>

      {/* Demo texts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Reclasificación en vivo — 5 textos, misma IA, distinto sesgo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoTexts.map(dt => (
            <TextScoreCard
              key={dt.id}
              id={dt.id}
              text={dt.text}
              scores={dt.scores}
              activePreset={activePreset}
            />
          ))}
        </div>
      </section>

      {/* Funding slider */}
      <FundingSlider />

      {/* Audit Log */}
      <AuditLog activePreset={activePreset} presets={presets} />

      {/* Export */}
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-sm text-gray-400 uppercase tracking-wider">📰 Modo Periodista</h3>
        <ExportButton />
        <p className="text-xs text-gray-600 text-center max-w-md">
          Genera un PDF con los 5 textos × 5 presets = 25 clasificaciones.
          Listo para publicar como evidencia de manipulación algorítmica.
        </p>
      </div>
    </div>
  );
}
