export default function Input({
  label,
  id,
  error,
  hint,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-slate-900
          placeholder:text-slate-400 bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-shadow duration-150
          ${error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-300'
          }
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
