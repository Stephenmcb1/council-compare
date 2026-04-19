import { getCouncilControl, PARTY_COLOURS } from '../lib/councilControl.js'

/**
 * Shows the political administration for two councils side by side.
 * Designed to sit between the CouncilSelector and the metrics.
 */
export default function PoliticalControl({ councilALabel, councilBLabel, slugA, slugB }) {
  const controlA = getCouncilControl(slugA)
  const controlB = getCouncilControl(slugB)

  if (!controlA && !controlB) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ControlCard label={councilALabel} control={controlA} />
      <ControlCard label={councilBLabel} control={controlB} />
    </div>
  )
}

function ControlCard({ label, control }) {
  if (!control) return <div />

  const typeLabel = {
    majority: 'Majority',
    minority: 'Minority',
    coalition: 'Coalition',
  }[control.adminType] ?? control.adminType

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600 truncate">{label}</span>
        <span className="text-xs text-slate-400 whitespace-nowrap">{typeLabel}</span>
      </div>

      {/* Administration party badges */}
      <div className="flex flex-wrap gap-1.5">
        {control.administration.map((party) => (
          <PartyBadge key={party} party={party} />
        ))}
        {control.support && control.support.length > 0 && (
          <>
            <span className="text-xs text-slate-400 self-center">+ support:</span>
            {control.support.map((party) => (
              <PartyBadge key={party} party={party} faded />
            ))}
          </>
        )}
      </div>

      {/* Context note */}
      <p className="text-xs text-slate-500 leading-relaxed">{control.notes}</p>

      <p className="text-xs text-slate-400">
        As of May 2022 election · Next election: 2026
      </p>
    </div>
  )
}

function PartyBadge({ party, faded = false }) {
  const colours = PARTY_COLOURS[party] ?? { bg: '#9CA3AF', text: '#ffffff' }
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: colours.bg,
        color: colours.text,
        opacity: faded ? 0.65 : 1,
      }}
    >
      {party}
    </span>
  )
}
