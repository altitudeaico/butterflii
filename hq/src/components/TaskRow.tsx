import type { Task } from '../types'
import { StatusChip, type ChipTone } from './StatusChip'

export type TaskTone = 'plain' | 'accountable' | 'encouraging'

function isOverdue(task: Task): boolean {
  if (!task.deadline || task.status === 'done') return false
  return task.deadline < new Date().toISOString().slice(0, 10)
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null
  return new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// The artist's tone never surfaces "overdue" or "blocked": a late task is
// just her next step, same underlying data, reframed at the component level
// per CLAUDE.md's design constraint. Plain/accountable both show the honest
// state; accountable additionally bolds it, since the ops lens is meant to
// make a slip impossible to miss.
function display(task: Task, tone: TaskTone): { label: string; chipTone: ChipTone } {
  if (tone === 'encouraging') {
    if (task.status === 'done') return { label: 'Done!', chipTone: 'gold' }
    if (task.status === 'doing') return { label: 'In progress', chipTone: 'purple' }
    return { label: 'Your next step', chipTone: 'purple' }
  }

  if (task.status === 'done') return { label: 'Done', chipTone: 'green' }
  if (isOverdue(task)) return { label: 'Overdue', chipTone: 'red' }
  if (task.status === 'blocked') return { label: 'Blocked', chipTone: 'red' }
  if (task.status === 'doing') return { label: 'Doing', chipTone: tone === 'accountable' ? 'amber' : 'purple' }
  return { label: 'To do', chipTone: 'slate' }
}

export function TaskRow({
  task,
  ownerName,
  tone,
  onClick,
  onToggleDone,
}: {
  task: Task
  ownerName?: string
  tone: TaskTone
  onClick?: () => void
  onToggleDone?: () => void
}) {
  const { label, chipTone } = display(task, tone)
  const deadline = formatDeadline(task.deadline)
  const emphasize = tone === 'accountable' && chipTone === 'red'

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-pink/20 ${
        onClick ? 'cursor-pointer transition-transform active:scale-[0.99]' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${emphasize ? 'text-red-700' : 'text-brand-dark'}`}>
          {task.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-brand-dark/50">
          {ownerName}
          {ownerName && deadline ? ' · ' : ''}
          {deadline}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusChip label={label} tone={chipTone} />
        {onToggleDone && task.status !== 'done' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleDone()
            }}
            aria-label="Mark done"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple text-white shadow-sm transition-transform active:scale-90"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  )
}
