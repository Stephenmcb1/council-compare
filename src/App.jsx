/**
 * App.jsx — Council Compare root component
 *
 * Two-page app: Compare (live data) and About (context).
 * Page state is handled locally — no router needed for two pages.
 *
 * Data flow (Compare page):
 *   1. User picks Council A and Council B via CouncilSelector
 *   2. useEffect fires when either selection changes
 *   3. One SPARQL query per metric per council runs in parallel
 *   4. Results stored in state and passed to MetricCard + RadarChart
 */

import { useState, useEffect } from 'react'
import CouncilSelector from './components/CouncilSelector.jsx'
import MetricCard from './components/MetricCard.jsx'
import RadarChart from './components/RadarChart.jsx'
import DeprivationNote from './components/DeprivationNote.jsx'
import AboutPage from './components/AboutPage.jsx'
import LeagueTablePage from './components/LeagueTablePage.jsx'
import PoliticalControl from './components/PoliticalControl.jsx'
import { METRICS } from './lib/metrics.js'
import { getCouncil } from './lib/councils.js'
import { querySparql, flattenBindings } from './lib/sparql.js'

const DEFAULT_A = 'glasgow-city'
const DEFAULT_B = 'east-renfrewshire'

export default function App() {
  const [page, setPage] = useState('compare')
  const [councilA, setCouncilA] = useState(DEFAULT_A)
  const [councilB, setCouncilB] = useState(DEFAULT_B)
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const councilAData = getCouncil(councilA)
  const councilBData = getCouncil(councilB)

  useEffect(() => {
    if (!councilAData || !councilBData) return

    async function fetchAll() {
      setLoading(true)
      setErrors({})

      const fetches = METRICS.flatMap((metric) =>
        [councilAData, councilBData].map(async (council) => {
          try {
            const query = metric.buildQuery(council.code)
            const json = await querySparql(query)
            const rows = flattenBindings(json)
            const value = rows.length > 0 ? rows[0].value : null
            return { metricId: metric.id, slug: council.slug, value }
          } catch (err) {
            return { metricId: metric.id, slug: council.slug, value: null, error: err.message }
          }
        })
      )

      const results = await Promise.all(fetches)
      const newValues = {}
      const newErrors = {}

      for (const { metricId, slug, value, error } of results) {
        if (!newValues[slug]) newValues[slug] = {}
        newValues[slug][metricId] = value
        if (error) newErrors[metricId] = error
      }

      setValues(newValues)
      setErrors(newErrors)
      setLoading(false)
    }

    fetchAll()
  }, [councilA, councilB]) // eslint-disable-line react-hooks/exhaustive-deps

  const vA = values[councilA] ?? {}
  const vB = values[councilB] ?? {}

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-5">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <h1 className="font-korolev text-3xl font-extrabold tracking-tight text-green-900">
            Council Compare
          </h1>
          <p className="text-slate-500 text-sm">
            Scottish council performance data — with context.
          </p>

          {/* Navigation */}
          <nav className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <NavButton active={page === 'compare'} onClick={() => setPage('compare')}>
              Compare
            </NavButton>
            <NavButton active={page === 'league'} onClick={() => setPage('league')}>
              League Table
            </NavButton>
            <NavButton active={page === 'about'} onClick={() => setPage('about')}>
              About
            </NavButton>
          </nav>
        </div>
      </header>

      {/* Page content */}
      {page === 'about' ? (
        <AboutPage />
      ) : page === 'league' ? (
        <LeagueTablePage />
      ) : (
        <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-8">

          <CouncilSelector
            councilA={councilA}
            councilB={councilB}
            onChangeA={setCouncilA}
            onChangeB={setCouncilB}
          />

          <section>
            <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4">Political Control</h2>
            <PoliticalControl
              slugA={councilA}
              slugB={councilB}
              councilALabel={councilAData?.label ?? ''}
              councilBLabel={councilBData?.label ?? ''}
            />
          </section>

          <DeprivationNote />

          <section>
            <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4">Overview</h2>
            <RadarChart
              councilALabel={councilAData?.label ?? ''}
              councilBLabel={councilBData?.label ?? ''}
              valuesA={vA}
              valuesB={vB}
              loading={loading}
            />
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4">Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METRICS.map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  unit={metric.unit}
                  caveat={metric.caveat}
                  councilALabel={councilAData?.label ?? ''}
                  councilBLabel={councilBData?.label ?? ''}
                  valueA={vA[metric.id]}
                  valueB={vB[metric.id]}
                  loading={loading}
                  error={errors[metric.id] ?? null}
                />
              ))}
            </div>
          </section>

        </main>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 px-4 py-6 text-xs text-slate-500 text-center space-y-1">
        <p>
          Data:{' '}
          <a href="https://statistics.gov.scot" className="underline hover:text-green-700">
            statistics.gov.scot
          </a>{' '}
          — Open Government Licence. Queries hit the live SPARQL endpoint; data is updated annually with a lag.
        </p>
        <p>
          Built by{' '}
          <a href="https://stotte.co.uk" className="underline hover:text-green-700">
            Stotte Consultancy
          </a>
          . Comparing councils without context misleads — deprivation context is shown with every metric intentionally.
        </p>
      </footer>

    </div>
  )
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-green-800 text-white'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}
