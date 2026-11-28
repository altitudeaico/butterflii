import { useState } from 'react'
import { useQuery,useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
export function PublicationControl({id,pricePence}:{id:string;pricePence:number}) {
 const {profile}=useAuth()
 const [price,setPrice]=useState((pricePence/100).toFixed(2))
 const [stock,setStock]=useState(false)
 const valid=/^\d+(\.\d{1,2})?$/.test(price)&&Number(price)>0&&Math.round(Number(price)*100)<=2147483647
 const query=useQuery({queryKey:['publication',profile?.id,id],queryFn:async()=>{
 const {data,error}=await supabase.schema('hq').from('publication_requests').select('*').eq('artwork_id',id).maybeSingle()
 if(error)throw error
 return data
 },retry:false,gcTime:0})
 const request=useMutation({mutationFn:async()=>{
 const {data,error}=await supabase.schema('hq').rpc('request_publication',{p_id:id,p_price:Math.round(Number(price)*100),p_stock_confirmed:stock})
 if(error)throw error
 if(data?.length!==1)throw new Error('Request unavailable')
 },onSettled:()=>query.refetch()})
 if(query.isPending)return <p>Checking publication status…</p>
 if(query.isError)return <p role="alert">Publication status unavailable. <button onClick={()=>void query.refetch()}>Retry</button></p>
 if(query.data)return <p>Publication: {query.data.status==='queued'?'Queued, not yet public':query.data.status==='published'?'Published':'Needs attention'}</p>
 return <div className="space-y-2 border-t pt-3">
 <h4 className="font-semibold">Prepare for shop</h4>
 <label className="block">Final price (£)<input inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} disabled={request.isPending}/></label>
 <label className="block"><input type="checkbox" checked={stock} onChange={e=>setStock(e.target.checked)} disabled={request.isPending}/> Original artwork is physically available for sale</label>
 <button className="rounded-xl bg-brand-purple px-4 py-2 text-white disabled:opacity-50" disabled={!valid||!stock||request.isPending} onClick={()=>request.mutate()}>Request publication</button>
 <p className="text-sm">This queues a request; it does not make the artwork public yet.</p>
 {request.isError&&<p role="alert">Could not queue publication. Check that the approved artwork has a photo.</p>}
 </div>
}
