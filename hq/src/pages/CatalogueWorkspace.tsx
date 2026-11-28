import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

type Product = { slug: string; name: string; kind: string; price_pence: number; available: boolean }
async function loadCatalogue(): Promise<Product[]> {
  const response = await fetch('https://fypwabbhxnnwcpfjwrda.supabase.co/rest/v1/butterflii_catalogue?select=slug,name,kind,price_pence,available&order=name.asc', {
    headers: { apikey: 'sb_publishable_3QuVOWMxeMhUpVBnae3Arw_EsJdlw4b' },
    credentials: 'omit', cache: 'no-store', redirect: 'error',
  })
  if (!response.ok) throw new Error('Catalogue unavailable')
  const rows: unknown = await response.json()
  if (!Array.isArray(rows) || !rows.every(p => p && typeof p.slug === 'string' && typeof p.name === 'string' && typeof p.kind === 'string' && Number.isSafeInteger(p.price_pence) && p.price_pence >= 0 && typeof p.available === 'boolean')) throw new Error('Invalid catalogue')
  return rows as Product[]
}
export function CatalogueWorkspace() {
  const [kind,setKind] = useState<'artwork'|'merchandise'>('artwork')
  const query = useQuery({queryKey:['public-studio-catalogue'],queryFn:loadCatalogue,staleTime:0,retry:false})
  const rows = query.data ?? []
  return <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-pink/30 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-2xl text-brand-purple-deep">Studio catalogue</h2><button onClick={()=>void query.refetch()} disabled={query.isFetching} className="text-sm underline">Refresh</button></div>
    <p className="text-sm text-brand-dark/70">Read-only catalogue. Stock quantities and publishing controls are not connected.</p>
    {query.isPending ? <p>Loading catalogue…</p> : query.isError ? <p role="alert">Could not load the catalogue. Select Refresh to try again.</p> : <>
    <div className="flex flex-wrap gap-2">{(['artwork','merchandise'] as const).map(k => <button key={k} aria-pressed={kind===k} onClick={()=>setKind(k)} className={`rounded-xl px-4 py-2 ${kind===k?'bg-brand-purple text-white':'bg-brand-pink/20'}`}>{k==='artwork'?'Original artwork':'Merchandise'} ({rows.filter(p=>p.kind===k).length})</button>)}</div>
    <div className="divide-y divide-brand-pink/30">{rows.filter(p=>p.kind===kind).map(p=><div key={p.slug} className="flex justify-between gap-3 py-3"><div><p className="font-semibold">{p.name}</p><p className="text-xs text-brand-dark/60">{p.available?'Available in catalogue':'Not available'}</p></div><p>{(p.price_pence/100).toLocaleString('en-GB',{style:'currency',currency:'GBP'})}</p></div>)}</div>
    {!rows.some(p=>p.kind===kind)&&<p>No products in this category.</p>}
    </>}
  </section>
}
