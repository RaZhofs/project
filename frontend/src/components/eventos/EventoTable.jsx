import { Link } from 'react-router-dom';
import Badge  from '../common/Badge';
import Button from '../common/Button';
import { SkeletonTableRow } from '../common/Skeleton';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

const HEADERS = [
  'Evento', 'Tipo', 'Administrador', 'Inicio',
  'Término', 'Aforo', 'Estado', 'Acciones',
];

export default function EventoTable({ eventos, loading, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <tr>
            {HEADERS.map(h => (
              <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && [...Array(5)].map((_, i) => <SkeletonTableRow key={i} />)}

          {!loading && eventos.length === 0 && (
            <tr>
              <td colSpan={HEADERS.length} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                <p className="text-base font-medium">No hay eventos registrados</p>
                <p className="text-sm mt-1">Crea el primero con el botón "Nuevo evento".</p>
              </td>
            </tr>
          )}

          {!loading && eventos.map(ev => (
            <tr key={ev.id_evento}
              className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
              <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                <Link to={`/eventos/${ev.id_evento}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors">
                  {ev.nombre_evento}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {ev.TIPOS_EVENTO?.nombre ?? '—'}
              </td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {ev.ADMINISTRADORES?.nombre ?? '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                {fmtDate(ev.fecha_inicio)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                {fmtDate(ev.fecha_termino)}
              </td>
              <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                {ev.aforo_maximo}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <Badge label={ev.estado_evento} />
                  <Badge label={ev.modalidad_evento} />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link to={`/eventos/${ev.id_evento}/editar`}>
                    <Button variant="secondary" size="sm">Editar</Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => onDelete(ev)}>Eliminar</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
