import { test } from 'node:test'
import assert from 'node:assert/strict'
import worker from './worker.ts'
const env={HQ_URL:'https://hq.example.test',HQ_PUBLISHABLE_KEY:'test-public',COMMERCE_URL:'https://commerce.example.test',COMMERCE_SERVICE_ROLE_KEY:'test-server',HQ_ALLOWED_ORIGIN:'https://studio.example.test'}
const id='11111111-1111-4111-8111-111111111111'
const member='22222222-2222-4222-8222-222222222222'
test('worker rejects foreign origin',async()=>{const r=await worker.fetch(new Request('https://api.example.test/submissions',{headers:{Origin:'https://foreign.example.test'}}),env);assert.equal(r.status,403)})
test('worker allows configured preflight',async()=>{const r=await worker.fetch(new Request('https://api.example.test/submissions',{method:'OPTIONS',headers:{Origin:env.HQ_ALLOWED_ORIGIN}}),env);assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),env.HQ_ALLOWED_ORIGIN)})
test('verified HQ artist uses mapped commerce identity',async t=>{
 const calls:string[]=[]
 t.mock.method(globalThis,'fetch',async (input:URL,init:RequestInit)=>{
 const url=new URL(input);calls.push(url.pathname)
 const headers=new Headers(init.headers)
 if(url.origin===env.HQ_URL){assert.equal(headers.get('Authorization'),'Bearer user-token');assert.equal(headers.get('apikey'),env.HQ_PUBLISHABLE_KEY)}
 else {assert.equal(url.origin,env.COMMERCE_URL);assert.equal(headers.get('Authorization'),'Bearer test-server')}
 if(url.pathname==='/auth/v1/user')return Response.json({id})
 if(url.pathname==='/rest/v1/profiles')return Response.json([{id,role:'artist'}])
 if(url.pathname.endsWith('/butterflii_resolve_hq')){assert.deepEqual(JSON.parse(String(init.body)),{p_hq_user:id});return Response.json([{member_id:member,role:'artist'}])}
 if(url.pathname.endsWith('/butterflii_list_artwork')){assert.deepEqual(JSON.parse(String(init.body)),{p_actor:member});return Response.json([])}
 throw new Error('Unexpected endpoint')
 })
 const r=await worker.fetch(new Request('https://api.example.test/submissions',{headers:{Authorization:'Bearer user-token',Origin:env.HQ_ALLOWED_ORIGIN}}),env)
 assert.equal(r.status,200);assert.deepEqual(await r.json(),[]);assert.equal(calls.length,4)
})
