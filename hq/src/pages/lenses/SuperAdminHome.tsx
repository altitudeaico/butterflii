import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { ReadinessBadge } from '../../components/ReadinessBadge'
import { ObjectiveCard } from '../../components/ObjectiveCard'
import { EmptyState } from '../../components/EmptyState'
import { BottomSheet } from '../../components/BottomSheet'
import { EventForm } from '../../components/forms/EventForm'
import { ObjectiveForm } from '../../components/forms/ObjectiveForm'
import { TaskForm } from '../../components/forms/TaskForm'
import { Spinner } from '../../components/Spinner'
import { useCreateEvent, useCurrentEvent } from '../../lib/queries/events'
import {
  useCreateObjective,
  useDeleteObjective,
  useObjectives,
  useUpdateObjective,
} from '../../lib/queries/objectives'
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../../lib/queries/tasks'
import { profileName, useProfiles } from '../../lib/queries/profiles'
import { computeReadiness } from '../../lib/readiness'
import type { Objective, Task } from '../../types'

type Sheet =
  | { kind: 'event' }
  | { kind: 'objective'; objective?: Objective }
  | { kind: 'task'; objectiveId: string; task?: Task }
  | null

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function SuperAdminHome() {
  const { profile, signOut } = useAuth()
  const [sheet, setSheet] = useState<Sheet>(null)

  const { data: event, isLoading: eventLoading } = useCurrentEvent()
  const { data: objectives = [] } = useObjectives(event?.id)
  const objectiveIds = useMemo(() => objectives.map((o) => o.id), [objectives])
  const { data: tasks = [] } = useTasks(objectiveIds)
  const { data: profiles = [] } = useProfiles()

  const createEvent = useCreateEvent()
  const createObjective = useCreateObjective()
  const updateObjective = useUpdateObjective()
  const deleteObjective = useDeleteObjective()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const readiness = useMemo(() => computeReadiness(tasks), [tasks])

  const eventSheetOpen = sheet?.kind === 'event'
  const objectiveSheet = sheet?.kind === 'objective' ? sheet : null
  const taskSheet = sheet?.kind === 'task' ? sheet : null

  if (eventLoading) return <Spinner />

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">
          Super admin
        </p>
        <h1 className="font-serif text-3xl">Welcome, {profile?.display_name}</h1>
      </div>

      {!event ? (
        <EmptyState
          message="No event yet. Create the next one to start planning."
          action={<Button onClick={() => setSheet({ kind: 'event' })}>Create your first event</Button>}
        />
      ) : (
        <>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-pink/30">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate font-serif text-xl">{event.name}</h2>
                <p className="text-sm text-brand-dark/50">
                  {event.location ? `${event.location} · ` : ''}
                  {daysUntil(event.event_date) >= 0
                    ? `${daysUntil(event.event_date)} days to go`
                    : 'Event has passed'}
                </p>
              </div>
              <button
                onClick={() => setSheet({ kind: 'event' })}
                className="shrink-0 text-sm text-brand-purple underline"
              >
                Edit
              </button>
            </div>
          </div>

          <ReadinessBadge score={readiness.score} band={readiness.band} />

          {readiness.blocking.length > 0 && (
            <div className="rounded-3xl bg-red-50 p-5 ring-1 ring-red-200">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-red-700">
                What's blocking readiness
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {readiness.blocking.map((task) => (
                  <p key={task.id} className="text-sm text-red-700">
                    {task.title}
                    {task.deadline ? ` · due ${task.deadline}` : ''}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Objectives</h2>
            <button
              onClick={() => setSheet({ kind: 'objective' })}
              className="text-sm font-semibold text-brand-purple"
            >
              + Add objective
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {objectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                tasks={tasks.filter((t) => t.objective_id === objective.id)}
                tone="plain"
                ownerName={(id) => profileName(profiles, id)}
                onTaskClick={(task) => setSheet({ kind: 'task', objectiveId: objective.id, task })}
                onEdit={() => setSheet({ kind: 'objective', objective })}
                onAddTask={() => setSheet({ kind: 'task', objectiveId: objective.id })}
              />
            ))}
            {objectives.length === 0 && (
              <EmptyState message="No objectives yet. Add the first one for this event." />
            )}
          </div>
        </>
      )}

      <Button variant="outline" onClick={signOut} className="mt-auto">
        Sign out
      </Button>

      <BottomSheet
        open={eventSheetOpen}
        onClose={() => setSheet(null)}
        title={event ? 'Edit event' : 'Create event'}
      >
        <EventForm
          initial={event ?? undefined}
          submitting={createEvent.isPending}
          onSubmit={(values) => {
            createEvent.mutate(
              { ...values, created_by: profile?.id ?? null },
              { onSuccess: () => setSheet(null) },
            )
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={objectiveSheet !== null}
        onClose={() => setSheet(null)}
        title={objectiveSheet?.objective ? 'Edit objective' : 'Add objective'}
      >
        {objectiveSheet && event && (
          <>
            <ObjectiveForm
              initial={objectiveSheet.objective}
              submitting={createObjective.isPending || updateObjective.isPending}
              onSubmit={(values) => {
                if (objectiveSheet.objective) {
                  updateObjective.mutate(
                    { id: objectiveSheet.objective.id, ...values },
                    { onSuccess: () => setSheet(null) },
                  )
                } else {
                  createObjective.mutate(
                    { ...values, event_id: event.id, sort_order: objectives.length },
                    { onSuccess: () => setSheet(null) },
                  )
                }
              }}
            />
            {objectiveSheet.objective && (
              <button
                onClick={() => {
                  deleteObjective.mutate(
                    { id: objectiveSheet.objective!.id, eventId: event.id },
                    { onSuccess: () => setSheet(null) },
                  )
                }}
                className="mt-3 text-sm text-red-600 underline"
              >
                Delete objective
              </button>
            )}
          </>
        )}
      </BottomSheet>

      <BottomSheet
        open={taskSheet !== null}
        onClose={() => setSheet(null)}
        title={taskSheet?.task ? 'Edit task' : 'Add task'}
      >
        {taskSheet && (
          <>
            <TaskForm
              initial={taskSheet.task}
              profiles={profiles}
              submitting={createTask.isPending || updateTask.isPending}
              onSubmit={(values) => {
                if (taskSheet.task) {
                  updateTask.mutate({ id: taskSheet.task.id, ...values }, { onSuccess: () => setSheet(null) })
                } else {
                  createTask.mutate(
                    { ...values, objective_id: taskSheet.objectiveId },
                    { onSuccess: () => setSheet(null) },
                  )
                }
              }}
            />
            {taskSheet.task && (
              <button
                onClick={() => {
                  deleteTask.mutate(taskSheet.task!.id, { onSuccess: () => setSheet(null) })
                }}
                className="mt-3 text-sm text-red-600 underline"
              >
                Delete task
              </button>
            )}
          </>
        )}
      </BottomSheet>
    </div>
  )
}
