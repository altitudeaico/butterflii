export type Product = {slug:string;name:string;price_pence:number;kind:string;available:boolean;stock:number}
export type BasketLine = {slug:string;quantity:number}
export function quoteBasket(input:unknown, catalogue:Product[], deliveryPence:number){
 if(!Array.isArray(input)||input.length<1||input.length>14) throw new Error('Invalid basket')
 if(!Number.isSafeInteger(deliveryPence)||deliveryPence<0) throw new Error('Delivery unavailable')
 const seen=new Set<string>()
 const lines=input.map((line:BasketLine)=>{
  if(!line||typeof line.slug!=='string'||!Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>10||seen.has(line.slug)) throw new Error('Invalid basket item')
  seen.add(line.slug)
  const p=catalogue.find(p=>p.slug===line.slug)
  if(!p||!p.available||!Number.isSafeInteger(p.stock)||p.stock<line.quantity||(p.kind==='artwork'&&line.quantity!==1)) throw new Error('Product unavailable')
  if(!Number.isSafeInteger(p.price_pence)||p.price_pence<=0) throw new Error('Invalid catalogue price')
  return {slug:p.slug,name:p.name,quantity:line.quantity,unit_price_pence:p.price_pence,line_total_pence:p.price_pence*line.quantity}
 })
 const subtotal=lines.reduce((sum,line)=>sum+line.line_total_pence,0)
 if(!Number.isSafeInteger(subtotal+deliveryPence)) throw new Error('Invalid total')
 return {currency:'gbp',lines,subtotal_pence:subtotal,delivery_pence:deliveryPence,total_pence:subtotal+deliveryPence}
}
