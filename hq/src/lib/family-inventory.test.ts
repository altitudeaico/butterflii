import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFamilyInventory} from './family-inventory.ts'
test('Family inventory client enforces parent membership and validates rows',async()=>{
 const original=globalThis.fetch
 const config={url:'https://family.example.com',publishableKey:'test'}
 let role='artist', reads=0, invalid=false
 globalThis.fetch=async(input,options)=>{
  const url=new URL(String(input))
  const headers=new Headers(options?.headers)
  assert.equal(headers.get('Authorization'),'Bearer test-token')
  assert.equal(headers.get('Accept-Profile'),'butterflii')
  if(url.pathname.endsWith('/members'))return Response.json([{role}])
  reads++
  assert.equal(url.pathname,'/rest/v1/inventory')
  return Response.json([{stock:1,reserved:invalid?2:0,verified:true,products:{slug:'art',name:'Art',kind:'artwork'},extra:'discard'}])
 }
 try{
  await assert.rejects(readFamilyInventory(config,''),/Invalid inventory session/)
  await assert.rejects(readFamilyInventory(config,'test-token'),/Parent access required/)
  assert.equal(reads,0)
  role='parent'
  assert.deepEqual(await readFamilyInventory(config,'test-token'),[{stock:1,reserved:0,verified:true,products:{slug:'art',name:'Art',kind:'artwork'}}])
  invalid=true
  await assert.rejects(readFamilyInventory(config,'test-token'),/Invalid inventory response/)
 }finally{globalThis.fetch=original}
})
