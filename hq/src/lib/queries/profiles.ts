import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { Profile } from '../../types'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.from('profiles').select('*').order('display_name')
      if (error) throw error
      return data
    },
  })
}

export function profileName(profiles: Profile[] | undefined, id: string | null): string {
  if (!id) return 'Unassigned'
  return profiles?.find((p) => p.id === id)?.display_name ?? 'Unknown'
}
