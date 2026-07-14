import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { Event, NewEvent } from '../../types'

// A one-event-at-a-time business: "current" is simply the soonest event that
// hasn't wrapped, no separate "is_current" flag to keep in sync.
export function useCurrentEvent() {
  return useQuery({
    queryKey: ['events', 'current'],
    queryFn: async (): Promise<Event | null> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .neq('mode', 'wrapped')
        .order('event_date', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (event: NewEvent) => {
      const { data, error } = await supabase.from('events').insert(event).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
