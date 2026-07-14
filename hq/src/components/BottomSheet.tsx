import { useEffect, useState, type ReactNode } from 'react'

// A full-height mobile sheet rather than a centred desktop-style modal, so
// the primary action stays reachable by thumb (DESIGN-GUIDE's "one-handed by
// default"). Plain CSS transition, no Framer Motion: that's Phase 6.
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(open)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(raf)
    }
    setEntered(false)
  }, [open])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`absolute inset-0 bg-brand-dark/40 transition-opacity motion-reduce:transition-none ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-brand-cream p-6 shadow-2xl transition-transform duration-300 motion-reduce:transition-none ${
          entered ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTransitionEnd={() => {
          if (!open) setMounted(false)
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-brand-pink/40" />
        <h2 className="mb-4 font-serif text-xl text-brand-dark">{title}</h2>
        {children}
      </div>
    </div>
  )
}
