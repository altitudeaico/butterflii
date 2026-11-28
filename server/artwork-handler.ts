// Transport-independent handler. Deploy only with verified auth and storage adapters.
type Identity = { memberId: string; role: 'artist' | 'parent' }
type Draft = { title: string; description: string; proposed_price_pence: number }
type Review = { status: 'approved' | 'changes_requested'; review_note: string }
export interface ArtworkDependencies {
  // Must validate HQ token and resolve current server-owned membership.
  authenticate(token: string): Promise<Identity | null>
  // Storage must independently enforce actor ownership and role, atomic review,
  // server timestamps and no publication side effects.
  list(actor: Identity): Promise<unknown[]>
  submit(actor: Identity, draft: Draft): Promise<unknown>
  review(actor: Identity, id: string, review: Review): Promise<unknown | null>
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})
export async function handleArtwork(request: Request, deps: ArtworkDependencies): Promise<Response> {
  try {
    const token = request.headers.get('Authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1]
    if (!token) return json({ error: 'Unauthorised' }, 401)
    const actor = await deps.authenticate(token)
    if (!actor || !['artist', 'parent'].includes(actor.role)) return json({ error: 'Forbidden' }, 403)
    const path = new URL(request.url).pathname
    if (path === '/submissions' && request.method === 'GET') return json(await deps.list(actor))
    const match = path.match(/^\/submissions\/([0-9a-f-]{36})\/review$/i)
    if (request.method !== 'POST' || (path !== '/submissions' && !match)) return json({ error: 'Not found' }, 404)
    if ((match && actor.role !== 'parent') || (!match && actor.role !== 'artist')) return json({ error: 'Forbidden' }, 403)
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'JSON required' }, 415)
    let body: Record<string, unknown>
    try {
      const raw = await request.text()
      if (raw.length > 16000) return json({ error: 'Request too large' }, 413)
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'Invalid body' }, 400)
      body = parsed
    } catch { return json({ error: 'Invalid JSON' }, 400) }
    if (match) {
      const { status, review_note } = body
      if ((status !== 'approved' && status !== 'changes_requested') || typeof review_note !== 'string' || review_note.length > 2000 || (status === 'changes_requested' && !review_note.trim())) return json({ error: 'Invalid review' }, 400)
      const result = await deps.review(actor, match[1], { status, review_note })
      return result ? json(result) : json({ error: 'Submission unavailable for review' }, 409)
    }
    const { title, description, proposed_price_pence } = body
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 200 || typeof description !== 'string' || description.length > 4000 || typeof proposed_price_pence !== 'number' || !Number.isSafeInteger(proposed_price_pence) || proposed_price_pence <= 0 || proposed_price_pence > 2147483647) return json({ error: 'Invalid artwork' }, 400)
    return json(await deps.submit(actor, { title: title.trim(), description, proposed_price_pence }), 201)
  } catch {
    return json({ error: 'Artwork service unavailable' }, 503)
  }
}
