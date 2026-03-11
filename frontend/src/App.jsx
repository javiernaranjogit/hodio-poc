import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Laboratorio from './pages/Laboratorio';

const DISCLAIMER = '⚠️ Herramienta de investigación — Los resultados varían según quién configura el algoritmo';

function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-red-500">H</span>ODIO
          </h1>
          <div className="flex gap-1">
            <NavLink to="/" className={linkClass} end>Dashboard</NavLink>
            <NavLink to="/laboratorio" className={linkClass}>Laboratorio de Sesgo</NavLink>
          </div>
        </div>
      </div>
      <div className="bg-yellow-900/30 border-t border-yellow-700/30 px-4 py-1.5 text-center text-xs text-yellow-300/80">
        {DISCLAIMER}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/laboratorio" element={<Laboratorio />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
