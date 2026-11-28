type Config = {url:string;publishableKey:string}
export type FamilyInventoryRow = {stock:number;reserved:number;verified:boolean;products:{slug:string;name:string;kind:string}}
export async function readFamilyInventory(config:Config,accessToken:string):Promise<FamilyInventoryRow[]> {
 const origin=new URL(config.url)
 if(origin.protocol!=='https:'||origin.origin!==config.url||!accessToken||accessToken.length>16384) throw new Error('Invalid inventory session')
 const headers={apikey:config.publishableKey,Authorization:'Bearer '+accessToken,'Accept-Profile':'butterflii'}
 const options={headers,cache:'no-store' as const,redirect:'error' as const}
 const memberUrl=new URL('/rest/v1/members',origin)
 memberUrl.searchParams.set('select','role')
 const membership=await fetch(memberUrl,options)
 if(!membership.ok)throw new Error('Membership unavailable')
 const members=await membership.json()
 if(!Array.isArray(members)||members.length!==1||members[0]?.role!=='parent')throw new Error('Parent access required')
 const url=new URL('/rest/v1/inventory',origin)
 url.searchParams.set('select','stock,reserved,verified,products!inner(slug,name,kind)')
 const response=await fetch(url,options)
 if(!response.ok)throw new Error('Inventory unavailable')
 const rows=await response.json()
 if(!Array.isArray(rows)||!rows.every(r=>Number.isSafeInteger(r?.stock)&&Number.isSafeInteger(r?.reserved)&&r.stock>=0&&r.reserved>=0&&r.reserved<=r.stock&&typeof r.verified==='boolean'&&typeof r.products?.slug==='string'&&typeof r.products?.name==='string'&&['artwork','merchandise'].includes(r.products?.kind)))throw new Error('Invalid inventory response')
 return rows.map(r=>({stock:r.stock,reserved:r.reserved,verified:r.verified,products:{slug:r.products.slug,name:r.products.name,kind:r.products.kind}}))
}
