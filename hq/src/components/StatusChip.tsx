export type ChipTone = 'slate' | 'purple' | 'amber' | 'red' | 'green' | 'gold'

const TONE_CLASSES: Record<ChipTone, string> = {
  slate: 'bg-brand-dark/10 text-brand-dark/70',
  purple: 'bg-brand-purple/15 text-brand-purple-deep',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  green: 'bg-emerald-100 text-emerald-700',
  gold: 'bg-brand-gold/25 text-amber-800',
}

export function StatusChip({ label, tone }: { label: string; tone: ChipTone }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  )
}
