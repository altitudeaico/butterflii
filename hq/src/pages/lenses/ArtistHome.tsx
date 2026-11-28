import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { TaskRow } from '../../components/TaskRow'
import { EmptyState } from '../../components/EmptyState'
import { BottomSheet } from '../../components/BottomSheet'
import { Button } from '../../components/Button'
import { Spinner } from '../../components/Spinner'
import { useCurrentEvent } from '../../lib/queries/events'
import { useObjectives } from '../../lib/queries/objectives'
import { useCreateTask, useTasks, useUpdateTaskStatus } from '../../lib/queries/tasks'

function EventWorkspace() {
  const { profile, signOut } = useAuth()
  const [ideaOpen, setIdeaOpen] = useState(false)
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaObjectiveId, setIdeaObjectiveId] = useState('')

  const { data: event, isLoading: eventLoading } = useCurrentEvent()
  const { data: objectives = [] } = useObjectives(event?.id)
  const objectiveIds = useMemo(() => objectives.map((o) => o.id), [objectives])
  const { data: tasks = [] } = useTasks(objectiveIds)

  const updateStatus = useUpdateTaskStatus()
  const createTask = useCreateTask()

  const myTasks = useMemo(() => tasks.filter((t) => t.owner_id === profile?.id), [tasks, profile?.id])
  const doneCount = myTasks.filter((t) => t.status === 'done').length

  if (eventLoading) return <Spinner />

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center gap-6 px-6 py-10 text-center">
      <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="Butterflii" className="h-16 w-auto" />
      <h1 className="font-serif text-3xl text-brand-purple-deep">Hi {profile?.display_name}!</h1>


      {!event ? (
        <EmptyState message="Nothing to show yet. Ask a grown-up to get things started!" />
      ) : myTasks.length === 0 ? (
        <EmptyState message="No steps yet. Check back soon, or share an idea below!" />
      ) : (
        <>
          <p className="font-semibold text-brand-dark/70">
            {doneCount} of {myTasks.length} steps done!
          </p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-brand-pink/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-gold transition-all"
              style={{ width: `${(doneCount / myTasks.length) * 100}%` }}
            />
          </div>
          <div className="flex w-full flex-col gap-2 text-left">
            {myTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                tone="encouraging"
                onToggleDone={() =>
                  updateStatus.mutate({ id: task.id, status: task.status === 'done' ? 'todo' : 'done' })
                }
              />
            ))}
          </div>
        </>
      )}

      {objectives.length > 0 && (
        <button onClick={() => setIdeaOpen(true)} className="text-sm font-semibold text-brand-purple">
          + Share an idea
        </button>
      )}

      <button onClick={signOut} className="mt-auto text-sm text-brand-dark/40 underline">
        Sign out
      </button>

      <BottomSheet open={ideaOpen} onClose={() => setIdeaOpen(false)} title="Share an idea">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!ideaTitle || !ideaObjectiveId) return
            createTask.mutate(
              {
                title: ideaTitle,
                objective_id: ideaObjectiveId,
                origin: 'artist_idea',
                owner_id: null,
                status: 'todo',
                is_critical: false,
              },
              {
                onSuccess: () => {
                  setIdeaTitle('')
                  setIdeaOpen(false)
                },
              },
            )
          }}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-left text-sm font-semibold text-brand-dark/70">
            Your idea
            <input
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              required
              className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
            />
          </label>
          <label className="flex flex-col gap-1 text-left text-sm font-semibold text-brand-dark/70">
            Which part of the plan?
            <select
              value={ideaObjectiveId}
              onChange={(e) => setIdeaObjectiveId(e.target.value)}
              required
              className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
            >
              <option value="">Choose one</option>
              {objectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? 'Sending...' : 'Send idea'}
          </Button>
        </form>
      </BottomSheet>
    </div>
  )
}

import { ArtworkWorkspace } from '../ArtworkWorkspace'

export function ArtistHome() {
  const { signOut } = useAuth()
  const [events, setEvents] = useState(false)
  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-5 py-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">Butterflii HQ</p><h1 className="font-serif text-3xl">Welcome to your studio, Elsie!</h1><p className="text-sm text-brand-dark/60">My creative space</p></div><button onClick={signOut} className="text-sm underline">Sign out</button></header>
    <nav aria-label="Studio navigation" className="flex flex-wrap gap-2 border-b border-brand-pink/30 pb-3"><button aria-pressed={!events} onClick={() => setEvents(false)} className={`rounded-xl px-4 py-2 font-semibold ${!events ? 'bg-brand-purple text-white' : 'bg-white'}`}>My artwork</button><button aria-pressed={events} onClick={() => setEvents(true)} className={`rounded-xl px-4 py-2 font-semibold ${events ? 'bg-brand-purple text-white' : 'bg-white'}`}>Events & planning</button></nav>
    {events ? <section><p className="text-sm text-brand-dark/60">Event plans and historical records. Past deadlines are not current studio priorities.</p><EventWorkspace /></section> : <>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-pink/30"><h2 className="font-serif text-xl">Create something wonderful</h2><p className="mt-2 text-sm text-brand-dark/70">Give your artwork a name, tell us about it and choose a price. Mum or Dad can review it.</p></section>
      <ArtworkWorkspace />
    </>}
  </main>
}
