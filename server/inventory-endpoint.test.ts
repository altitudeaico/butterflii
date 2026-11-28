import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createInventoryEndpoint} from './inventory-endpoint.ts'

test('inventory endpoint denies untrusted origins and unauthenticated reads',async()=>{
 let reads=0
 const origin='https://hq.example.com'
 const endpoint=createInventoryEndpoint({hqUrl:'https://auth.example.com',hqPublishableKey:'test',hqAllowedOrigin:origin},async()=>{reads++;return []})
 const request=(method:string,headers:Record<string,string>,path='/inventory')=>new Request('https://api.example.com'+path,{method,headers})
 assert.equal((await endpoint(request('GET',{}))).status,403)
 assert.equal((await endpoint(request('GET',{Origin:'https://other.example.com'}))).status,403)
 const preflight=await endpoint(request('OPTIONS',{Origin:origin}))
 assert.equal(preflight.status,204)
 assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin)
 assert.equal((await endpoint(request('GET',{Origin:origin}))).status,401)
 assert.equal((await endpoint(request('POST',{Origin:origin}))).status,405)
 assert.equal((await endpoint(request('GET',{Origin:origin},'/other'))).status,404)
 assert.equal(reads,0)
})
