import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { listArtwork, submitArtwork, reviewArtwork } from '../lib/queries/artwork'

const field = 'w-full rounded-2xl border border-brand-pink/50 px-4 py-3'
const action = 'rounded-2xl bg-brand-purple px-4 py-3 font-semibold text-white disabled:opacity-50'

export function ArtworkWorkspace() {
  const { profile } = useAuth()
  const artist = profile?.role === 'artist'
  const parent = profile?.role === 'super_admin' || profile?.role === 'ops_admin'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const query = useQuery({
    queryKey: ['artwork-submissions', profile?.id],
    queryFn: listArtwork,
    enabled: !!profile && (artist || parent),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  })
  const submit = useMutation({
    mutationFn: submitArtwork,
    onSuccess: async () => {
      setTitle(''); setDescription(''); setPrice('')
      await query.refetch()
    },
  })
  const review = useMutation({
    mutationFn: (input: { id: string; status: 'approved' | 'changes_requested'; note: string }) =>
      reviewArtwork(input.id, input.status, input.note),
    onSuccess: async () => { await query.refetch() },
  })
  if (!artist && !parent) return null
  const configured = Boolean(import.meta.env.VITE_ARTWORK_API_URL)
  const validPrice = /^\d+(\.\d{1,2})?$/.test(price) && Number(price) > 0 && Number.isSafeInteger(Math.round(Number(price) * 100))
  return (
    <section className="w-full space-y-4 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-brand-pink/30">
      <h2 className="font-serif text-2xl text-brand-purple-deep">{artist ? 'My artwork' : 'Artwork approvals'}</h2>
      {!configured ? <p>Artwork management is not connected yet.</p> : <>
        {artist && <form className="space-y-3" onSubmit={(e) => {
          e.preventDefault()
          if (!validPrice || !title.trim() || submit.isPending) return
          submit.mutate({ title, description, proposed_price_pence: Math.round(Number(price) * 100) })
        }}>
          <label className="block">Artwork name<input className={field} required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></label>
          <label className="block">Tell us about your artwork<textarea className={field} value={description} onChange={e => setDescription(e.target.value)} /></label>
          <label className="block">Your suggested price (£)<input className={field} inputMode="decimal" required value={price} onChange={e => setPrice(e.target.value)} /></label>
          <button className={action} disabled={!validPrice || !title.trim() || submit.isPending}>Send for approval</button>
        </form>}
        {query.isPending && <p>Loading artwork…</p>}
        {(query.isError || submit.isError || review.isError) && <p role="alert">We couldn't complete that action. Please try again.</p>}
        {query.isSuccess && query.data.length === 0 && <p>No artwork submissions yet.</p>}
        {query.data?.map(item => <article key={item.id} className="space-y-2 rounded-2xl border border-brand-pink/30 p-4">
          <h3 className="font-semibold">{item.title}</h3>
          <p>{item.description}</p>
          <p>{(item.proposed_price_pence / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</p>
          <p>{item.status === 'pending' ? 'Waiting for approval' : item.status === 'approved' ? 'Approved (not yet published)' : 'Changes requested'}</p>
          {item.review_note && <p>{item.review_note}</p>}
          {parent && item.status === 'pending' && <>
            <label className="block">Feedback<textarea className={field} value={notes[item.id] ?? ''} onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))} /></label>
            <div className="flex flex-wrap gap-2">
              <button className={action} disabled={review.isPending} onClick={() => review.mutate({ id: item.id, status: 'approved', note: notes[item.id] ?? '' })}>Approve</button>
              <button className={action} disabled={review.isPending || !notes[item.id]?.trim()} onClick={() => review.mutate({ id: item.id, status: 'changes_requested', note: notes[item.id] ?? '' })}>Request changes</button>
            </div>
          </>}
        </article>)}
      </>}
    </section>
  )
}
