import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMisTareas } from '../hooks/useMisTareas';
import TareaCard from '../components/eventos/TareaCard';
import Button    from '../components/common/Button';
import { SkeletonCard } from '../components/common/Skeleton';

const FILTROS = ['Todas', 'Pendiente', 'En Proceso', 'Completada'];

function StatChip({ label, count, color }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 px-4 py-3 text-center shadow-sm`}>
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function MisTareasPage() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('Todas');

  const { tareas, loading, error, refetch, cambiarEstado } =
    useMisTareas(sesion?.id_especifico);

  const tareasFiltradas = filtro === 'Todas'
    ? tareas
    : tareas.filter(t => t.estado_tarea === filtro);

  const stats = {
    total:      tareas.length,
    pendientes: tareas.filter(t => t.estado_tarea === 'Pendiente').length,
    enProceso:  tareas.filter(t => t.estado_tarea === 'En Proceso').length,
    completadas:tareas.filter(t => t.estado_tarea === 'Completada').length,
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Navbar colaborador (simplificado) ── */}
      <header className="bg-indigo-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="text-lg font-semibold">Convexa</span>
            <span className="text-indigo-300 text-sm hidden sm:inline">/ Colaborador</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-indigo-200 text-sm hidden sm:block">{sesion?.nombre}</span>
            <Button variant="ghost" size="sm"
              className="text-indigo-200 hover:text-white hover:bg-indigo-800"
              onClick={handleLogout}>
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* ── Saludo ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Hola, {sesion?.nombre} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aquí están las tareas que tienes asignadas.
          </p>
        </div>

        {/* ── Stats ── */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatChip label="Total"       count={stats.total}       color="text-slate-700" />
            <StatChip label="Pendientes"  count={stats.pendientes}  color="text-amber-600" />
            <StatChip label="En proceso"  count={stats.enProceso}   color="text-blue-600"  />
            <StatChip label="Completadas" count={stats.completadas} color="text-green-600" />
          </div>
        )}

        {/* ── Filtros ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtro === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
              {f !== 'Todas' && !loading && (
                <span className="ml-1.5 opacity-70">
                  ({tareas.filter(t => t.estado_tarea === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200
                          text-red-700 rounded-xl px-4 py-3 text-sm">
            <span>{error}</span>
            <button onClick={refetch} className="ml-auto underline text-xs">Reintentar</button>
          </div>
        )}

        {/* ── Skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Tareas ── */}
        {!loading && tareasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tareasFiltradas.map(t => (
              <TareaCard
                key={t.id_tarea}
                tarea={t}
                onCambiarEstado={cambiarEstado}
              />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && tareasFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-base font-medium">
              {filtro === 'Todas' ? 'No tienes tareas asignadas.' : `No hay tareas en estado "${filtro}".`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
