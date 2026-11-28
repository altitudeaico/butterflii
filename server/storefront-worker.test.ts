import test from 'node:test'
import assert from 'node:assert/strict'
import worker from './storefront-worker.ts'
test('runtime routes never expose credentials or enable checkout',async()=>{
 let calls=0
 const env={STRIPE_TEST_SECRET_KEY:'rk_test_fixture',ASSETS:{async fetch(){calls++;return new Response('public asset')}}}
 const req=(path:string,method='GET')=>worker.fetch(new Request('https://example.com'+path,{method}),env)
 const health=await req('/api/health')
 assert.equal(health.status,200)
 assert.equal(health.headers.get('Cache-Control'),'no-store')
 assert.deepEqual(await health.json(),{service:'butterflii',mode:'test',checkout:'disabled'})
 assert.equal((await req('/api/health','POST')).status,405)
 assert.equal((await req('/api/checkout','POST')).status,503)
 assert.equal((await req('/api/unknown')).status,404)
 assert.equal((await req('/api')).status,404)
 assert.equal(calls,0)
 assert.equal(await (await req('/shop.html')).text(),'public asset')
 assert.equal(calls,1)
})
