import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handleArtwork, type ArtworkDependencies } from './artwork-handler.ts'
const id='11111111-1111-4111-8111-111111111111'
function fixture(role: 'artist'|'parent'|null) {
 let writes=0
 const deps: ArtworkDependencies={
  authenticate: async token => token==='valid' && role ? {memberId:id,role}:null,
  list:async()=>[],
  submit:async(_actor,draft)=>{writes++;return draft},
  review:async()=>{writes++;return null},
 }
 return {deps,writes:()=>writes}
}
function req(path:string,body?:unknown,token='valid'){
 return new Request('https://example.test'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)})
}
test('invalid token denied',async()=>{const f=fixture('artist');assert.equal((await handleArtwork(req('/submissions',undefined,'invalid'),f.deps)).status,403)})
test('unmapped account denied',async()=>{const f=fixture(null);assert.equal((await handleArtwork(req('/submissions'),f.deps)).status,403)})
test('artist cannot approve',async()=>{const f=fixture('artist');assert.equal((await handleArtwork(req('/submissions/'+id+'/review',{status:'approved',review_note:''}),f.deps)).status,403);assert.equal(f.writes(),0)})
test('parent cannot submit as artist',async()=>{const f=fixture('parent');assert.equal((await handleArtwork(req('/submissions',{title:'Art',description:'',proposed_price_pence:500}),f.deps)).status,403);assert.equal(f.writes(),0)})
test('negative price denied',async()=>{const f=fixture('artist');assert.equal((await handleArtwork(req('/submissions',{title:'Art',description:'',proposed_price_pence:-1}),f.deps)).status,400);assert.equal(f.writes(),0)})
test('valid submission strips client role and identity',async()=>{const f=fixture('artist');const r=await handleArtwork(req('/submissions',{title:' Art ',description:'',proposed_price_pence:500,role:'parent',artist_id:'fake'}),f.deps);assert.equal(r.status,201);assert.deepEqual(await r.json(),{title:'Art',description:'',proposed_price_pence:500})})
test('change request needs feedback',async()=>{const f=fixture('parent');assert.equal((await handleArtwork(req('/submissions/'+id+'/review',{status:'changes_requested',review_note:' '}),f.deps)).status,400);assert.equal(f.writes(),0)})
test('resolved submission conflict',async()=>{const f=fixture('parent');assert.equal((await handleArtwork(req('/submissions/'+id+'/review',{status:'approved',review_note:''}),f.deps)).status,409)})
