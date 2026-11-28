import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { TaskRow } from '../../components/TaskRow'
import { EmptyState } from '../../components/EmptyState'
import { BottomSheet } from '../../components/BottomSheet'
import { TaskForm } from '../../components/forms/TaskForm'
import { Spinner } from '../../components/Spinner'
import { useCurrentEvent } from '../../lib/queries/events'
import { useObjectives } from '../../lib/queries/objectives'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from '../../lib/queries/tasks'
import { profileName, useProfiles } from '../../lib/queries/profiles'
import type { Task } from '../../types'

type Sheet = { kind: 'create' } | { kind: 'edit'; task: Task } | null

function needsAttention(task: Task): boolean {
  const today = new Date().toISOString().slice(0, 10)
  const overdue = !!task.deadline && task.deadline < today && task.status !== 'done'
  return overdue || task.status === 'blocked'
}

function EventWorkspace() {
  const { profile, signOut } = useAuth()
  const [sheet, setSheet] = useState<Sheet>(null)
  const [newTaskObjectiveId, setNewTaskObjectiveId] = useState('')

  const { data: event, isLoading: eventLoading } = useCurrentEvent()
  const { data: objectives = [] } = useObjectives(event?.id)
  const objectiveIds = useMemo(() => objectives.map((o) => o.id), [objectives])
  const { data: tasks = [] } = useTasks(objectiveIds)
  const { data: profiles = [] } = useProfiles()

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const updateStatus = useUpdateTaskStatus()
  const deleteTask = useDeleteTask()

  const attentionList = useMemo(() => tasks.filter(needsAttention), [tasks])
  const myTasks = useMemo(() => tasks.filter((t) => t.owner_id === profile?.id), [tasks, profile?.id])

  const createSheetOpen = sheet?.kind === 'create'
  const editSheet = sheet?.kind === 'edit' ? sheet : null

  if (eventLoading) return <Spinner />

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">
          Ops admin
        </p>
        <h1 className="font-serif text-3xl">Welcome, {profile?.display_name}</h1>
        {event && <p className="text-sm text-brand-dark/50">{event.name}</p>}
      </div>


      {!event ? (
        <EmptyState message="No event yet. Ask the super admin to create one." />
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-red-700">
              Needs attention
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {attentionList.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  tone="accountable"
                  ownerName={profileName(profiles, task.owner_id)}
                  onClick={() => setSheet({ kind: 'edit', task })}
                  onToggleDone={() =>
                    updateStatus.mutate({ id: task.id, status: task.status === 'done' ? 'todo' : 'done' })
                  }
                />
              ))}
              {attentionList.length === 0 && (
                <p className="text-sm text-brand-dark/40">Nothing overdue or blocked. Good.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl">Your tasks</h2>
              <button
                onClick={() => {
                  setNewTaskObjectiveId(objectives[0]?.id ?? '')
                  setSheet({ kind: 'create' })
                }}
                disabled={objectives.length === 0}
                className="text-sm font-semibold text-brand-purple disabled:opacity-40"
              >
                + Add task
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {myTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  tone="accountable"
                  ownerName={profileName(profiles, task.owner_id)}
                  onClick={() => setSheet({ kind: 'edit', task })}
                  onToggleDone={() =>
                    updateStatus.mutate({ id: task.id, status: task.status === 'done' ? 'todo' : 'done' })
                  }
                />
              ))}
              {myTasks.length === 0 && (
                <p className="text-sm text-brand-dark/40">Nothing assigned to you yet.</p>
              )}
            </div>
          </div>
        </>
      )}

      <Button variant="outline" onClick={signOut} className="mt-auto">
        Sign out
      </Button>

      <BottomSheet open={createSheetOpen} onClose={() => setSheet(null)} title="Add task">
        {objectives.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
              Objective
              <select
                value={newTaskObjectiveId}
                onChange={(e) => setNewTaskObjectiveId(e.target.value)}
                className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
              >
                {objectives.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </label>
            <TaskForm
              profiles={profiles}
              submitting={createTask.isPending}
              onSubmit={(values) => {
                if (!newTaskObjectiveId) return
                createTask.mutate(
                  { ...values, objective_id: newTaskObjectiveId },
                  { onSuccess: () => setSheet(null) },
                )
              }}
            />
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={editSheet !== null} onClose={() => setSheet(null)} title="Edit task">
        {editSheet && (
          <>
            <TaskForm
              initial={editSheet.task}
              profiles={profiles}
              submitting={updateTask.isPending}
              onSubmit={(values) => {
                updateTask.mutate({ id: editSheet.task.id, ...values }, { onSuccess: () => setSheet(null) })
              }}
            />
            <button
              onClick={() => {
                deleteTask.mutate(editSheet.task.id, { onSuccess: () => setSheet(null) })
              }}
              className="mt-3 text-sm text-red-600 underline"
            >
              Delete task
            </button>
          </>
        )}
      </BottomSheet>
    </div>
  )
}

import { ArtworkWorkspace } from '../ArtworkWorkspace'

export function OpsAdminHome() {
  const { signOut } = useAuth()
  const [events, setEvents] = useState(false)
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-5 py-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">Butterflii HQ</p><h1 className="font-serif text-3xl">Welcome back, Mum</h1><p className="text-sm text-brand-dark/60">Studio operations</p></div><button onClick={signOut} className="text-sm underline">Sign out</button></header>
    <nav aria-label="Studio navigation" className="flex flex-wrap gap-2 border-b border-brand-pink/30 pb-3"><button aria-pressed={!events} onClick={() => setEvents(false)} className={`rounded-xl px-4 py-2 font-semibold ${!events ? 'bg-brand-purple text-white' : 'bg-white'}`}>Studio overview</button><button aria-pressed={events} onClick={() => setEvents(true)} className={`rounded-xl px-4 py-2 font-semibold ${events ? 'bg-brand-purple text-white' : 'bg-white'}`}>Events & planning</button></nav>
    {events ? <section><p className="text-sm text-brand-dark/60">Event plans and historical records. Past deadlines are not current studio priorities.</p><EventWorkspace /></section> : <>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-pink/30"><h2 className="font-serif text-xl">Your studio at a glance</h2><p className="mt-2 text-sm text-brand-dark/70">Review artwork submissions and feedback here. Orders, inventory and financial reporting are not connected to this dashboard yet.</p></section>
      <ArtworkWorkspace />
    </>}
  </main>
}
