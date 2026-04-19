/**
 * LeagueTablePage.jsx
 *
 * Deprivation-adjusted council rankings using the peer group methodology.
 *
 * Rather than ranking all 32 councils together (which would reward councils in
 * wealthy areas and penalise those managing high deprivation), councils are grouped
 * by SIMD 2020 deprivation profile and ranked only against peers with similar
 * structural conditions. This is the same approach used by NHS Scotland for
 * benchmarking outcomes across health boards.
 *
 * Only rate-based metrics are included in the composite score. Absolute-count
 * metrics (crime, homelessness, drug discharges) are excluded because they
 * scale with population size and cannot be fairly compared without denominators.
 *
 * Composite score calculation:
 *   1. For each of 6 rate metrics, fetch the latest value for all 32 councils.
 *   2. Normalise each metric to a 0–100 scale using Scotland-wide min/max.
 *   3. Invert lower-is-better metrics so that 100 always means relatively better.
 *   4. Average the available normalised scores per council → composite (0–100).
 *   5. Rank within each SIMD peer group, highest composite first.
 */

import { useState, useEffect } from 'react'
import { COUNCILS } from '../lib/councils.js'
import { PEER_GROUPS } from '../lib/peerGroups.js'
import { querySparql, flattenBindings } from '../lib/sparql.js'

// The 6 rate metrics used for ranking — verified against the SPARQL endpoint.
const RANKING_METRICS = [
  {
    id: 'school-attendance',
    label: 'School Attendance',
    unit: '%',
    higherIsBetter: true,
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
SELECT ?area ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/school-attendance-rate> ;
       sdmx:refArea ?area ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/schoolType>
         <http://statistics.gov.scot/def/concept/school-type/primary> ;
       mp:ratio ?value .
  FILTER(REGEX(str(?area), "/S12000"))
}`.trim(),
  },
  {
    id: 'council-tax-collection',
    label: 'Tax Collection Rate',
    unit: '%',
    higherIsBetter: true,
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
SELECT ?area ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/council-tax-collection-rates> ;
       sdmx:refArea ?area ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/councilTaxCollection>
         <http://statistics.gov.scot/def/concept/council-tax-collection/collection-rate> ;
       mp:percent ?value .
  FILTER(REGEX(str(?area), "/S12000"))
}`.trim(),
  },
  {
    id: 'looked-after-children',
    label: 'Looked After Children',
    unit: ' per 1,000',
    higherIsBetter: false,
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
SELECT ?area ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/looked-after-children> ;
       sdmx:refArea ?area ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/residentialStatus>
         <http://statistics.gov.scot/def/concept/residential-status/all> ;
       mp:ratio ?value .
  FILTER(REGEX(str(?area), "/S12000"))
}`.trim(),
  },
  {
    id: 'healthy-life-expectancy',
    label: 'Healthy Life Expectancy',
    unit: ' yrs',
    higherIsBetter: true,
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>
SELECT ?area ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/healthy-life-expectancy> ;
       sdmx:refArea ?area ;
       sdmx:refPeriod ?period ;
       dim:sex <http://statistics.gov.scot/def/concept/sex/female> ;
       dim:age <http://statistics.gov.scot/def/concept/age/0-years> ;
       dim:simdQuintiles <http://statistics.gov.scot/def/concept/simd-quintiles/all> ;
       dim:urbanRuralClassification <http://statistics.gov.scot/def/concept/urban-rural-classification/all> ;
       mp:count ?value .
  FILTER(REGEX(str(?area), "/S12000"))
}`.trim(),
  },
  {
    id: 'fuel-poverty',
    label: 'Fuel Poverty',
    unit: '%',
    higherIsBetter: false,
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>
SELECT ?area ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/fuel-poverty-shcs> ;
       sdmx:refArea ?area ;
       sdmx:refPeriod ?period ;
       dim:fuelPoverty <http://statistics.gov.scot/def/concept/fuel-poverty/fuel-poor> ;
       dim:typeOfDwelling <http://statistics.gov.scot/def/concept/type-of-dwelling/all> ;
       dim:ageOfDwelling <http://statistics.gov.scot/def/concept/age-of-dwelling/all> ;
       dim:numberOfBedrooms <http://statistics.gov.scot/def/concept/number-of-bedrooms/all> ;
       dim:typeOfTenure <http://statistics.gov.scot/def/concept/type-of-tenure/all> ;
       dim:householdType <http://statistics.gov.scot/def/concept/household-type/all> ;
       mp:percent ?value .
  FILTER(REGEX(str(?area), "/S12000"))
}`.trim(),
  },
  {
    id: 'unemployment',
    label: 'Unemployment Rate',
    unit: '%',
    higherIsBetter: false,
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
SELECT ?area ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/unemployment-model-based-estimates> ;
       sdmx:refArea ?area ;
       sdmx:refPeriod ?period ;
       mp:ratio ?value .
  FILTER(REGEX(str(?area), "/S12000"))
}`.trim(),
  },
]

