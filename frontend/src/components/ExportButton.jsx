import { useState } from 'react';
import { api } from '../api';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      await api.exportPdf();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all text-sm"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Generando PDF...
        </>
      ) : (
        <>
          📄 Exportar evidencia de manipulación
        </>
      )}
    </button>
  );
}
