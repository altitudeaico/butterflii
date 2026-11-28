import { handleInventory } from './inventory-handler.ts'
import { createInventoryAuthenticator } from './inventory-auth.ts'

type InventoryRow = {slug:string;name:string;kind:string;stock:number;reserved:number;verified:boolean}
type Config = {hqUrl:string;hqPublishableKey:string;hqAllowedOrigin:string}
export function createInventoryEndpoint(config:Config, readInventory:()=>Promise<InventoryRow[]>) {
 const origin = new URL(config.hqAllowedOrigin)
 if(origin.protocol !== 'https:' || origin.origin !== config.hqAllowedOrigin) throw new Error('Invalid allowed origin')
 const authenticateParent = createInventoryAuthenticator(config)
 return async (request:Request):Promise<Response> => {
  const requestOrigin = request.headers.get('Origin')
  const headers = new Headers({'Cache-Control':'private, no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'})
  if(requestOrigin !== origin.origin) return new Response(null,{status:403,headers})
  headers.set('Access-Control-Allow-Origin',origin.origin)
  if(request.method === 'OPTIONS'){
   headers.set('Access-Control-Allow-Methods','GET, OPTIONS')
   headers.set('Access-Control-Allow-Headers','Authorization')
   return new Response(null,{status:204,headers})
  }
  if(new URL(request.url).pathname !== '/inventory') return new Response(null,{status:404,headers})
  const result = await handleInventory(request,{authenticateParent,readInventory:async()=>readInventory()})
  result.headers.forEach((value,key)=>headers.set(key,value))
  return new Response(result.body,{status:result.status,headers})
 }
}
