// Bloque de pulso genérico — úsalo para texto, imágenes o filas
export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

// Fila de tabla skeleton (7 celdas)
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Tarjeta skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
      <SkeletonBlock className="h-5 w-3/4" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="flex gap-2 mt-1">
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export default SkeletonBlock;
