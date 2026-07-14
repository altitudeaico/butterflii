import { useState, type FormEvent } from 'react'
import { Button } from '../Button'
import type { NewObjective, Objective } from '../../types'

type ObjectiveFields = Pick<NewObjective, 'title' | 'why' | 'target'>

export function ObjectiveForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Objective
  onSubmit: (values: ObjectiveFields) => void
  submitting?: boolean
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [why, setWhy] = useState(initial?.why ?? '')
  const [target, setTarget] = useState(initial?.target?.toString() ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ title, why: why || null, target: target ? Number(target) : null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Objective
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Why it matters
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={3}
          className="rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Numeric target (optional)
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add objective'}
      </Button>
    </form>
  )
}
