import test from 'node:test'
import assert from 'node:assert/strict'
import {quoteBasket} from './checkout-quote.ts'
const catalogue=[{slug:'lemons',name:'Lemons',price_pence:1000,kind:'artwork',available:true,stock:1},{slug:'mug',name:'Mug',price_pence:1400,kind:'merchandise',available:true,stock:3}]
test('server prices override browser fields',()=>{const q=quoteBasket([{slug:'lemons',quantity:1,price_pence:1},{slug:'mug',quantity:2}],catalogue,500);assert.equal(q.subtotal_pence,3800);assert.equal(q.total_pence,4300)})
test('reject duplicate, insufficient stock, unknown products and invalid quantities',()=>{for(const items of [[{slug:'lemons',quantity:2}],[{slug:'mug',quantity:4}],[{slug:'lemons',quantity:1},{slug:'lemons',quantity:1}],[{slug:'unknown',quantity:1}],[{slug:'mug',quantity:0}],[{slug:'mug',quantity:1.5}],[]])assert.throws(()=>quoteBasket(items,catalogue,0))})
test('reject unavailable product and invalid delivery',()=>{assert.throws(()=>quoteBasket([{slug:'lemons',quantity:1}],[{...catalogue[0],available:false}],0));assert.throws(()=>quoteBasket([{slug:'lemons',quantity:1}],catalogue,-1))})
