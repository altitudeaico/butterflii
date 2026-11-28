import { handleArtwork } from './artwork-handler'
import { createArtworkAuthenticator } from './artwork-auth'

export interface ArtworkServiceConfig {
  hqUrl: string
  hqPublishableKey: string
  commerceUrl: string
  commerceServiceRoleKey: string
}

type Mapping = { member_id: string; role: 'artist' | 'parent' }

export function createArtworkService(config: ArtworkServiceConfig) {
  const origin = new URL(config.commerceUrl)
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid commerce origin')
  if (!config.commerceServiceRoleKey || !config.hqPublishableKey) throw new Error('Missing server configuration')
  async function rpc<T>(name: string, params: Record<string, unknown>): Promise<T> {
    const response = await fetch(new URL('/rest/v1/rpc/' + name, origin), {
      method: 'POST',
      headers: {
        apikey: config.commerceServiceRoleKey,
        Authorization: 'Bearer ' + config.commerceServiceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      redirect: 'error',
      cache: 'no-store',
    })
    if (!response.ok) throw new Error('Commerce operation failed')
    return await response.json() as T
  }
  const authenticate = createArtworkAuthenticator({
    hqUrl: config.hqUrl,
    hqPublishableKey: config.hqPublishableKey,
    async resolveMapping(hqUserId) {
      const rows = await rpc<Mapping[]>('butterflii_resolve_hq', { p_hq_user: hqUserId })
      if (!Array.isArray(rows) || rows.length !== 1) return null
      return { memberId: rows[0].member_id, role: rows[0].role }
    },
  })
  return (request: Request) => handleArtwork(request, {
    authenticate,
    async list(actor) {
      const rows = await rpc<unknown[]>('butterflii_list_artwork', { p_actor: actor.memberId })
      if (!Array.isArray(rows)) throw new Error('Unexpected response')
      return rows
    },
    async submit(actor, draft) {
      return rpc('butterflii_submit_artwork', {
        p_actor: actor.memberId, p_title: draft.title,
        p_description: draft.description, p_price: draft.proposed_price_pence,
      })
    },
    async review(actor, id, review) {
      const rows = await rpc<unknown[]>('butterflii_review_artwork', {
        p_actor: actor.memberId, p_id: id,
        p_status: review.status, p_note: review.review_note,
      })
      if (!Array.isArray(rows) || rows.length > 1) throw new Error('Unexpected review response')
      return rows[0] ?? null
    },
  })
}
