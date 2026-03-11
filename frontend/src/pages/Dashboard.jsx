import { useState, useEffect } from 'react';
import { api } from '../api';
import HateGauge from '../components/HateGauge';
import SourceCard from '../components/SourceCard';
import LeaderboardTable from '../components/LeaderboardTable';
import ContentFeed from '../components/ContentFeed';
import TrendChart from '../components/TrendChart';
import SubmitContent from '../components/SubmitContent';

const SOCIAL_PLATFORMS = ['x_twitter', 'twitter', 'instagram', 'tiktok', 'youtube', 'facebook', 'reddit'];

export default function Dashboard() {
  const [stats, setStats] = useState({ globalHateIndex: 0, totalContent: 0 });
  const [sources, setSources] = useState([]);
  const [trends, setTrends] = useState([]);
  const [feed, setFeed] = useState([]);
  const [amplifiers, setAmplifiers] = useState([]);
  const [defenders, setDefenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, src, t, f, amp, def] = await Promise.all([
          api.getStats(),
          api.getSources(),
          api.getTrends(),
          api.getFeed(),
          api.getAmplifiers(),
          api.getDefenders(),
        ]);
        setStats(s);
        setSources(src);
        setTrends(t);
        setFeed(f);
        setAmplifiers(amp);
        setDefenders(def);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getSourceTrend(sourceName) {
    return trends.filter(t => t.source === sourceName);
  }

  const socialSources = sources.filter(s => SOCIAL_PLATFORMS.includes(s.source));
  const mediaSources = sources.filter(s => !SOCIAL_PLATFORMS.includes(s.source));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 via-gray-900 to-red-900/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-400 mb-1">HODIO analiza la presencia de discurso de odio y polarización en</p>
        <p className="text-lg font-semibold text-gray-200">
          Instagram, TikTok, X, YouTube, Facebook + 10 medios de comunicación
        </p>
      </div>

      {/* Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HateGauge score={stats.globalHateIndex} />
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col justify-center items-center">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Contenido analizado</span>
          <span className="text-4xl font-bold text-white mt-2">{stats.totalContent}</span>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col justify-center items-center">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Contenido de odio</span>
          <span className="text-4xl font-bold text-red-400 mt-2">{stats.highHateCount}</span>
          <span className="text-xs text-gray-500 mt-1">score &gt; 60</span>
        </div>
      </section>

      {/* Social platforms */}
      {socialSources.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-3">Redes Sociales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {socialSources.map(s => (
              <SourceCard
                key={s.source}
                source={s.source}
                avgScore={s.avg_score}
                contentCount={s.content_count}
                trendData={getSourceTrend(s.source)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Media sources */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-3">Medios de Comunicación</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mediaSources.map(s => (
            <SourceCard
              key={s.source}
              source={s.source}
              avgScore={s.avg_score}
              contentCount={s.content_count}
              trendData={getSourceTrend(s.source)}
            />
          ))}
        </div>
      </section>

      {/* Trends */}
      <TrendChart data={trends} />

      {/* Leaderboards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeaderboardTable title="Top Amplificadores del Odio" data={amplifiers} type="amplifier" />
        <LeaderboardTable title="Top Frenadores del Odio" data={defenders} type="defender" />
      </section>

      {/* Submit manual content */}
      <SubmitContent onSubmitted={() => {
        api.getFeed().then(setFeed);
        api.getStats().then(setStats);
      }} />

      {/* Feed */}
      <ContentFeed items={feed} />
    </div>
  );
}
