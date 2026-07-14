import type { ReadinessBand } from '../lib/readiness'

const BAND_STYLES: Record<ReadinessBand, { bg: string; text: string; label: string }> = {
  red: { bg: 'bg-red-50 ring-red-200', text: 'text-red-700', label: 'Not ready' },
  amber: { bg: 'bg-amber-50 ring-amber-200', text: 'text-amber-700', label: 'On track' },
  green: { bg: 'bg-emerald-50 ring-emerald-200', text: 'text-emerald-700', label: 'Ready' },
}

export function ReadinessBadge({ score, band }: { score: number; band: ReadinessBand }) {
  const style = BAND_STYLES[band]
  return (
    <div className={`rounded-3xl p-6 text-center shadow-sm ring-1 ${style.bg}`}>
      <p className={`text-6xl font-bold ${style.text}`}>{score}</p>
      <p className={`mt-1 text-sm font-semibold uppercase tracking-widest ${style.text}`}>
        {style.label}
      </p>
    </div>
  )
}
