import type { Objective, Task } from '../types'
import { TaskRow, type TaskTone } from './TaskRow'

export function ObjectiveCard({
  objective,
  tasks,
  tone,
  ownerName,
  onTaskClick,
  onToggleTaskDone,
  onEdit,
  onAddTask,
}: {
  objective: Objective
  tasks: Task[]
  tone: TaskTone
  ownerName: (id: string | null) => string | undefined
  onTaskClick?: (task: Task) => void
  onToggleTaskDone?: (task: Task) => void
  onEdit?: () => void
  onAddTask?: () => void
}) {
  return (
    <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-brand-pink/20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg text-brand-dark">{objective.title}</h3>
          {objective.why && <p className="mt-0.5 text-sm text-brand-dark/60">{objective.why}</p>}
        </div>
        {onEdit && (
          <button onClick={onEdit} className="shrink-0 text-sm text-brand-purple underline">
            Edit
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            tone={tone}
            ownerName={ownerName(task.owner_id)}
            onClick={onTaskClick ? () => onTaskClick(task) : undefined}
            onToggleDone={onToggleTaskDone ? () => onToggleTaskDone(task) : undefined}
          />
        ))}
        {tasks.length === 0 && <p className="text-sm text-brand-dark/40">No tasks yet.</p>}
      </div>
      {onAddTask && (
        <button onClick={onAddTask} className="mt-3 text-sm font-semibold text-brand-purple">
          + Add a task
        </button>
      )}
    </div>
  )
}
