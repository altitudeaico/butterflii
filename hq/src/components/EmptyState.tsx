import type { ReactNode } from 'react'

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/60 p-8 text-center ring-1 ring-brand-pink/20">
      <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="Butterflii" className="h-12 w-auto" />
      <p className="text-brand-dark/60">{message}</p>
      {action}
    </div>
  )
}
