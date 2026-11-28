import type { ArtworkDependencies } from './artwork-handler'

type Mapping = { memberId: string; role: 'artist' | 'parent' }
export interface AuthConfig {
  hqUrl: string
  hqPublishableKey: string
  // Trusted server-only lookup; must verify current commerce membership.
  resolveMapping(hqUserId: string): Promise<Mapping | null>
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createArtworkAuthenticator(config: AuthConfig): ArtworkDependencies['authenticate'] {
  const origin = new URL(config.hqUrl)
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid HQ origin')
  return async (token) => {
    if (!token || token.length > 16384) return null
    const headers = { apikey: config.hqPublishableKey, Authorization: 'Bearer ' + token }
    const userResponse = await fetch(new URL('/auth/v1/user', origin), { headers, redirect: 'error', cache: 'no-store' })
    if (!userResponse.ok) return null
    const user = await userResponse.json() as { id?: string }
    if (typeof user.id !== 'string' || !uuid.test(user.id)) return null
    const profileUrl = new URL('/rest/v1/profiles', origin)
    profileUrl.searchParams.set('select', 'id,role')
    profileUrl.searchParams.set('id', 'eq.' + user.id)
    const profileResponse = await fetch(profileUrl, { headers: { ...headers, 'Accept-Profile': 'hq' }, redirect: 'error', cache: 'no-store' })
    if (!profileResponse.ok) return null
    const profiles = await profileResponse.json() as { id: string; role: string }[]
    if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0].id !== user.id) return null
    const role = profiles[0].role === 'artist' ? 'artist' : profiles[0].role === 'super_admin' ? 'parent' : null
    if (!role) return null
    const mapping = await config.resolveMapping(user.id)
    if (!mapping || !uuid.test(mapping.memberId) || mapping.role !== role) return null
    return mapping
  }
}
