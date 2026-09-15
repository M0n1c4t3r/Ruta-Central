const products=menuProducts;
const cart=new Map(), selections=new Map();
const money=value=>'$'+value.toLocaleString('es-CL');
const wa=message=>'https://wa.me/56963978232?text='+encodeURIComponent(message);
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
 return `<div class="menu-mini-wrap"><button type="button" class="menu-mini-control" data-mini="${p.id}" aria-label="Ampliar miniatura ilustrativa de ${p.name}" aria-pressed="false"><span class="menu-mini-image" aria-hidden="true" style="background-image:url('assets/${miniSheets[p.category]}.webp');background-size:${columns*100}% ${backgroundHeight}%;background-position:${index%columns/(columns-1)*100}% ${backgroundY}%"></span><span class="mini-shine" aria-hidden="true"></span></button><span class="mini-caption">${caption}<small>Imagen ilustrativa</small></span></div>`;
}
function productVariants(p,choice){
 if(p.variants.length<2)return '';
 if(p.variants.length===2&&p.variants[0].label==='Simple'&&p.variants[1].label==='Doble'){
  return `<fieldset class="size-options"><legend class="sr-only">Elige Simple o Doble para ${p.name}</legend>${p.variants.map((v,i)=>`<label class="size-option"><input type="radio" name="size-${p.id}" data-variant="${p.id}" value="${i}" ${i===choice?'checked':''}><span>${v.label}</span></label>`).join('')}</fieldset>`;
 }
 return `<label class="variant-label" for="variant-${p.id}">${p.category==='sandwich'?'Elige tu base':'Elige tu opción'}</label><select id="variant-${p.id}" data-variant="${p.id}">${p.variants.map((v,i)=>`<option value="${i}" ${i===choice?'selected':''}>${v.label} · ${money(v.price)}</option>`).join('')}</select>`;
}
function renderProducts(){
 const query=normalize(document.querySelector('#search').value.trim());
 const list=products.filter(p=>(currentFilter==='all'||p.category===currentFilter)&&normalize(p.name+' '+p.description+' '+p.variants.map(v=>v.label).join(' ')).includes(query));
 document.querySelector('#category-description').textContent=descriptions[currentFilter];
 document.querySelector('#result-count').textContent=list.length+(list.length===1?' opción':' opciones');
 document.querySelector('#products').innerHTML=list.length?list.map((p,index)=>{
 const choice=selections.get(p.id)||0,v=p.variants[choice];
 return `<article class="product" style="--order:${Math.min(index,8)}"><span class="route-number" aria-hidden="true">${p.category==='burger'?p.name.replace('Ruta ','').slice(0,3).toUpperCase():String(index+1).padStart(2,'0')}</span><div class="product-body"><small class="product-category">${categoryNames[p.category]}</small><h3>${p.name}</h3>${productThumbnail(p)}${p.description?`<p>${p.description}</p>`:''}${p.included?`<span class="included">${p.included}</span>`:''}${productVariants(p,choice)}<div class="product-bottom"><strong id="price-${p.id}" aria-live="polite" aria-atomic="true">${money(v.price)}</strong><button class="add-button" data-add="${p.id}" aria-label="Agregar ${p.name} al pedido">+ <span>Agregar</span></button></div></div></article>`;
 }).join(''):'<p class="empty">No encontramos ese antojo en esta categoría. Prueba con otro nombre o selecciona «Todo».</p>';
}
function orderRows(){return [...cart].map(([key,qty])=>{const [id,index]=key.split(':');const p=products.find(p=>p.id===id);return {key,p,v:p.variants[Number(index)],qty}})}
function orderName(p,v){return (p.category==='hotdog'?v.label+' '+p.name:categoryNames[p.category]+' '+p.name+(p.variants.length>1?' · '+v.label:''))+(p.category==='burger'||p.category==='sandwich'?' + papas fritas':'')}
function updateCheckout(){
 const rows=orderRows(),total=rows.reduce((sum,{v,qty})=>sum+v.price*qty,0),count=rows.reduce((sum,row)=>sum+row.qty,0);
 document.querySelector('#count').textContent=count;
 document.querySelector('#subtotal').textContent=money(total);
 const checkout=document.querySelector('#checkout');checkout.setAttribute('aria-disabled',String(!count));checkout.tabIndex=count?0:-1;
 if(count)checkout.href=wa('Hola Ruta Central, quisiera solicitar:\n\n'+rows.map(({p,v,qty})=>`${qty} × ${orderName(p,v)} — ${money(v.price*qty)}`).join('\n')+'\n\nSubtotal: '+money(total)+' (sin despacho).'+(document.querySelector('#notes').value.trim()?'\nObservaciones: '+document.querySelector('#notes').value.trim():'')+'\n\n¿Me confirman disponibilidad y el total?');else checkout.removeAttribute('href');
}
function renderCart(focusKey,delta){
 document.querySelector('#cart-items').innerHTML=cart.size?orderRows().map(({key,p,v,qty})=>`<div class="cart-row"><div><h3>${p.name}</h3><p>${escapeHTML(v.label)} · ${money(v.price*qty)}</p>${p.category==='burger'||p.category==='sandwich'?'<small>Incluye papas fritas</small>':''}</div><div class="quantity"><button data-change="${key}" data-delta="-1" aria-label="Quitar una unidad de ${p.name}, ${v.label}">−</button><span>${qty}</span><button data-change="${key}" data-delta="1" aria-label="Agregar una unidad de ${p.name}, ${v.label}">+</button></div></div>`).join(''):'<p class="empty">Tu pedido todavía está vacío.<br>Elige tu favorita en la carta para comenzar.</p>';
 updateCheckout();
 if(focusKey)(document.querySelector(`[data-change="${focusKey}"][data-delta="${delta}"]`)||document.querySelector('#close-cart')).focus();
}
function addProduct(id,index=selections.get(id)||0){
 const key=id+':'+index;cart.set(key,(cart.get(key)||0)+1);renderCart();
 const p=products.find(p=>p.id===id),toast=document.querySelector('#toast');toast.textContent=p.name+' · '+p.variants[index].label+' agregado';toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2400);
 document.querySelector('#open-cart').animate?.([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:280});
}
document.addEventListener('click',event=>{
 const mini=event.target.closest('[data-mini]');
 if(mini){const active=mini.getAttribute('aria-pressed')!=='true';document.querySelectorAll('[data-mini]').forEach(button=>{button.classList.remove('is-active');button.setAttribute('aria-pressed','false')});mini.classList.toggle('is-active',active);mini.setAttribute('aria-pressed',String(active))}
 const add=event.target.closest('[data-add]');if(add)addProduct(add.dataset.add);
 const quick=event.target.closest('[data-quick]');if(quick)addProduct(quick.dataset.quick,0);
 const change=event.target.closest('[data-change]');if(change){const key=change.dataset.change,qty=(cart.get(key)||0)+Number(change.dataset.delta);if(qty>0)cart.set(key,qty);else cart.delete(key);renderCart(key,change.dataset.delta)}
 const filter=event.target.closest('[data-filter]');if(filter){currentFilter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(button=>{button.classList.toggle('selected',button===filter);button.setAttribute('aria-pressed',String(button===filter))});renderProducts()}
});
document.addEventListener('change',event=>{if(event.target.matches('[data-variant]')){const id=event.target.dataset.variant,index=Number(event.target.value);selections.set(id,index);document.querySelector('#price-'+id).textContent=money(products.find(p=>p.id===id).variants[index].price)}});
document.querySelector('#search').addEventListener('input',renderProducts);
document.querySelector('#open-cart').addEventListener('click',()=>dialog.showModal());
document.querySelector('#close-cart').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right)dialog.close()}});
document.querySelector('#notes').addEventListener('input',updateCheckout);
document.querySelector('#checkout').addEventListener('click',event=>{if(!cart.size)event.preventDefault()});
renderProducts();renderCart();
// Ingredient layers use one transparent image, clipped in CSS; no image processing.
const experience=document.querySelector('#burger-experience'),stage=document.querySelector('#burger-stage'),slider=document.querySelector('#assembly'),toggle=document.querySelector('#explode');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let manuallyControlled=false;
function setSpread(value){const number=Math.max(0,Math.min(100,Number(value)));experience.style.setProperty('--spread',number/100);experience.classList.toggle('expanded',number>45);slider.value=number;toggle.setAttribute('aria-pressed',String(number>45));toggle.innerHTML=number>45?'VOLVER A ARMAR <span>↕</span>':'DESARMA TU RUTA <span>↕</span>'}
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
