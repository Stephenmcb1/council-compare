/**
 * RadarChart.jsx
 *
 * A Chart.js radar chart showing Council A vs Council B across all 4 metrics.
 *
 * Chart.js works with normalised values (0–100 scale) so that metrics with
 * wildly different units (%, £) can appear on the same chart. We normalise
 * each metric relative to the Scottish min/max range.
 *
 * react-chartjs-2 is a thin React wrapper around Chart.js. You register the
 * chart types and elements you need, then pass a `data` and `options` object.
 *
 * Normalisation note:
 *   For "higher is better" metrics (e.g. education attainment), a higher
 *   normalised score = visually larger = better.
 *   For "lower is better" metrics (e.g. council tax), we invert: score = 100 - normalised,
 *   so the chart remains intuitive (bigger = better).
 */

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { METRICS } from '../lib/metrics.js'

// Register the Chart.js components we use.
// Chart.js v3+ requires explicit registration — this prevents unused code being bundled.
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

/**
 * @param {Object}  props
 * @param {string}  props.councilALabel
 * @param {string}  props.councilBLabel
 * @param {Object}  props.valuesA  - { [metricId]: number }
 * @param {Object}  props.valuesB  - { [metricId]: number }
 * @param {boolean} props.loading
 */
export default function RadarChart({ councilALabel, councilBLabel, valuesA, valuesB, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
        Loading chart…
      </div>
    )
  }

  // We need at least some values to render anything useful
  const hasData = METRICS.some(
    (m) => valuesA[m.id] !== undefined && valuesB[m.id] !== undefined
  )
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Select both councils to see the comparison chart.
      </div>
    )
  }

  // Normalise values to 0–100 scale per metric.
  // We use both councils' values as the range — rough but enough for Phase 1.
  // A proper implementation would use the Scotland-wide min/max from the dataset.
  const labels = METRICS.map((m) => m.label)

  const normalisedA = METRICS.map((m) => normalise(m, valuesA[m.id], valuesB[m.id], valuesA[m.id]))
  const normalisedB = METRICS.map((m) => normalise(m, valuesA[m.id], valuesB[m.id], valuesB[m.id]))

  const data = {
    labels,
    datasets: [
      {
        label: councilALabel,
        data: normalisedA,
        backgroundColor: 'rgba(29, 78, 216, 0.1)',   // blue-700 at low opacity
        borderColor: 'rgba(29, 78, 216, 0.8)',
        pointBackgroundColor: 'rgba(29, 78, 216, 1)',
        borderWidth: 2,
      },
      {
        label: councilBLabel,
        data: normalisedB,
        backgroundColor: 'rgba(180, 83, 9, 0.1)',    // amber-700 at low opacity
        borderColor: 'rgba(180, 83, 9, 0.8)',
        pointBackgroundColor: 'rgba(180, 83, 9, 1)',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(100, 116, 139, 0.2)' },      // slate-500 low opacity
        pointLabels: { color: '#475569', font: { size: 12 } }, // slate-600
        angleLines: { color: 'rgba(100, 116, 139, 0.2)' },
      },
    },
    plugins: {
      legend: {
        labels: { color: '#334155', font: { size: 13 } }, // slate-700
      },
      tooltip: {
        callbacks: {
          // Show original value in tooltip, not the normalised score
          label: (ctx) => {
            const metricId = METRICS[ctx.dataIndex]?.id
            const rawVal = ctx.datasetIndex === 0 ? valuesA[metricId] : valuesB[metricId]
            const metric = METRICS[ctx.dataIndex]
            return rawVal !== undefined
              ? `${ctx.dataset.label}: ${Number(rawVal).toLocaleString('en-GB')}${metric?.unit ?? ''}`
              : ctx.dataset.label
          },
        },
      },
    },
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <Radar data={data} options={options} />
      <p className="text-xs text-center text-slate-500 mt-2">
        Chart shows normalised scores (0–100). Tooltips show actual values. Bigger area = relatively
        higher on each metric. See metric cards for directional context.
      </p>
    </div>
  )
}

/**
 * Normalise a value to 0–100 given the two council values and the metric direction.
 *
 * @param {Object} metric  - metric definition from METRICS
 * @param {number} valA    - Council A's value for this metric
 * @param {number} valB    - Council B's value for this metric
 * @param {number} val     - The value to normalise
 * @returns {number}       - 0–100
 */
function normalise(metric, valA, valB, val) {
  if (val === undefined || val === null) return 0
  const min = Math.min(Number(valA), Number(valB))
  const max = Math.max(Number(valA), Number(valB))
  if (min === max) return 50 // both the same — put both at centre

  const raw = ((Number(val) - min) / (max - min)) * 100

  // Invert for "lower is better" metrics so bigger area = better outcome
  return metric.higherIsBetter === false ? 100 - raw : raw
}
