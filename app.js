function validateCatalog(source){
 if(!Array.isArray(source))return [];
 const seen=new Set(),categories=['burger','sandwich','hotdog','share','drink'];
 const text=value=>typeof value==='string'&&value.trim().length>0;
 return source.filter(p=>{
  if(!p||typeof p!=='object'||typeof p.id!=='string'||!/^[a-z][a-z0-9-]*$/.test(p.id)||seen.has(p.id)||!text(p.name)||!categories.includes(p.category))return false;
  if((p.description!==undefined&&typeof p.description!=='string')||(p.included!==undefined&&typeof p.included!=='string'))return false;
  if(!Array.isArray(p.variants)||!p.variants.length||!Array.from(p.variants).every(v=>v&&text(v.label)&&Number.isSafeInteger(v.price)&&v.price>0))return false;
  seen.add(p.id);return true;
 }).map(p=>Object.freeze({...p,variants:Object.freeze(p.variants.map(v=>Object.freeze({...v})))}));
}
const products=Object.freeze(validateCatalog(typeof menuProducts==='undefined'?null:menuProducts));
const productById=new Map(products.map(p=>[p.id,p]));
const cart=new Map(), selections=new Map();
function variantIndex(value){
 if(typeof value==='string'&&!/^(0|[1-9]\d*)$/.test(value))return null;
 if(typeof value!=='number'&&typeof value!=='string')return null;
 const index=Number(value);return Number.isSafeInteger(index)&&index>=0?index:null;
}
function getVariant(id,value){
 const p=productById.get(id),index=variantIndex(value);
 return p&&index!==null&&index<p.variants.length?{p,v:p.variants[index],index}:null;
}
function selectedIndex(p){
 const choice=getVariant(p.id,selections.has(p.id)?selections.get(p.id):0);
 if(choice)return choice.index;
 selections.delete(p.id);return 0;
}
function parseCartKey(key){
 if(typeof key!=='string'||!/^[a-z][a-z0-9-]*:(0|[1-9]\d*)$/.test(key))return null;
 const [id,index]=key.split(':');return getVariant(id,index);
}
const money=value=>'$'+value.toLocaleString('es-CL');
const wa=message=>'https://wa.me/56963978232?text='+encodeURIComponent(message.replace(/[\uD800-\uDFFF]/gu,'\uFFFD'));
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const categoryNames={burger:'Hamburguesa',sandwich:'Sándwich',hotdog:'Completo / as',share:'Para compartir',drink:'Bebida'};
const descriptions={burger:'Todas las hamburguesas incluyen papas fritas. Elige simple o doble.',sandwich:'Elige tu base: churrasco, lomito, pollo o champiñón. Todos incluyen papas fritas.',hotdog:'Elige tu preparación: completo, as o vienesa tocino.',share:'Elige el tamaño o la cantidad para tu mesa.',drink:'Consulta sabores disponibles al confirmar tu pedido.',all:'La carta completa. Elige la preparación y agrégala a tu pedido.'};
const dialog=document.querySelector('#cart');
let currentFilter='burger',toastTimer;
const miniSheets={burger:'mini-hamburguesas',sandwich:'mini-sandwiches',hotdog:'mini-completos',share:'mini-compartir',drink:'mini-bebidas'};
const miniIndex=new Map();
Object.keys(miniSheets).forEach(category=>products.filter(p=>p.category===category).forEach((p,index)=>miniIndex.set(p.id,index)));
function productThumbnail(p){
 if(p.id==='b-66')return `<a class="burger-mini-link" href="#ingredientes" aria-label="Explorar los ingredientes de la Ruta 66"><span class="burger-mini" aria-hidden="true">${[0,1,2,3,4].map(i=>`<span class="mini-layer mini-layer-${i}"></span>`).join('')}<span class="mini-shine"></span></span><span>Descúbrela por dentro ↗<small>Imagen ilustrativa</small></span></a>`;
 const columns=p.category==='drink'?2:3,rows=p.category==='drink'?2:5,index=miniIndex.get(p.id);
 const row=Math.floor(index/columns);
 const boundaries={burger:[0,325,642,950,1245,1619],sandwich:[0,320,630,942,1238,1619],hotdog:[0,325,640,950,1250,1619]}[p.category];
 const cellHeight=boundaries?boundaries[row+1]-boundaries[row]:1;
 const backgroundHeight=boundaries?1619/cellHeight*100:rows*100;
 const backgroundY=boundaries?boundaries[row]/(1619-cellHeight)*100:row/(rows-1)*100;
 const caption={burger:'Referencia simple',sandwich:'Referencia con churrasco',hotdog:'Referencia con vienesa',share:'Presentación referencial',drink:'Envase referencial'}[p.category];
 return `<div class="menu-mini-wrap"><button type="button" class="menu-mini-control" data-mini="${p.id}" aria-label="Ampliar miniatura ilustrativa de ${escapeHTML(p.name)}" aria-pressed="false"><span class="menu-mini-image" aria-hidden="true" style="background-image:url('assets/${miniSheets[p.category]}.webp');background-size:${columns*100}% ${backgroundHeight}%;background-position:${index%columns/(columns-1)*100}% ${backgroundY}%"></span><span class="mini-shine" aria-hidden="true"></span></button><span class="mini-caption">${caption}<small>Imagen ilustrativa</small></span></div>`;
}
function productVariants(p,choice){
 if(p.variants.length<2)return '';
 if(p.variants.length===2&&p.variants[0].label==='Simple'&&p.variants[1].label==='Doble'){
  return `<fieldset class="size-options"><legend class="sr-only">Elige Simple o Doble para ${escapeHTML(p.name)}</legend>${p.variants.map((v,i)=>`<label class="size-option"><input type="radio" name="size-${p.id}" data-variant="${p.id}" value="${i}" ${i===choice?'checked':''}><span>${escapeHTML(v.label)}</span></label>`).join('')}</fieldset>`;
 }
 return `<label class="variant-label" for="variant-${p.id}">${p.category==='sandwich'?'Elige tu base':'Elige tu opción'}</label><select id="variant-${p.id}" data-variant="${p.id}">${p.variants.map((v,i)=>`<option value="${i}" ${i===choice?'selected':''}>${escapeHTML(v.label)} · ${money(v.price)}</option>`).join('')}</select>`;
}
function renderProducts(){
 const query=normalize(document.querySelector('#search').value.trim());
 const list=products.filter(p=>(currentFilter==='all'||p.category===currentFilter)&&normalize(p.name+' '+p.description+' '+p.variants.map(v=>v.label).join(' ')).includes(query));
 document.querySelector('#category-description').textContent=descriptions[currentFilter];
 document.querySelector('#result-count').textContent=list.length+(list.length===1?' opción':' opciones');
 document.querySelector('#products').innerHTML=list.length?list.map((p,index)=>{
 const choice=selectedIndex(p),v=p.variants[choice];
 return `<article class="product" style="--order:${Math.min(index,8)}"><span class="route-number" aria-hidden="true">${escapeHTML(p.category==='burger'?p.name.replace('Ruta ','').slice(0,3).toUpperCase():String(index+1).padStart(2,'0'))}</span><div class="product-body"><small class="product-category">${categoryNames[p.category]}</small><h3>${escapeHTML(p.name)}</h3>${productThumbnail(p)}${p.description?`<p>${escapeHTML(p.description)}</p>`:''}${p.included?`<span class="included">${escapeHTML(p.included)}</span>`:''}${productVariants(p,choice)}<div class="product-bottom"><strong id="price-${p.id}" aria-live="polite" aria-atomic="true">${money(v.price)}</strong><button class="add-button" data-add="${p.id}" aria-label="Agregar ${escapeHTML(p.name)} al pedido">+ <span>Agregar</span></button></div></div></article>`;
 }).join(''):'<p class="empty">No encontramos ese antojo en esta categoría. Prueba con otro nombre o selecciona «Todo».</p>';
}
function orderRows(){
 const rows=[];let total=0,count=0;
 for(const [key,qty] of cart){
  const item=parseCartKey(key);
  const amount=item&&Number.isSafeInteger(qty)?item.v.price*qty:NaN;
  if(!item||!Number.isSafeInteger(qty)||qty<=0||!Number.isSafeInteger(amount)||!Number.isSafeInteger(total+amount)||!Number.isSafeInteger(count+qty)){cart.delete(key);continue}
  total+=amount;count+=qty;rows.push({key,p:item.p,v:item.v,qty});
 }
 return rows;
}
function setQuantity(key,qty){
 const item=parseCartKey(key);
 if(!item||!Number.isSafeInteger(qty)||qty<0)return false;
 const others=orderRows().filter(row=>row.key!==key);
 const amount=item.v.price*qty,total=others.reduce((sum,row)=>sum+row.v.price*row.qty,0)+amount,count=others.reduce((sum,row)=>sum+row.qty,0)+qty;
 if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(total)||!Number.isSafeInteger(count))return false;
 if(qty===0)cart.delete(key);else cart.set(key,qty);return true;
}
function changeQuantity(key,delta){
 if(delta!==1&&delta!==-1&&delta!=='1'&&delta!=='-1')return false;
 orderRows();
 if(!cart.has(key))return false;
 if(!setQuantity(key,cart.get(key)+Number(delta)))return false;
 renderCart(key,delta);return true;
}
function orderName(p,v){return (p.category==='hotdog'?v.label+' '+p.name:categoryNames[p.category]+' '+p.name+(p.variants.length>1?' · '+v.label:''))+(p.category==='burger'||p.category==='sandwich'?' + papas fritas':'')}
function updateCheckout(){
 const rows=orderRows(),total=rows.reduce((sum,{v,qty})=>sum+v.price*qty,0),count=rows.reduce((sum,row)=>sum+row.qty,0);
 const notes=document.querySelector('#notes').value.slice(0,500).trim();
 document.querySelector('#count').textContent=count;
 document.querySelector('#subtotal').textContent=money(total);
 const checkout=document.querySelector('#checkout');checkout.setAttribute('aria-disabled',String(!count));checkout.tabIndex=count?0:-1;
 if(count)checkout.href=wa('Hola Ruta Central, quisiera solicitar:\n\n'+rows.map(({p,v,qty})=>`${qty} × ${orderName(p,v)} — ${money(v.price*qty)}`).join('\n')+'\n\nSubtotal: '+money(total)+' (sin despacho).'+(notes?'\nObservaciones: '+notes:'')+'\n\n¿Me confirman disponibilidad y el total?');else checkout.removeAttribute('href');
}
function renderCart(focusKey,delta){
 const rows=orderRows();
 document.querySelector('#cart-items').innerHTML=rows.length?rows.map(({key,p,v,qty})=>`<div class="cart-row"><div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(v.label)} · ${money(v.price*qty)}</p>${p.category==='burger'||p.category==='sandwich'?'<small>Incluye papas fritas</small>':''}</div><div class="quantity"><button data-change="${key}" data-delta="-1" aria-label="Quitar una unidad de ${escapeHTML(p.name)}, ${escapeHTML(v.label)}">−</button><span>${qty}</span><button data-change="${key}" data-delta="1" aria-label="Agregar una unidad de ${escapeHTML(p.name)}, ${escapeHTML(v.label)}">+</button></div></div>`).join(''):'<p class="empty">Tu pedido todavía está vacío.<br>Elige tu favorita en la carta para comenzar.</p>';
 updateCheckout();
 if(parseCartKey(focusKey)&&(delta===1||delta===-1||delta==='1'||delta==='-1'))(document.querySelector(`[data-change="${focusKey}"][data-delta="${delta}"]`)||document.querySelector('#close-cart')).focus();
}
function addProduct(id,index=selections.has(id)?selections.get(id):0){
 const item=getVariant(id,index);if(!item)return false;
 orderRows();
 const key=id+':'+item.index;if(!setQuantity(key,(cart.get(key)||0)+1))return false;renderCart();
 const p=item.p,toast=document.querySelector('#toast');toast.textContent=p.name+' · '+item.v.label+' agregado';toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2400);
 document.querySelector('#open-cart').animate?.([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:280});
 return true;
}
document.addEventListener('click',event=>{
 const mini=event.target.closest('[data-mini]');
 if(mini){const active=mini.getAttribute('aria-pressed')!=='true';document.querySelectorAll('[data-mini]').forEach(button=>{button.classList.remove('is-active');button.setAttribute('aria-pressed','false')});mini.classList.toggle('is-active',active);mini.setAttribute('aria-pressed',String(active))}
 const add=event.target.closest('[data-add]');if(add)addProduct(add.dataset.add);
 const quick=event.target.closest('[data-quick]');if(quick)addProduct(quick.dataset.quick,0);
 const change=event.target.closest('[data-change]');if(change)changeQuantity(change.dataset.change,change.dataset.delta);
 const filter=event.target.closest('[data-filter]');if(filter&&Object.hasOwn(descriptions,filter.dataset.filter)){currentFilter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(button=>{button.classList.toggle('selected',button===filter);button.setAttribute('aria-pressed',String(button===filter))});renderProducts()}
});
document.addEventListener('change',event=>{if(event.target.matches?.('[data-variant]')){const id=event.target.dataset.variant,item=getVariant(id,event.target.value);if(!item)return;selections.set(id,item.index);const price=document.querySelector('#price-'+id);if(price)price.textContent=money(item.v.price)}});
document.querySelector('#search').addEventListener('input',renderProducts);
document.querySelector('#open-cart').addEventListener('click',()=>dialog.showModal());
document.querySelector('#close-cart').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right)dialog.close()}});
document.querySelector('#notes').addEventListener('input',updateCheckout);
document.querySelector('#checkout').addEventListener('click',event=>{updateCheckout();if(!cart.size)event.preventDefault()});
renderProducts();renderCart();
// Ingredient layers use one transparent image, clipped in CSS; no image processing.
const experience=document.querySelector('#burger-experience'),stage=document.querySelector('#burger-stage'),slider=document.querySelector('#assembly'),toggle=document.querySelector('#explode');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let manuallyControlled=false;
function setSpread(value){if((typeof value!=='number'&&typeof value!=='string')||(typeof value==='string'&&!value.trim())||!Number.isFinite(Number(value)))return false;const number=Math.max(0,Math.min(100,Number(value)));experience.style.setProperty('--spread',number/100);experience.classList.toggle('expanded',number>45);slider.value=number;toggle.setAttribute('aria-pressed',String(number>45));toggle.innerHTML=number>45?'VOLVER A ARMAR <span>↕</span>':'DESARMA TU RUTA <span>↕</span>';return true}
slider.addEventListener('input',()=>{manuallyControlled=true;setSpread(slider.value)});
toggle.addEventListener('click',()=>{manuallyControlled=true;setSpread(Number(slider.value)>45?0:100)});
stage.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||reducedMotion.matches)return;const r=stage.getBoundingClientRect();document.querySelector('#burger-rotator').style.transform=`perspective(900px) rotateY(${((event.clientX-r.left)/r.width-.5)*9}deg) rotateX(${((event.clientY-r.top)/r.height-.5)*-5}deg)`});
stage.addEventListener('pointerleave',()=>{document.querySelector('#burger-rotator').style.transform='none'});
let scheduled=false;
function onScroll(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(!manuallyControlled&&!reducedMotion.matches){const rect=experience.getBoundingClientRect();setSpread(Math.max(0,-rect.top+110)/3)}document.querySelector('header').classList.toggle('scrolled',scrollY>70)})}
window.addEventListener('scroll',onScroll,{passive:true});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}})},{threshold:.12});document.querySelectorAll('.sharing,.location').forEach(el=>{el.classList.add('scroll-reveal');observer.observe(el)})}

const tickerToggle=document.querySelector('#ticker-toggle');
tickerToggle.addEventListener('click',()=>{const paused=tickerToggle.getAttribute('aria-pressed')!=='true';tickerToggle.setAttribute('aria-pressed',String(paused));tickerToggle.setAttribute('aria-label',paused?'Reanudar texto en movimiento':'Pausar texto en movimiento');tickerToggle.textContent=paused?'▶':'Ⅱ';document.querySelector('.road-track').style.animationPlayState=paused?'paused':'running'});
