'use strict';
(function(){
const products=new Map();
for(const [slug,p] of Object.entries(window.ARTWORKS||{})) products.set(slug,{slug,name:p.name,price:Math.round(Number(p.price.replace('£',''))*100),max:1});
for(const p of window.MERCHANDISE||[]) products.set(p.id,{slug:p.id,name:p.name,price:Math.round(p.price*100),max:10});
const key='butterflii-basket-v1';
let basket={};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const [slug,n] of Object.entries(saved)){const p=products.get(slug);if(p&&Number.isInteger(n)&&n>0&&n<=p.max)basket[slug]=n;}}catch{}
const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(n/100);
function save(){try{localStorage.setItem(key,JSON.stringify(basket));}catch{} render();}
function render(){
const root=document.getElementById('basket-items');if(!root)return;root.replaceChildren();
let total=0;
for(const [slug,n] of Object.entries(basket)){
const p=products.get(slug);total+=p.price*n;
const row=document.createElement('p');row.textContent=p.name+' × '+n+' · '+money(p.price*n)+' ';
const remove=document.createElement('button');remove.type='button';remove.textContent='Remove one';remove.onclick=()=>{if(--basket[slug]===0)delete basket[slug];save();};row.append(remove);root.append(row);
}
document.getElementById('basket-total').textContent=money(total);
document.getElementById('basket-count').textContent=String(Object.values(basket).reduce((a,b)=>a+b,0));
if(!Object.keys(basket).length)root.textContent='Your basket is empty.';
}
window.ButterfliiBasket={add(slug){const p=products.get(slug);if(!p)return false;const n=basket[slug]||0;if(n>=p.max)return false;basket[slug]=n+1;save();return true;},items(){return Object.entries(basket).map(([slug,quantity])=>({slug,quantity}));}};
render();
})();
