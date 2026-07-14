import type { Task } from '../types'

// Critical tasks dominate the percentage, not only the band, so the number
// itself trends honest well before a task is actually complete.
const CRITICAL_MULTIPLIER = 10
const READY_THRESHOLD = 85

export type ReadinessBand = 'red' | 'amber' | 'green'

export type Readiness = {
  score: number
  band: ReadinessBand
  blocking: Task[]
}

function effectiveWeight(task: Task): number {
  return task.is_critical ? task.weight * CRITICAL_MULTIPLIER : task.weight
}

export function computeReadiness(tasks: Task[]): Readiness {
  const totalWeight = tasks.reduce((sum, task) => sum + effectiveWeight(task), 0)
  const doneWeight = tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + effectiveWeight(task), 0)

  const score = totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100)

  const blocking = tasks
    .filter((task) => task.is_critical && task.status !== 'done')
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })

  // A single incomplete critical task forces red regardless of the overall
  // percentage: the score must be honest about risk, not flatter task count.
  const band: ReadinessBand =
    blocking.length > 0 ? 'red' : score >= READY_THRESHOLD ? 'green' : 'amber'

  return { score, band, blocking }
}
