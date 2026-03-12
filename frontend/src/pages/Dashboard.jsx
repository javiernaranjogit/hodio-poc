import { useState, useEffect } from 'react';
import { api } from '../api';
import ContentFeed from '../components/ContentFeed';
import TrendChart from '../components/TrendChart';
import SourceChart from '../components/SourceChart';
import ManualAnalyzer from '../components/ManualAnalyzer';
import SourceManager from '../components/SourceManager';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // feed | analyzer | sources

  async function load() {
    try {
      const [h, s, i, t] = await Promise.all([
        api.getHealth(),
        api.getStatsOverview(),
        api.getItems(50, 0),
        api.getStatsTrend(7),
      ]);
      setHealth(h);
      setStats(s);
      setItems(i);
      setTrend(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">HODIO Monitor</h1>
          {health?.items != null && (
            <span className="px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-400 text-sm font-medium">
              {health.items} items
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total analizado</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.total_items ?? 0}</p>
        </div>
        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Score medio</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.avg_score ?? 0}</p>
        </div>
        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Items hoy</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.items_today ?? 0}</p>
        </div>
        <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Fuentes activas</p>
          <p className="text-2xl font-bold text-white mt-1">{stats?.active_sources ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'feed' ? 'bg-amber-600/20 text-amber-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'analyzer' ? 'bg-amber-600/20 text-amber-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Analizar texto
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sources' ? 'bg-amber-600/20 text-amber-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Fuentes
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {activeTab === 'feed' && <ContentFeed items={items} />}
          {activeTab === 'analyzer' && <ManualAnalyzer onAnalyzed={load} />}
          {activeTab === 'sources' && <SourceManager />}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <TrendChart data={trend} />
          <SourceChart data={stats?.by_source ?? []} />
        </div>
      </div>
    </div>
  );
}
