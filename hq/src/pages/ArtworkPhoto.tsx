import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ArtworkPhoto({artistId,id,canUpload}:{artistId:string;id:string;canUpload:boolean}) {
  const path = artistId+'/'+id+'/photo'
  const bucket = supabase.storage.from('butterflii-artwork-private')
  const [url,setUrl] = useState<string|null>(null)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const [refresh,setRefresh] = useState(0)
  useEffect(()=>{
    let active=true
    let objectUrl:string|undefined
    setUrl(null)
    void supabase.storage.from('butterflii-artwork-private').download(path).then(({data,error})=>{
      if(active && !error && data){objectUrl=URL.createObjectURL(data);setUrl(objectUrl)}
    }).catch(()=>{})
    return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl)}
  },[path,refresh])
  async function upload(file:File) {
    setError('')
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5242880||file.size===0){setError('Choose a JPEG, PNG or WebP photo under 5 MB.');return}
    setBusy(true)
    try {
      const {error}=await bucket.upload(path,file,{upsert:false,contentType:file.type})
      if(error)throw error
      setRefresh(n=>n+1)
    } catch {setError('Photo could not be uploaded. Refresh and try again if no photo appears.')}
    finally {setBusy(false)}
  }
  return <div className="space-y-2">
    {url && <img src={url} alt="Submitted artwork" className="max-h-64 max-w-full rounded-xl object-contain"/>}
    {canUpload&&!url&&<label className="block text-sm">Attach artwork photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value=''}} className="block w-full"/></label>}
    {busy&&<p>Uploading photo…</p>}
    {error&&<p role="alert">{error}</p>}
  </div>
}
