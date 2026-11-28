import test from 'node:test'
import assert from 'node:assert/strict'
import {createTestCheckout} from './stripe-checkout.ts'
import {quoteBasket} from './checkout-quote.ts'
const quote=quoteBasket([{slug:'mug',quantity:2}],[{slug:'mug',name:'Mug',price_pence:1400,kind:'merchandise',available:true,stock:3}],500)
const config={secret:'sk_test_fixture',origin:'https://example.com'}
const id='12345678-1234-1234-1234-123456789012'
test('checkout uses server amounts and stable idempotency key',async t=>{
 t.mock.method(globalThis,'fetch',async (url:string,init:RequestInit)=>{
 assert.equal(url,'https://api.stripe.com/v1/checkout/sessions')
 const body=init.body as URLSearchParams
 assert.equal(body.get('line_items[0][price_data][unit_amount]'),'1400')
 assert.equal(body.get('line_items[0][quantity]'),'2')
 assert.equal(body.get('line_items[1][price_data][unit_amount]'),'500')
 assert.equal(body.get('metadata[order_id]'),id)
 assert.equal(new Headers(init.headers).get('Idempotency-Key'),'butterflii-test-'+id)
 return Response.json({id:'cs_test_fixture',livemode:false,url:'https://checkout.stripe.com/c/pay/test'})
 })
 assert.equal((await createTestCheckout(config,id,quote)).id,'cs_test_fixture')
})
test('reject live key and insecure return URL before network',async t=>{
 const mock=t.mock.method(globalThis,'fetch',async()=>{throw new Error('Unexpected network')})
 await assert.rejects(createTestCheckout({...config,secret:'sk_live_fixture'},id,quote),/Test Stripe key/)
 await assert.rejects(createTestCheckout({...config,origin:'http://example.com'},id,quote),/Invalid return URL/)
 assert.equal(mock.mock.callCount(),0)
})
test('reject unexpected live response',async t=>{
 t.mock.method(globalThis,'fetch',async()=>Response.json({id:'cs_live_fixture',livemode:true,url:'https://checkout.stripe.com/c/pay/test'}))
 await assert.rejects(createTestCheckout(config,id,quote),/Unexpected checkout response/)
})

test('restricted sandbox key is accepted and live restricted key is rejected',async t=>{
 const mock=t.mock.method(globalThis,'fetch',async (_url:string,init:RequestInit)=>{
 assert.equal(new Headers(init.headers).get('Authorization'),'Bearer rk_test_fixture')
 return Response.json({id:'cs_test_fixture',livemode:false,url:'https://checkout.stripe.com/c/pay/test'})
 })
 for(const secret of ['rk_live_fixture','rk_test_','sk_test_fixture_live_bad','rk_test_fixture\u0020']) await assert.rejects(createTestCheckout({...config,secret},id,quote),/Test Stripe key/)
 assert.equal(mock.mock.callCount(),0)
 assert.equal((await createTestCheckout({...config,secret:'rk_test_fixture'},id,quote)).id,'cs_test_fixture')
 assert.equal(mock.mock.callCount(),1)
})
