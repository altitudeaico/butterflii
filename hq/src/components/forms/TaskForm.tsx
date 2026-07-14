import { useState, type FormEvent } from 'react'
import { Button } from '../Button'
import type { NewTask, Profile, Task, TaskStatus } from '../../types'

type TaskFields = Pick<NewTask, 'title' | 'owner_id' | 'deadline' | 'weight' | 'is_critical' | 'status'>

export function TaskForm({
  initial,
  profiles,
  onSubmit,
  submitting,
}: {
  initial?: Task
  profiles: Profile[]
  onSubmit: (values: TaskFields) => void
  submitting?: boolean
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [ownerId, setOwnerId] = useState(initial?.owner_id ?? '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? '1')
  const [isCritical, setIsCritical] = useState(initial?.is_critical ?? false)
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      title,
      owner_id: ownerId || null,
      deadline: deadline || null,
      weight: Number(weight) || 1,
      is_critical: isCritical,
      status,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Task
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Owner
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        >
          <option value="">Unassigned</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Deadline
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Weight
        <input
          type="number"
          min={1}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-brand-dark/70">
        <input
          type="checkbox"
          checked={isCritical}
          onChange={(e) => setIsCritical(e.target.checked)}
          className="h-5 w-5 rounded"
        />
        Critical path
      </label>
      {initial && (
        <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
          >
            <option value="todo">To do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>
      )}
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add task'}
      </Button>
    </form>
  )
}
