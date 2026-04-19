export default function MetricCard({
  label,
  unit,
  caveat,
  councilALabel,
  councilBLabel,
  valueA,
  valueB,
  loading,
  error,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-600">{label}</h3>

      {loading ? (
        <p className="text-slate-400 text-sm animate-pulse">Loading…</p>
      ) : error ? (
        <p className="text-red-700 text-sm">{error}</p>
      ) : (
        <div className="flex gap-6">
          <ValueBlock label={councilALabel} value={valueA} unit={unit} colour="text-blue-700" />
          <ValueBlock label={councilBLabel} value={valueB} unit={unit} colour="text-amber-700" />
        </div>
      )}

      <p className="text-xs text-slate-500 border-t border-slate-200 pt-3 leading-relaxed">
        {caveat}
      </p>
    </div>
  )
}

function ValueBlock({ label, value, unit, colour }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-2xl font-bold ${colour}`}>
        {value !== null && value !== undefined
          ? `${Number(value).toLocaleString('en-GB')}${unit}`
          : '—'}
      </span>
    </div>
  )
}
