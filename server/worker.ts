import { createArtworkService } from './artwork-service.ts'
interface Env {
 HQ_URL: string
 HQ_PUBLISHABLE_KEY: string
 COMMERCE_URL: string
 COMMERCE_SERVICE_ROLE_KEY: string
 HQ_ALLOWED_ORIGIN: string
}
export default {
 async fetch(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  const allowed = env.HQ_ALLOWED_ORIGIN
  if (!allowed || (origin && origin !== allowed)) return new Response('Forbidden', {status:403})
  const cors = { 'Access-Control-Allow-Origin': allowed, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Vary': 'Origin', 'Cache-Control': 'no-store' }
  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:cors})
  try {
   const service = createArtworkService({hqUrl:env.HQ_URL,hqPublishableKey:env.HQ_PUBLISHABLE_KEY,commerceUrl:env.COMMERCE_URL,commerceServiceRoleKey:env.COMMERCE_SERVICE_ROLE_KEY})
   const result = await service(request)
   const headers = new Headers(result.headers)
   for (const [key,value] of Object.entries(cors)) headers.set(key,value)
   return new Response(result.body,{status:result.status,headers})
  } catch {
   return new Response('Service unavailable',{status:503,headers:cors})
  }
 }
}
