export function createInventoryAuthenticator(config:{hqUrl:string;hqPublishableKey:string}){
 const origin=new URL(config.hqUrl)
 if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw new Error('Invalid HQ origin')
 return async(token:string):Promise<{id:string;role:'super_admin'|'ops_admin'}|null>=>{
 if(!token||token.length>16384)return null
 const headers={apikey:config.hqPublishableKey,Authorization:'Bearer '+token}
 const options={headers,redirect:'error' as const,cache:'no-store' as const}
 const response=await fetch(new URL('/auth/v1/user',origin),options)
 if(!response.ok)return null
 const user=await response.json()
 if(typeof user?.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)||user.is_anonymous===true)return null
 const url=new URL('/rest/v1/profiles',origin)
 url.searchParams.set('select','id,role')
 url.searchParams.set('id','eq.'+user.id)
 const profile=await fetch(url,{...options,headers:{...headers,'Accept-Profile':'hq'}})
 if(!profile.ok)return null
 const rows=await profile.json()
 if(!Array.isArray(rows)||rows.length!==1||rows[0]?.id!==user.id)return null
 const role=rows[0].role
 if(role!=='super_admin'&&role!=='ops_admin')return null
 return {id:user.id,role}
 }
}
