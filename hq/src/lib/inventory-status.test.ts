import test from 'node:test'
import assert from 'node:assert/strict'
import {inventoryStatus} from './inventory-status.ts'
test('inventory classification',()=>{
 const row={kind:'merchandise',stock:5,reserved:0,verified:true}
 for(const [reserved,status] of [[0,'in-stock'],[2,'low-stock'],[4,'low-stock'],[5,'reserved']] as const)assert.equal(inventoryStatus({...row,reserved}).status,status)
 assert.equal(inventoryStatus({...row,stock:0}).status,'out-of-stock')
 assert.equal(inventoryStatus({...row,verified:false}).available,null)
 assert.equal(inventoryStatus({...row,reserved:6}).status,'unverified')
 assert.equal(inventoryStatus({...row,kind:'artwork',stock:1}).status,'original-available')
 assert.equal(inventoryStatus({...row,kind:'artwork'}).status,'unverified')
})

test('invalid quantities and reserved originals',()=>{
 const row={kind:'merchandise',stock:5,reserved:0,verified:true}
 for(const patch of [{stock:-1},{stock:1.5},{reserved:-1},{reserved:0.5},{kind:'unknown'},{stock:NaN}])assert.deepEqual(inventoryStatus({...row,...patch}),{status:'unverified',available:null})
 assert.deepEqual(inventoryStatus({...row,kind:'artwork',stock:1,reserved:1}),{status:'reserved',available:0})
 assert.deepEqual(inventoryStatus({...row,stock:4}),{status:'in-stock',available:4})
})
