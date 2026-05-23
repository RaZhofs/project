import { Link } from 'react-router-dom';
import Badge  from '../common/Badge';
import Button from '../common/Button';
import { SkeletonCard } from '../common/Skeleton';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

const BORDER_COLOR = {
  'Planificación': 'border-t-amber-400',
  'Montaje':       'border-t-blue-400',
  'Ejecución':     'border-t-green-400',
  'Finalizado':    'border-t-slate-300',
  'Cancelado':     'border-t-red-400',
};

function EventoCardItem({ ev, onDelete }) {
  const accentBorder = BORDER_COLOR[ev.estado_evento] ?? 'border-t-indigo-400';

  return (
    <article className={`
      bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-t-4 ${accentBorder}
      shadow-sm hover:shadow-md transition-shadow flex flex-col
    `}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link to={`/eventos/${ev.id_evento}`}
            className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-tight line-clamp-2
                       hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {ev.nombre_evento}
          </Link>
          <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">#{ev.id_evento}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge label={ev.estado_evento} />
          <Badge label={ev.modalidad_evento} />
        </div>

        <dl className="text-sm text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-x-3 gap-y-2">
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tipo</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200 truncate">{ev.TIPOS_EVENTO?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Aforo</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">{ev.aforo_maximo}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Inicio</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">{fmtDate(ev.fecha_inicio)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Término</dt>
            <dd className="font-medium text-slate-700 dark:text-slate-200">{fmtDate(ev.fecha_termino)}</dd>
          </div>
        </dl>

        {ev.ubicacion_texto && (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {ev.ubicacion_texto}
          </p>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 rounded-b-xl
                      text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span className="truncate">{ev.ADMINISTRADORES?.nombre ?? 'Sin admin'}</span>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <Link to={`/eventos/${ev.id_evento}/editar`}>
            <Button variant="ghost" size="sm">Editar</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => onDelete(ev)}>Eliminar</Button>
        </div>
      </div>
    </article>
  );
}

export default function EventoCard({ eventos, loading, onDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-base font-medium">No hay eventos registrados</p>
        <p className="text-sm mt-1">Crea el primero con el botón "Nuevo evento".</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {eventos.map(ev => (
        <EventoCardItem key={ev.id_evento} ev={ev} onDelete={onDelete} />
      ))}
    </div>
  );
}