// Build a map from geography code → council slug for matching SPARQL results to councils
const CODE_TO_SLUG = Object.fromEntries(COUNCILS.map((c) => [c.code, c.slug]))

/**
 * Given all rows for one metric, return { [councilSlug]: latestValue }
 * Takes the most recent period per council area.
 */
function latestPerCouncil(rows) {
  // rows: [{ area, value, period }, ...]
  // Sort DESC by period string (lexicographic works for ISO year strings)
  const sorted = [...rows].sort((a, b) => b.period.localeCompare(a.period))
  const seen = {}
  for (const row of sorted) {
    const code = row.area.split('/').pop()
    const slug = CODE_TO_SLUG[code]
    if (slug && !(slug in seen)) {
      seen[slug] = parseFloat(row.value)
    }
  }
  return seen
}

/**
 * Normalise a value to 0–100 given the min/max across all councils.
 * Inverts for lower-is-better metrics so that 100 always = relatively better outcome.
 */
function normalise(value, min, max, higherIsBetter) {
  if (min === max) return 50
  const raw = ((value - min) / (max - min)) * 100
  return higherIsBetter ? raw : 100 - raw
}

export default function LeagueTablePage() {
  const [metricData, setMetricData] = useState(null) // { [metricId]: { [slug]: value } }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.all(
          RANKING_METRICS.map(async (m) => {
            const json = await querySparql(m.query)
            const rows = flattenBindings(json)
            return [m.id, latestPerCouncil(rows)]
          })
        )
        setMetricData(Object.fromEntries(results))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 animate-pulse">
        Loading data for all 32 councils…
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-red-700">
        Failed to load data: {error}
      </div>
    )
  }

  // Compute Scotland-wide min/max per metric for normalisation
  const ranges = {}
  for (const m of RANKING_METRICS) {
    const values = Object.values(metricData[m.id] ?? {}).filter((v) => !isNaN(v))
    ranges[m.id] = {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  // Compute composite score per council
  const compositeScores = {}
  for (const council of COUNCILS) {
    const scores = RANKING_METRICS.map((m) => {
      const val = metricData[m.id]?.[council.slug]
      if (val === undefined || isNaN(val)) return null
      const { min, max } = ranges[m.id]
      return normalise(val, min, max, m.higherIsBetter)
    }).filter((s) => s !== null)

    compositeScores[council.slug] = scores.length >= 3
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-10">

      {/* Introduction */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900">Peer Group Rankings</h2>

        <p className="text-slate-700">
          Ranking all 32 Scottish councils in a single league table would be misleading.
          A council managing Glasgow's levels of concentrated deprivation, post-industrial
          unemployment, and poor housing stock faces fundamentally different structural
          pressures than one covering the affluent Edinburgh suburbs. Ranking them together
          rewards geography, not governance.
        </p>

        <p className="text-slate-700">
          Instead, this page uses the{' '}
          <strong className="text-slate-900">peer group methodology</strong> — the same approach
          used by NHS Scotland to benchmark outcomes across health boards. Councils are grouped
          by their deprivation profile using{' '}
          <a
            href="https://www.gov.scot/publications/scottish-index-multiple-deprivation-2020/"
            className="text-green-700 underline hover:text-green-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            SIMD 2020
          </a>{' '}
          data, then ranked only against peers facing similar structural conditions.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 text-sm">
          <p className="font-semibold text-slate-900">How the composite score is calculated</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-600">
            <li>
              Six rate-based metrics are fetched for all 32 councils from{' '}
              <a href="https://statistics.gov.scot" className="text-green-700 underline hover:text-green-900">
                statistics.gov.scot
              </a>{' '}
              via live SPARQL queries.
            </li>
            <li>
              Each metric is normalised to a 0–100 scale using the Scotland-wide min and max,
              so that 100 always means relatively better and 0 means relatively worse — regardless
              of whether higher or lower raw values are better for that metric.
            </li>
            <li>
              The six normalised scores are averaged to produce a single composite score per council.
              Councils with fewer than three metrics available are excluded.
            </li>
            <li>
              Councils are ranked by composite score within their SIMD peer group, not across all 32.
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-900">
          <strong className="text-amber-800">Metrics included:</strong> School attendance,
          council tax collection rate, looked-after children (per 1,000), healthy life expectancy,
          fuel poverty, and unemployment rate. Absolute-count metrics (crime, homelessness,
          drug discharges) are excluded because they scale with population size and cannot be
          fairly compared without per-capita denominators.{' '}
          <strong className="text-amber-800">Data currency varies</strong> by dataset — see
          the Compare page for the year of each metric.
        </div>
      </section>

      {/* Peer group tables */}
      {PEER_GROUPS.map((group) => {
        const members = group.slugs
          .map((slug) => COUNCILS.find((c) => c.slug === slug))
          .filter(Boolean)
          .map((council) => ({
            council,
            score: compositeScores[council.slug],
            metricValues: Object.fromEntries(
              RANKING_METRICS.map((m) => [m.id, metricData[m.id]?.[council.slug]])
            ),
          }))
          .filter((m) => m.score !== null)
          .sort((a, b) => b.score - a.score)

        return (
          <section key={group.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-900">{group.label}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest">
                SIMD 2020: {group.deprivationRange}
              </p>
              <p className="text-sm text-slate-600">{group.description}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-3 text-slate-500 font-medium w-8">#</th>
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Council</th>
                    <th className="text-right py-2 pr-4 text-slate-500 font-medium">Score</th>
                    {RANKING_METRICS.map((m) => (
                      <th key={m.id} className="text-right py-2 px-2 text-slate-500 font-medium whitespace-nowrap hidden sm:table-cell">
                        {m.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map(({ council, score, metricValues }, i) => (
                    <tr key={council.slug} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="py-2.5 pr-4 text-slate-800 font-medium">{council.label}</td>
                      <td className="py-2.5 pr-4 text-right">
                        <ScoreBar score={score} />
                      </td>
                      {RANKING_METRICS.map((m) => {
                        const val = metricValues[m.id]
                        return (
                          <td key={m.id} className="py-2.5 px-2 text-right text-slate-600 hidden sm:table-cell">
                            {val !== undefined && !isNaN(val)
                              ? `${Number(val).toLocaleString('en-GB', { maximumFractionDigits: 1 })}${m.unit}`
                              : <span className="text-slate-400">—</span>
                            }
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      {/* Data transparency footer */}
      <section className="border-t border-slate-200 pt-6 flex flex-col gap-2 text-xs text-slate-500">
        <p>
          All data sourced from{' '}
          <a href="https://statistics.gov.scot" className="underline hover:text-green-700">
            statistics.gov.scot
          </a>{' '}
          via live SPARQL queries — Open Government Licence. Peer groups based on SIMD 2020
          published by the Scottish Government. Composite scores are computed in-browser from
          raw data; no pre-processing or editorial adjustment has been applied.
        </p>
        <p>
          This ranking is a tool for structured comparison, not a judgement. A council at the
          bottom of its peer group may be improving rapidly; one at the top may be declining.
          Use the Compare page to explore individual metrics and their caveats.
        </p>
      </section>

    </main>
  )
}

/** Small inline score bar + number */
function ScoreBar({ score }) {
  const pct = Math.round(score)
  const colour =
    pct >= 65 ? 'bg-emerald-500' :
    pct >= 45 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
        <div className={`h-full rounded-full ${colour}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-700 font-mono text-xs w-8 text-right">{pct}</span>
    </div>
  )
}
