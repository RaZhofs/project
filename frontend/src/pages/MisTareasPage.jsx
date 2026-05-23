import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMisTareas } from '../hooks/useMisTareas';
import TareaCard from '../components/eventos/TareaCard';
import Button    from '../components/common/Button';
import { SkeletonCard, SkeletonBlock } from '../components/common/Skeleton';
import { colaboradoresApi, bitacoraApi } from '../services/api';

const FILTROS       = ['Todas', 'Pendiente', 'En Proceso', 'Completada'];
const TIPOS_ENTRADA = ['Nota', 'Avance', 'Alerta', 'Incidencia'];
const TIPO_COLORS   = {
  Nota:       'bg-slate-100 text-slate-600',
  Avance:     'bg-green-100 text-green-700',
  Alerta:     'bg-amber-100 text-amber-700',
  Incidencia: 'bg-red-100   text-red-700',
};

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function StatChip({ label, count, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Tab: Mis Tareas ────────────────────────────────────────────────────────
function TabMisTareas({ sesion }) {
  const [filtro, setFiltro] = useState('Todas');
  const { tareas, loading, error, refetch, cambiarEstado } =
    useMisTareas(sesion?.id_especifico);

  const tareasFiltradas = filtro === 'Todas'
    ? tareas
    : tareas.filter(t => t.estado_tarea === filtro);

  const stats = {
    total:       tareas.length,
    pendientes:  tareas.filter(t => t.estado_tarea === 'Pendiente').length,
    enProceso:   tareas.filter(t => t.estado_tarea === 'En Proceso').length,
    completadas: tareas.filter(t => t.estado_tarea === 'Completada').length,
  };

  return (
    <>
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatChip label="Total"       count={stats.total}       color="text-slate-700" />
          <StatChip label="Pendientes"  count={stats.pendientes}  color="text-amber-600" />
          <StatChip label="En proceso"  count={stats.enProceso}   color="text-blue-600"  />
          <StatChip label="Completadas" count={stats.completadas} color="text-green-600" />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}>
            {f}
            {f !== 'Todas' && !loading && (
              <span className="ml-1.5 opacity-70">
                ({tareas.filter(t => t.estado_tarea === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200
                        text-red-700 rounded-xl px-4 py-3 text-sm">
          <span>{error}</span>
          <button onClick={refetch} className="ml-auto underline text-xs">Reintentar</button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && tareasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareasFiltradas.map(t => (
            <TareaCard key={t.id_tarea} tarea={t} onCambiarEstado={cambiarEstado} />
          ))}
        </div>
      )}

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
    </>
  );
}

// ── Tab: Bitácora ──────────────────────────────────────────────────────────
function TabBitacora({ sesion }) {
  const id_colaborador = sesion?.id_especifico;

  const [eventos,   setEventos]   = useState([]);
  const [eventoSel, setEventoSel] = useState(null);
  const [entradas,  setEntradas]  = useState([]);
  const [loadEv,    setLoadEv]    = useState(true);
  const [loadEnt,   setLoadEnt]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [form, setForm] = useState({ contenido: '', tipo_entrada: 'Nota' });

  // Carga los eventos del colaborador
  useEffect(() => {
    if (!id_colaborador) return;
    (async () => {
      setLoadEv(true);
      try {
        const { data } = await colaboradoresApi.getEventos(id_colaborador);
        setEventos(data.data);
        if (data.data.length === 1) setEventoSel(data.data[0]);
      } catch {
        setError('No se pudieron cargar tus eventos.');
      } finally { setLoadEv(false); }
    })();
  }, [id_colaborador]);

  // Carga las entradas al seleccionar un evento
  const fetchEntradas = useCallback(async (id_evento) => {
    setLoadEnt(true);
    setEntradas([]);
    try {
      const { data } = await bitacoraApi.getEntradas(id_evento);
      setEntradas(data.data);
    } catch {
      setError('No se pudo cargar la bitácora.');
    } finally { setLoadEnt(false); }
  }, []);

  useEffect(() => {
    if (eventoSel) fetchEntradas(eventoSel.id_evento);
  }, [eventoSel, fetchEntradas]);

  const handlePublicar = async () => {
    if (!form.contenido.trim() || !eventoSel) return;
    setSaving(true);
    setError('');
    try {
      await bitacoraApi.crearEntrada(eventoSel.id_evento, {
        contenido:    form.contenido.trim(),
        tipo_entrada: form.tipo_entrada,
        autor_nombre: sesion?.nombre ?? 'Colaborador',
        autor_rol:    sesion?.rol    ?? 'Colaborador',
      });
      setForm({ contenido: '', tipo_entrada: 'Nota' });
      fetchEntradas(eventoSel.id_evento);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al publicar.');
    } finally { setSaving(false); }
  };

  if (loadEv) return (
    <div className="flex flex-col gap-3 mt-2">
      {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-16 w-full rounded-xl" />)}
    </div>
  );

  if (eventos.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <p className="text-base font-medium">No estás asignado a ningún evento.</p>
      <p className="text-sm mt-1">Contacta al administrador para que te asigne.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 mt-2">

      {/* Selector de evento (solo si hay más de uno) */}
      {eventos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {eventos.map(ev => (
            <button key={ev.id_evento}
              onClick={() => { setEventoSel(ev); setError(''); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                eventoSel?.id_evento === ev.id_evento
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}>
              {ev.nombre_evento}
            </button>
          ))}
        </div>
      )}

      {eventoSel && (
        <>
          {/* Cabecera del evento seleccionado */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-2 text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            {eventoSel.nombre_evento}
          </div>

          {/* Formulario nueva entrada */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Nueva entrada</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {TIPOS_ENTRADA.map(t => (
                <button key={t}
                  onClick={() => setForm(p => ({ ...p, tipo_entrada: t }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    form.tipo_entrada === t
                      ? TIPO_COLORS[t] + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Escribe una nota, avance o incidencia..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm
                         text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-indigo-400 resize-none"
              value={form.contenido}
              onChange={e => setForm(p => ({ ...p, contenido: e.target.value }))}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <div className="flex justify-end mt-2">
              <Button loading={saving} onClick={handlePublicar} disabled={!form.contenido.trim()}>
                Publicar
              </Button>
            </div>
          </div>

          {/* Feed */}
          {loadEnt ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : entradas.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-medium">Sin entradas aún.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entradas.map(e => (
                <div key={e.id_entrada}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLORS[e.tipo_entrada]}`}>
                      {e.tipo_entrada}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {e.autor_nombre} · {fmtDateTime(e.fecha_entrada)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{e.contenido}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
const TABS_COLAB = ['Mis Tareas', 'Bitácora'];

export default function MisTareasPage() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Mis Tareas');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">

      <header className="bg-indigo-900 dark:bg-slate-950 text-white shadow-md">
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

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hola, {sesion?.nombre}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Panel de colaborador</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm mb-6 w-fit">
          {TABS_COLAB.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Mis Tareas'
          ? <TabMisTareas sesion={sesion} />
          : <TabBitacora  sesion={sesion} />
        }
      </main>
    </div>
  );
}
