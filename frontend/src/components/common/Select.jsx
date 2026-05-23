export default function Select({
  label,
  id,
  error,
  hint,
  options = [],
  placeholder,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100
          bg-white dark:bg-slate-700 dark:border-slate-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          transition-shadow duration-150 cursor-pointer
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'}
          disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
