import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { eventosApi } from '../services/api';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/Skeleton';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

const ESTADOS_PUBLICOS = new Set(['Planificación', 'Montaje', 'Ejecución']);

const TIPO_ICON = {
  'Conferencia':      '🎤',
  'Taller':           '🛠️',
  'Congreso':         '🏛️',
  'Seminario':        '📚',
  'Exposición':       '🖼️',
  'Concierto':        '🎵',
  'Ceremonia':        '🎓',
  'Networking':       '🤝',
};

// ── Navbar pública ─────────────────────────────────────────────────────────
function LandingNavbar() {
  const { isAuth, isAdmin, isColaborador } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAcceso = () => {
    if (isAdmin)        navigate('/dashboard');
    else if (isColaborador) navigate('/mis-tareas');
    else                navigate('/login');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-700' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow">
            C
          </div>
          <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-800 dark:text-slate-100' : 'text-white'}`}>
            Convexa
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleAcceso}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all
                       bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm border border-white/20"
          >
            {isAuth ? 'Ir al panel' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Tarjeta de evento público ──────────────────────────────────────────────
function EventoPublicoCard({ ev, mostrarRsvp }) {
  const icono       = TIPO_ICON[ev.TIPOS_EVENTO?.nombre] ?? '📅';
  const confirmados = Number(ev.confirmados_count ?? 0);
  const aforo       = Number(ev.aforo_maximo ?? 0);
  const aforoLleno  = aforo > 0 && confirmados >= aforo;

  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md
                        transition-all hover:-translate-y-0.5 flex flex-col overflow-hidden group">
      {/* Cabecera con gradiente */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-5 pt-5 pb-8 relative">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl" />
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col -mt-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge label={ev.estado_evento} />
          <Badge label={ev.modalidad_evento} />
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight mb-1 line-clamp-2
                       group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {ev.nombre_evento}
        </h3>

        <p className="text-xs text-slate-400 mb-3">
          {ev.TIPOS_EVENTO?.nombre ?? 'Evento'} · Aforo: {ev.aforo_maximo} personas
        </p>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-500 mb-4">
          <div>
            <dt className="text-slate-400 uppercase tracking-wide text-[10px]">Inicio</dt>
            <dd className="font-medium text-slate-700">{fmtDate(ev.fecha_inicio)}</dd>
          </div>
          <div>
            <dt className="text-slate-400 uppercase tracking-wide text-[10px]">Término</dt>
            <dd className="font-medium text-slate-700">{fmtDate(ev.fecha_termino)}</dd>
          </div>
        </dl>

        {ev.ubicacion_texto && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-4 truncate">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {ev.ubicacion_texto}
          </p>
        )}

        {mostrarRsvp && (
          <div className="mt-auto">
            {aforoLleno ? (
              <div className="w-full text-center bg-slate-200 dark:bg-zinc-700
                             text-slate-500 dark:text-zinc-400
                             text-sm font-semibold py-2.5 rounded-xl
                             cursor-not-allowed select-none flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Aforo Completo
              </div>
            ) : (
              <Link
                to={`/eventos/publico/${ev.id_evento}/rsvp`}
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700
                           text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Registrarse
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAdmin } = useAuth();
  const [eventos,  setEventos]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    eventosApi.getAll()
      .then(({ data }) => {
        const publicos = data.data.filter(e => ESTADOS_PUBLICOS.has(e.estado_evento));
        setEventos(publicos);
      })
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <LandingNavbar />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-slate-900 pt-32 pb-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Organiza eventos <br className="hidden sm:block" />
            <span className="text-indigo-300">sin complicaciones</span>
          </h1>

          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            Descubre los próximos eventos disponibles y regístrate en pocos segundos.
            Convexa conecta organizadores y asistentes en una sola plataforma.
          </p>

        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: `${eventos.length}`, label: 'Eventos activos' },
            { value: 'Ilimitado',         label: 'Capacidad de asistentes' },
            { value: '100%',              label: 'Gestión digital' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-900 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Eventos disponibles ─────────────────────────────────── */}
      <section id="eventos" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Eventos disponibles
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Todos los eventos abiertos para registro. Haz clic en <strong>Registrarse</strong> para reservar tu cupo.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : eventos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="text-5xl mb-4">📅</span>
            <p className="text-lg font-medium">No hay eventos disponibles en este momento.</p>
            <p className="text-sm mt-1">Vuelve pronto para ver las próximas actividades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventos.map(ev => (
              <EventoPublicoCard key={ev.id_evento} ev={ev} mostrarRsvp={!isAdmin} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-slate-800 text-slate-400 text-center text-xs py-8 mt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white text-xs">C</div>
          <span className="font-semibold text-white">Convexa</span>
        </div>
        <p>Sistema de Gestión de Eventos · Todos los derechos reservados</p>
        <p className="mt-1">
          <Link to="/login" className="hover:text-white transition-colors">Acceso para organizadores</Link>
        </p>
      </footer>
    </div>
  );
}
