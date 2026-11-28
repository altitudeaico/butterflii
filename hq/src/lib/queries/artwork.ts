import { supabase } from '../supabase'

export type ArtworkSubmission = {
  id: string
  title: string
  description: string
  proposed_price_pence: number
  status: 'pending' | 'approved' | 'changes_requested'
  review_note: string | null
  reviewed_at: string | null
  created_at: string
}

export type ArtworkDraft = Pick<ArtworkSubmission, 'title' | 'description' | 'proposed_price_pence'>

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new Error('Please sign in again.')
  const base = import.meta.env.VITE_ARTWORK_API_URL as string | undefined
  if (!base) throw new Error('Artwork management is not connected yet.')
  const url = new URL(base.replace(/\/$/, '') + path)
  if (url.protocol !== 'https:') throw new Error('Artwork service requires HTTPS.')
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: 'Bearer ' + data.session.access_token,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    redirect: 'error',
  })
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403
    ? 'You do not have access to this artwork action.'
    : 'Artwork service is unavailable. Please try again.')
  return await response.json() as T
}

export function listArtwork() {
  return request<ArtworkSubmission[]>('/submissions')
}

export function submitArtwork(draft: ArtworkDraft) {
  const title = draft.title.trim()
  if (!title || title.length > 200 || !Number.isSafeInteger(draft.proposed_price_pence) || draft.proposed_price_pence <= 0) {
    throw new Error('Enter a title and a valid positive price.')
  }
  return request<ArtworkSubmission>('/submissions', 'POST', {
    title, description: draft.description, proposed_price_pence: draft.proposed_price_pence,
  })
}

export function reviewArtwork(id: string, status: 'approved' | 'changes_requested', review_note: string) {
  return request<ArtworkSubmission>('/submissions/' + encodeURIComponent(id) + '/review', 'POST', { status, review_note })
}
