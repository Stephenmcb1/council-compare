import { useState, useEffect } from 'react'
import { fetchScotlandStats, SPARQL_SITE_URL, SPARQL_ENDPOINT_URL } from '../lib/scotlandSparql.js'
import { fetchUKNationsEmployment, NOMIS_SITE_URL, NOMIS_DATASET_URL, STATIC_NATIONS } from '../lib/nomis.js'
import { fetchWorldBankData, WB_SITE_URL } from '../lib/worldbank.js'

const UK_ORDER = ['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland']

export default function ScotlandContextPage() {
  const [scotlandStats, setScotlandStats] = useState(null)
  const [employment,    setEmployment]    = useState(null)
  const [worldBank,     setWorldBank]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [stats, emp, wb] = await Promise.all([
          fetchScotlandStats(),
          fetchUKNationsEmployment(),
          fetchWorldBankData(),
        ])
        setScotlandStats(stats)
        setEmployment(emp)
        setWorldBank(wb)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-10">

      {/* Brexit data gap banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 flex flex-col gap-2">
        <h2 className="text-amber-800 font-semibold text-base">Scotland's European data gap</h2>
        <p className="text-amber-900 text-sm leading-relaxed">
          Until Brexit, Eurostat collected detailed regional statistics for all UK NUTS1 regions — including Scotland (UKM).
          This enabled direct benchmarking against regions in Germany, France, Sweden, and across the EU.
          Since 2021, UK regional codes have been <strong>completely removed</strong> from Eurostat datasets.
          Scotland can no longer be compared to European peers in any Eurostat series.
        </p>
        <p className="text-amber-700 text-xs">
          The comparisons below use Scotland's own published statistics, ONS data for UK nations, and World Bank country-level data (UK as proxy for Scotland at the international scale).
        </p>
      </div>

      {error && <ErrorState message={error} />}

      {/* ── 1. Scotland's own statistics ─────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Scotland's own statistics"
          subtitle="From statistics.gov.scot — Scotland's official open data portal, published by the Scottish Government."
        />

        {loading ? <LoadingState /> : scotlandStats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {scotlandStats.map(metric => (
                <ScotlandStatCard key={metric.id} metric={metric} />
              ))}
            </div>
            <SourceBar
              site={{ label: 'statistics.gov.scot', url: SPARQL_SITE_URL }}
              endpoints={scotlandStats
                .filter(m => m.ok)
                .map(m => ({
                  label: m.label,
                  dataUrl: m.sourceUrl,
                }))}
              note="Data is queried live from the statistics.gov.scot SPARQL endpoint — the same linked data API used throughout this app."
            />
          </>
        )}
      </section>

      {/* ── 2. Scotland vs UK nations — employment ───────────────────────── */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Employment rate — UK nations"
          subtitle="Employment rate, aged 16–64. ONS Annual Population Survey (latest available) for UK, England, and Wales. Scottish Government and NISRA figures for Scotland and Northern Ireland."
        />

        {loading ? <LoadingState /> : employment && (
          <>
            <EmploymentChart nations={employment.nations} />
            <SourceBar
              site={{ label: 'NOMIS (ONS)', url: NOMIS_SITE_URL }}
              endpoints={[
                { label: 'Annual Population Survey dataset', dataUrl: NOMIS_DATASET_URL },
                { label: 'Live API query (UK, England, Wales)', dataUrl: employment.apiUrl },
              ]}
              note="Scotland and Northern Ireland are not separately available in this NOMIS dataset. Their figures come from national statistics bodies and are updated less frequently."
              staticSources={STATIC_NATIONS}
            />
          </>
        )}
      </section>

      {/* ── 3. Scotland globally — World Bank ────────────────────────────── */}
      <section className="flex flex-col gap-6">
        <SectionHeader
          title="Scotland in a global context"
          subtitle="World Bank Open Data — UK used as Scotland proxy at country level. Countries selected as comparable economies. Most recent available year per country."
        />

        {loading ? <LoadingState /> : worldBank && (
          <>
            {worldBank.map(indicator => (
              <WorldBankPanel key={indicator.id} indicator={indicator} />
            ))}
            <SourceBar
              site={{ label: 'World Bank Open Data', url: WB_SITE_URL }}
              endpoints={worldBank.map(ind => ({
                label: ind.label,
                dataUrl: ind.sourceUrl,
              }))}
              note="UK figures are used as a proxy for Scotland. Where Scotland's performance differs significantly from the UK average (notably renewable electricity), this is noted per indicator."
            />
          </>
        )}
      </section>

    </main>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-1">{title}</h2>
      <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
    </div>
  )
}

