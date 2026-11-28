interface Env {
 ASSETS: {fetch(request: Request): Promise<Response>}
 STRIPE_TEST_SECRET_KEY?: string
}
function json(body: object,status: number,extra: Record<string,string> = {}) {
 return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}})
}
export default {
 async fetch(request: Request,env: Env): Promise<Response> {
  const path = new URL(request.url).pathname
  if(path === '/api/health') {
   if(request.method !== 'GET') return json({error:'Method not allowed'},405,{Allow:'GET'})
   return json({service:'butterflii',mode:'test',checkout:'disabled'},200)
  }
  if(path === '/api/checkout') return json({error:'Checkout not enabled'},503)
  if(path === '/api' || path.startsWith('/api/')) return json({error:'Not found'},404)
  return env.ASSETS.fetch(request)
 }
}
