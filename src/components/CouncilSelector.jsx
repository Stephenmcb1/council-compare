import { COUNCILS } from '../lib/councils.js'

export default function CouncilSelector({ councilA, councilB, onChangeA, onChangeB }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-6">
      <div className="flex flex-col gap-1 w-full sm:w-64">
        <label className="text-xs uppercase tracking-widest text-slate-500" htmlFor="council-a">
          Council A
        </label>
        <select
          id="council-a"
          value={councilA}
          onChange={(e) => onChangeA(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {COUNCILS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <span className="text-slate-400 font-bold text-lg sm:mt-5">vs</span>

      <div className="flex flex-col gap-1 w-full sm:w-64">
        <label className="text-xs uppercase tracking-widest text-slate-500" htmlFor="council-b">
          Council B
        </label>
        <select
          id="council-b"
          value={councilB}
          onChange={(e) => onChangeB(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {COUNCILS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
