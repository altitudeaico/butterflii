import {quoteBasket} from './checkout-quote.ts'
type Quote=ReturnType<typeof quoteBasket>
export async function createTestCheckout(config:{secret:string;origin:string},orderId:string,quote:Quote){
 if(!config.secret.startsWith('sk_test_')) throw new Error('Test Stripe key required')
 if(!/^[0-9a-f-]{36}$/i.test(orderId)) throw new Error('Invalid order ID')
 const origin=new URL(config.origin)
 if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash) throw new Error('Invalid return URL')
 const base=origin.href.replace(/\/$/,'')
 const form=new URLSearchParams({mode:'payment',success_url:base+'/thankyou.html?session_id={CHECKOUT_SESSION_ID}',cancel_url:base+'/shop.html?basket-test=1',client_reference_id:orderId,'metadata[order_id]':orderId,'payment_method_types[0]':'card'})
 const lines=quote.lines.map(l=>({name:l.name,amount:l.unit_price_pence,quantity:l.quantity}))
 if(quote.delivery_pence>0)lines.push({name:'Delivery',amount:quote.delivery_pence,quantity:1})
 lines.forEach((l,i)=>{const p='line_items['+i+']';form.set(p+'[price_data][currency]','gbp');form.set(p+'[price_data][product_data][name]',l.name);form.set(p+'[price_data][unit_amount]',String(l.amount));form.set(p+'[quantity]',String(l.quantity))})
 const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+config.secret,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'butterflii-test-'+orderId},body:form,redirect:'error'})
 if(!response.ok)throw new Error('Checkout session unavailable')
 const session=await response.json()
 if(session.livemode!==false||typeof session.id!=='string'||!session.id.startsWith('cs_test_')||typeof session.url!=='string'||new URL(session.url).origin!=='https://checkout.stripe.com')throw new Error('Unexpected checkout response')
 return {id:session.id,url:session.url}
}
