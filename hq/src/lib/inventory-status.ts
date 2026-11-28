export type InventoryStatus = 'unverified' | 'out-of-stock' | 'reserved' | 'original-available' | 'low-stock' | 'in-stock'
export function inventoryStatus(row:{kind:string;stock:number;reserved:number;verified:boolean}):{status:InventoryStatus;available:number|null}{
 if(!row.verified || !Number.isSafeInteger(row.stock)||!Number.isSafeInteger(row.reserved)||row.stock<0||row.reserved<0||row.reserved>row.stock||!['artwork','merchandise'].includes(row.kind))return {status:'unverified',available:null}
 const available=row.stock-row.reserved
 if(row.kind==='artwork'&&row.stock>1)return {status:'unverified',available:null}
 if(available===0)return {status:row.reserved>0?'reserved':'out-of-stock',available}
 return {status:row.kind==='artwork'?'original-available':available<=3?'low-stock':'in-stock',available}
}
