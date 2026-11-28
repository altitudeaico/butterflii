import {useState} from 'react'
import {createClient} from '@supabase/supabase-js'
import {readFamilyInventory} from '../lib/family-inventory'
const config={url:'https://fypwabbhxnnwcpfjwrda.supabase.co',publishableKey:'sb_publishable_3QuVOWMxeMhUpVBnae3Arw_EsJdlw4b'}
export function FamilyInventoryTest(){
 const [busy,setBusy]=useState(false)
 const [result,setResult]=useState('')
 return <section className="rounded-2xl bg-white p-5 space-y-4">
 <h2 className="font-serif text-2xl">Family OS inventory connection test</h2>
 <p>Parents only. This read-only test uses your existing Family OS account. No stock or account changes are made.</p>
 <form className="space-y-3" onSubmit={async e=>{
 e.preventDefault()
 if(busy)return
 const form=e.currentTarget
 const data=new FormData(form)
 setBusy(true);setResult('')
 const client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'butterflii-family-inventory-test'}})
 try{
 const {data:auth,error}=await client.auth.signInWithPassword({email:String(data.get('email')),password:String(data.get('password'))})
 form.reset()
 if(error||!auth.session){setResult('Family OS sign-in unsuccessful. Check your existing credentials.');return}
 const rows=await readFamilyInventory(config,auth.session.access_token)
 setResult('Connection successful. '+rows.length+' inventory records retrieved.')
 }catch{setResult('Inventory connection unsuccessful. Check API access and parent membership.')}
 finally{form.reset();await client.auth.signOut({scope:'local'}).catch(()=>{});setBusy(false)}
 }}>
 <label className="block">Family OS email<input className="block border rounded p-2 w-full" name="email" type="email" autoComplete="username" required disabled={busy}/></label>
 <label className="block">Family OS password<input className="block border rounded p-2 w-full" name="password" type="password" autoComplete="current-password" required disabled={busy}/></label>
 <button className="rounded bg-brand-purple text-white px-4 py-2" disabled={busy}>{busy?'Testing…':'Test connection'}</button>
 </form><p role="status">{result}</p></section>
}
