// Mapa de colores para los valores enum del modelo EVENTOS y TAREAS
const ESTADO_EVENTO = {
  'Planificación': 'bg-amber-100  text-amber-800  border-amber-200',
  'Montaje':       'bg-blue-100   text-blue-800   border-blue-200',
  'Ejecución':     'bg-green-100  text-green-800  border-green-200',
  'Finalizado':    'bg-slate-100  text-slate-600  border-slate-200',
  'Cancelado':     'bg-red-100    text-red-700    border-red-200',
};

const PRIORIDAD = {
  'Alta':  'bg-red-100   text-red-700   border-red-200',
  'Media': 'bg-amber-100 text-amber-800 border-amber-200',
  'Baja':  'bg-green-100 text-green-800 border-green-200',
};

const ESTADO_TAREA = {
  'Pendiente':   'bg-slate-100 text-slate-600 border-slate-200',
  'En Proceso':  'bg-blue-100  text-blue-800  border-blue-200',
  'Completada':  'bg-green-100 text-green-800 border-green-200',
};

const ALL_MAPS = { ...ESTADO_EVENTO, ...PRIORIDAD, ...ESTADO_TAREA };
const FALLBACK  = 'bg-slate-100 text-slate-600 border-slate-200';

export default function Badge({ label, className = '' }) {
  const colors = ALL_MAPS[label] ?? FALLBACK;
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${colors} ${className}
      `}
    >
      {label}
    </span>
  );
}