function ScotlandStatCard({ metric }) {
  const { label, unit, value, period, description, ok, error } = metric
  const displayValue = ok && value != null
    ? `${unit === '%' ? value.toFixed(1) + '%' : value.toFixed(1) + ' ' + unit}`
    : '—'

  const periodLabel = period
    ? period.replace('http://reference.data.gov.uk/id/gregorian-interval/', '')
            .replace('http://reference.data.gov.uk/id/year/', '')
            .split('/')[0]
    : null

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${ok ? 'text-green-800' : 'text-slate-400'}`}>
        {displayValue}
      </p>
      {periodLabel && <p className="text-xs text-slate-400">{periodLabel}</p>}
      <p className="text-xs text-slate-500 leading-relaxed mt-1">{description}</p>
      {!ok && error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function EmploymentChart({ nations }) {
  const isStatic = label => STATIC_NATIONS.some(s => s.label === label)

  const sorted = [...nations].sort((a, b) => {
    const ia = UK_ORDER.indexOf(a.label)
    const ib = UK_ORDER.indexOf(b.label)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.label.localeCompare(b.label)
  })

  const maxVal = Math.max(...sorted.map(d => d.value ?? 0))

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
            <th className="text-left px-5 py-3 font-medium">Nation</th>
            <th className="text-left px-5 py-3 font-medium w-full">Rate</th>
            <th className="text-right px-5 py-3 font-medium whitespace-nowrap">Year</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sorted.map(({ label, value, year }) => {
            const isScotland = label === 'Scotland'
            const pct = value != null ? (value / maxVal) * 100 : 0
            return (
              <tr key={label} className={isScotland ? 'bg-green-50' : 'hover:bg-slate-50'}>
                <td className={`px-5 py-3 font-medium whitespace-nowrap ${isScotland ? 'text-green-800' : 'text-slate-700'}`}>
                  {label}
                  {isStatic(label) && <span className="ml-1 text-xs font-normal text-slate-400">*</span>}
                </td>
                <td className="px-5 py-3 w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isScotland ? 'bg-green-600' : 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold tabular-nums w-12 text-right ${isScotland ? 'text-green-800' : 'text-slate-700'}`}>
                      {value != null ? `${value.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-slate-400 text-right whitespace-nowrap">{year}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function WorldBankPanel({ indicator }) {
  const { label, description, format, data, higherIsBetter, scotlandData, error } = indicator

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      {(error || data.length === 0) && !scotlandData
        ? <DataUnavailable reason={error ?? 'No data returned from World Bank for this indicator.'} />
        : <WorldBankTable data={data} format={format} higherIsBetter={higherIsBetter} scotlandData={scotlandData} />
      }
      {(error || data.length === 0) && scotlandData && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          World Bank comparator data unavailable for this indicator — showing Scotland's own figure only.
          {error && ` (${error})`}
        </p>
      )}
    </div>
  )
}

function DataUnavailable({ reason }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-xs text-slate-500 italic">
      Data not currently available. {reason}
    </div>
  )
}

function WorldBankTable({ data, format, higherIsBetter, scotlandData }) {
  // If Scotland has its own data, include it in the range calculation
  const allValues = [
    ...data.map(d => d.value ?? 0),
    ...(scotlandData ? [scotlandData.value] : []),
  ]
  const maxVal = allValues.length ? Math.max(...allValues) : 100
  const minVal = allValues.length ? Math.min(...allValues) : 0
  const range  = maxVal - minVal || 1

  const barPct = (value) =>
    higherIsBetter === false
      ? ((maxVal - value) / range) * 100
      : ((value - minVal) / range) * 100

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
            <th className="text-left px-5 py-2.5 font-medium">Country</th>
            <th className="text-left px-5 py-2.5 font-medium w-full">Value</th>
            <th className="text-right px-5 py-2.5 font-medium whitespace-nowrap">Year</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">

          {/* Scotland row — own data source, shown first and highlighted */}
          {scotlandData && (
            <tr className="bg-green-50">
              <td className="px-5 py-2.5 font-medium whitespace-nowrap text-green-800">
                Scotland
                <span className="ml-1.5 text-xs font-normal text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                  Scottish Gov.
                </span>
              </td>
              <td className="px-5 py-2.5 w-full">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${Math.min(Math.max(barPct(scotlandData.value), 2), 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-24 text-right text-green-800">
                    {format(scotlandData.value)}
                  </span>
                </div>
              </td>
              <td className="px-5 py-2.5 text-xs text-slate-400 text-right whitespace-nowrap">{scotlandData.year}</td>
            </tr>
          )}

          {/* Other countries — World Bank data */}
          {data.map(({ countryCode, label: countryLabel, value, year }) => {
            const isUK = countryCode === 'GB'
            const pct = barPct(value)
            return (
              <tr key={countryCode} className={isUK ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                <td className={`px-5 py-2.5 font-medium whitespace-nowrap ${isUK ? 'text-amber-800' : 'text-slate-700'}`}>
                  {isUK ? 'United Kingdom †' : countryLabel}
                </td>
                <td className="px-5 py-2.5 w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isUK ? 'bg-amber-400' : 'bg-slate-300'}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold tabular-nums w-24 text-right ${isUK ? 'text-amber-800' : 'text-slate-700'}`}>
                      {value != null ? format(value) : '—'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-xs text-slate-400 text-right whitespace-nowrap">{year}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-400">
        {scotlandData && (
          <p>
            <span className="font-medium text-green-700">Scotland:</span>{' '}
            {scotlandData.note}{' '}
            <a href={scotlandData.sourceUrl} target="_blank" rel="noopener noreferrer"
               className="text-green-700 underline hover:text-green-900">
              {scotlandData.sourceLabel}
            </a>
          </p>
        )}
        <p>† United Kingdom figure from World Bank — Scotland is not separately available at country level in this dataset.</p>
      </div>
    </div>
  )
}

function SourceBar({ site, endpoints = [], note, staticSources = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="text-slate-500">
          Source:{' '}
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline hover:text-green-900"
            onClick={e => e.stopPropagation()}
          >
            {site.label}
          </a>
        </span>
        <span className="text-slate-400 ml-2">{open ? '▲ hide sources' : '▼ view sources'}</span>
      </button>

      {open && (
        <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col gap-2">
          {note && <p className="text-slate-500 italic">{note}</p>}

          {endpoints.length > 0 && (
            <div className="flex flex-col gap-1">
              {endpoints.map(({ label, dataUrl }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <a
                    href={dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline break-all hover:text-green-900"
                  >
                    {dataUrl}
                  </a>
                </div>
              ))}
            </div>
          )}

          {staticSources.length > 0 && (
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Static figures (not from this API):</span>
              {staticSources.map(({ label, source }) => (
                <p key={label} className="text-slate-500"><span className="font-medium">{label}:</span> {source}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center">
      <p className="text-slate-400 text-sm animate-pulse">Loading data…</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-red-700 text-sm font-medium">Failed to load data</p>
      <p className="text-red-600 text-xs mt-1">{message}</p>
    </div>
  )
}
