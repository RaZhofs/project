import Badge  from '../common/Badge';
import Button from '../common/Button';

const SIGUIENTE_ESTADO = {
  'Pendiente':  'En Proceso',
  'En Proceso': 'Completada',
  'Completada': null,           // estado final
};

const BOTON_LABEL = {
  'Pendiente':  'Iniciar tarea',
  'En Proceso': 'Marcar completada',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

function vencimiento(fechaLimite) {
  if (!fechaLimite) return null;
  const hoy  = new Date();
  const lim  = new Date(fechaLimite);
  const dias = Math.ceil((lim - hoy) / (1000 * 60 * 60 * 24));
  if (dias < 0)  return { label: `Vencida hace ${Math.abs(dias)}d`, cls: 'text-red-600' };
  if (dias === 0) return { label: 'Vence hoy',                       cls: 'text-amber-600' };
  if (dias <= 3)  return { label: `Vence en ${dias}d`,               cls: 'text-amber-500' };
  return { label: fmtDate(fechaLimite),                              cls: 'text-slate-500' };
}

export default function TareaCard({ tarea, onCambiarEstado }) {
  const siguiente = SIGUIENTE_ESTADO[tarea.estado_tarea];
  const venc      = vencimiento(tarea.fecha_limite);
  const completada = tarea.estado_tarea === 'Completada';

  return (
    <article className={`
      bg-white rounded-xl border shadow-sm flex flex-col transition-opacity
      ${completada ? 'border-green-200 opacity-80' : 'border-slate-200 hover:shadow-md'}
    `}>
      {/* Barra de prioridad superior */}
      <div className={`h-1 rounded-t-xl ${
        tarea.prioridad === 'Alta'  ? 'bg-red-400' :
        tarea.prioridad === 'Media' ? 'bg-amber-400' : 'bg-green-400'
      }`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Título + badges */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-slate-800 text-sm leading-snug ${
            completada ? 'line-through text-slate-400' : ''
          }`}>
            {tarea.titulo}
          </h3>
          <Badge label={tarea.estado_tarea} />
        </div>

        {/* Descripción */}
        {tarea.descripcion && (
          <p className="text-xs text-slate-500 line-clamp-2">{tarea.descripcion}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge label={tarea.prioridad} />
          {tarea.EVENTO && (
            <span className="text-slate-400 truncate max-w-[160px]">
              {tarea.EVENTO.nombre_evento}
            </span>
          )}
        </div>

        {/* Fecha límite */}
        {venc && (
          <p className={`text-xs font-medium flex items-center gap-1 ${venc.cls}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {venc.label}
          </p>
        )}

        {completada && tarea.fecha_completado && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completada el {fmtDate(tarea.fecha_completado)}
          </p>
        )}
      </div>

      {/* Acción */}
      {siguiente && (
        <div className="px-5 pb-4">
          <Button
            size="sm"
            variant={siguiente === 'Completada' ? 'primary' : 'secondary'}
            className="w-full"
            onClick={() => onCambiarEstado(tarea.id_tarea, siguiente)}
          >
            {BOTON_LABEL[tarea.estado_tarea]}
          </Button>
        </div>
      )}
    </article>
  );
}
