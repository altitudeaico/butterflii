import { useState, type FormEvent } from 'react'
import { Button } from '../Button'
import type { Event, NewEvent } from '../../types'

type EventFields = Pick<NewEvent, 'name' | 'event_date' | 'location'>

export function EventForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Event
  onSubmit: (values: EventFields) => void
  submitting?: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [eventDate, setEventDate] = useState(initial?.event_date ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ name, event_date: eventDate, location: location || null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Event name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Date
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-brand-dark/70">
        Location
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="min-h-11 rounded-2xl border border-brand-pink/50 px-4 py-2 outline-none focus:border-brand-purple"
        />
      </label>
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Saving...' : initial ? 'Save changes' : 'Create event'}
      </Button>
    </form>
  )
}
