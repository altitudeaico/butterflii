import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Role } from '../types'
import { Spinner } from '../components/Spinner'

// Cosmetic routing only, gating which lens renders. The binding rule lives
// in Postgres RLS (see hq/scripts/seed-profiles.sql): a tampered client
// pointed straight at Supabase still can't read or write what its role
// disallows, regardless of what this component does.
export function RoleRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <Spinner />
  if (!session || !profile) return <Navigate to="/login" replace />
  if (profile.role !== role) return <Navigate to={homeRouteForRole(profile.role)} replace />

  return <>{children}</>
}

export function homeRouteForRole(role: Role): string {
  switch (role) {
    case 'super_admin':
      return '/super'
    case 'ops_admin':
      return '/ops'
    case 'artist':
      return '/artist'
  }
}
