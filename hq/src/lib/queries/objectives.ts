import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { NewObjective, Objective } from '../../types'

export function useObjectives(eventId: string | undefined) {
  return useQuery({
    queryKey: ['objectives', eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<Objective[]> => {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('event_id', eventId as string)
        .order('sort_order')
      if (error) throw error
      return data
    },
  })
}

export function useCreateObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (objective: NewObjective) => {
      const { data, error } = await supabase.from('objectives').insert(objective).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objectives', data.event_id] })
    },
  })
}

export function useUpdateObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Objective> & { id: string }) => {
      const { data, error } = await supabase
        .from('objectives')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objectives', data.event_id] })
    },
  })
}

export function useDeleteObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('objectives').delete().eq('id', id)
      if (error) throw error
      return { id, eventId }
    },
    onSuccess: ({ eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['objectives', eventId] })
    },
  })
}
