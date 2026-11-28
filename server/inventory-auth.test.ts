import test from 'node:test'
import assert from 'node:assert/strict'
import {createInventoryAuthenticator} from './inventory-auth.ts'
import {handleInventory} from './inventory-handler.ts'
const id='11111111-1111-4111-8111-111111111111'
test('HQ authentication and inventory boundary',async(t)=>{
 const auth=createInventoryAuthenticator({hqUrl:'https://hq.example.test',hqPublishableKey:'test-public'})
 let calls=0, reads=0
 let user:unknown={id}, profiles:unknown=[{id,role:'super_admin'}], userStatus=200, profileStatus=200
 t.mock.method(globalThis,'fetch',async(url:URL,options:RequestInit)=>{
 calls++
 assert.equal(url.origin,'https://hq.example.test')
 assert.equal(new Headers(options.headers).get('authorization'),'Bearer token')
 assert.equal(options.redirect,'error')
 if(url.pathname==='/auth/v1/user')return Response.json(user,{status:userStatus})
 assert.equal(url.pathname,'/rest/v1/profiles')
 assert.equal(url.searchParams.get('id'),'eq.'+id)
 assert.equal(new Headers(options.headers).get('accept-profile'),'hq')
 return Response.json(profiles,{status:profileStatus})
 })
 for(const role of ['super_admin','ops_admin']){
 profiles=[{id,role}]
 assert.deepEqual(await auth('token'),{id,role})
 }
 for(const role of ['artist','unknown',null]){
 profiles=[{id,role}]
 assert.equal(await auth('token'),null)
 }
 for(const value of [[],[{id:'different',role:'super_admin'}],[{id,role:'super_admin'},{id,role:'ops_admin'}],null]){
 profiles=value
 assert.equal(await auth('token'),null)
 }
 profiles=[{id,role:'super_admin'}]
 for(const value of [{id,is_anonymous:true},{id:'invalid'},null]){
 user=value
 assert.equal(await auth('token'),null)
 }
 user={id};userStatus=401
 assert.equal(await auth('token'),null)
 userStatus=200;profileStatus=403
 assert.equal(await auth('token'),null)
 profileStatus=200
 const before=calls
 assert.equal(await auth(''),null)
 assert.equal(await auth('x'.repeat(16385)),null)
 assert.equal(calls,before)
 const deps={authenticateParent:auth,readInventory:async()=>{reads++;return []}}
 const req=new Request('https://api.example.test/inventory',{headers:{Authorization:'Bearer token'}})
 profiles=[{id,role:'artist'}]
 assert.equal((await handleInventory(req,deps)).status,403)
 assert.equal(reads,0)
 profiles=[{id,role:'ops_admin'}]
 assert.equal((await handleInventory(req,deps)).status,200)
 assert.equal(reads,1)
})
test('reject insecure or ambiguous HQ origins',()=>{
 for(const hqUrl of ['http://hq.example.test','https://user:pass@hq.example.test','https://hq.example.test/path','https://hq.example.test/?x=1','https://hq.example.test/#x'])assert.throws(()=>createInventoryAuthenticator({hqUrl,hqPublishableKey:'test'}))
})
