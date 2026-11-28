import { useState } from 'react'

const artwork = [
  ['Turtle in the sea',15], ['Lemons',10], ['Sunset',15], ['Giraffe',10],
  ['Red Sky',10], ['Starfish',15], ['Bubbles',10], ['Abstract',10], ['Purple abstract',10],
] as const
const merchandise = [
  ['Art Mug',14], ['Art Tote Bag',18], ['Butterflii Hoodie',45], ['Butterflii T-Shirt',28], ['Phone Case',22],
] as const

export function CatalogueWorkspace() {
  const [kind,setKind] = useState<'artwork'|'merchandise'>('artwork')
  return <section className="rounded-2xl bg-white p-5 ring-1 ring-brand-pink/30 space-y-4">
    <h2 className="font-serif text-2xl text-brand-purple-deep">Studio catalogue</h2>
    <p className="text-sm text-brand-dark/70">Catalogue snapshot, 28 November 2026. Live stock and publishing are not connected yet.</p>
    <div className="flex flex-wrap gap-2">{(['artwork','merchandise'] as const).map(k => <button key={k} aria-pressed={kind===k} onClick={()=>setKind(k)} className={`rounded-xl px-4 py-2 ${kind===k?'bg-brand-purple text-white':'bg-brand-pink/20'}`}>{k==='artwork'?'Original artwork (9)':'Merchandise (5)'}</button>)}</div>
    <div className="divide-y divide-brand-pink/30">{(kind==='artwork'?artwork:merchandise).map(([name,price])=><div key={name} className="flex justify-between gap-3 py-3"><div><p className="font-semibold">{name}</p><p className="text-xs text-brand-dark/60">Not available at snapshot</p></div><p>{price.toLocaleString('en-GB',{style:'currency',currency:'GBP'})}</p></div>)}</div>
  </section>
}
