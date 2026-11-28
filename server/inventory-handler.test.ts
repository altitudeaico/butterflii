import test from 'node:test'
import assert from 'node:assert/strict'
import {handleInventory} from './inventory-handler.ts'
test('inventory authorization boundary',async()=>{
 let reads=0
 const deps={authenticateParent:async(t:string)=>t==='parent'?{id:'test',role:'ops_admin' as const}:null,readInventory:async()=>{reads++;return []}}
 const req=(token?:string,method='GET')=>new Request('https://example.test/inventory',{method,headers:token?{Authorization:'Bearer '+token}:{}})
 assert.equal((await handleInventory(req(),deps)).status,401)
 assert.equal((await handleInventory(req('artist'),deps)).status,403)
 assert.equal((await handleInventory(req('parent','POST'),deps)).status,405)
 assert.equal(reads,0)
 const result=await handleInventory(req('parent'),deps)
 assert.equal(result.status,200)
 assert.equal(result.headers.get('cache-control'),'private, no-store')
 assert.equal(reads,1)
})
