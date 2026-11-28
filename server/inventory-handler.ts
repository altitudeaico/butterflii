type Parent = {id:string;role:'super_admin'|'ops_admin'}
type InventoryRow = {slug:string;name:string;kind:string;stock:number;reserved:number;verified:boolean}
type Dependencies = {authenticateParent:(token:string)=>Promise<Parent|null>;readInventory:(parent:Parent)=>Promise<InventoryRow[]>}
export async function handleInventory(request:Request,deps:Dependencies):Promise<Response>{
 const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})
 if(request.method!=='GET')return reply({error:'Method not allowed'},405)
 const token=request.headers.get('Authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1]
 if(!token)return reply({error:'Authentication required'},401)
 try{
 const parent=await deps.authenticateParent(token)
 if(!parent||!['super_admin','ops_admin'].includes(parent.role))return reply({error:'Access denied'},403)
 const rows=await deps.readInventory(parent)
 return reply(rows.map(({slug,name,kind,stock,reserved,verified})=>({slug,name,kind,stock,reserved,verified})))
 }catch{return reply({error:'Inventory unavailable'},503)}
}
