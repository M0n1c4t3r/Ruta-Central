const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {menuProducts}=require('./menu-data.js');
assert.equal(menuProducts.length,57);
assert.equal(menuProducts.reduce((n,p)=>n+p.variants.length,0),155);
assert.equal(new Set(menuProducts.map(p=>p.id)).size,57);
assert(menuProducts.every(p=>p.variants.every(v=>Number.isInteger(v.price)&&v.price>0)));
assert.deepEqual(menuProducts.find(p=>p.id==='b-66').variants.map(v=>v.price),[5300,6990]);
assert.deepEqual(menuProducts.find(p=>p.id==='salchipapas').variants.map(v=>v.label),['Chica','Grande']);
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v},getAttribute(k){return this[k]??null},removeAttribute(k){delete this[k]},addEventListener(){},focus(){},animate(){}});return elements.get(id)}
const events=new Map();
const context={menuProducts,console,Map,setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:true}),window:{addEventListener(){}},document:{querySelector:element,querySelectorAll:()=>[],addEventListener(type,callback){events.set(type,callback)}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('app.js','utf8'),context);
vm.runInContext("addProduct('b-66',0);addProduct('b-66',1);addProduct('s-italiano',3);addProduct('salchipapas',1);",context);
assert.equal(element('#count').textContent,4);
const miniature=element('test-miniature');
const tap={target:{closest:selector=>selector==='[data-mini]'?miniature:null}};
events.get('click')(tap);assert.equal(miniature['aria-pressed'],'true');
events.get('click')(tap);assert.equal(miniature['aria-pressed'],'false');
assert.equal(element('#count').textContent,4,'Tapping a miniature must not add a product');
assert.equal(element('#subtotal').textContent,'$22.990');
const message=decodeURIComponent(element('#checkout').href.split('?text=')[1]);
assert(message.includes('Simple + papas fritas'));
assert(message.includes('Doble + papas fritas'));
assert(message.includes('Champiñón + papas fritas'));
assert(message.includes('Grande'));
element('#notes').value='Sin cebolla & retiro';vm.runInContext('updateCheckout()',context);
assert(decodeURIComponent(element('#checkout').href).includes('Sin cebolla & retiro'));
element('#search').value='jalapeno';vm.runInContext("currentFilter='all';renderProducts()",context);
assert(element('#products').innerHTML.includes('Ruta Azteca'));
assert.equal(element('#result-count').textContent,'1 opción');
vm.runInContext('cart.clear();renderCart();setSpread(100)',context);
assert.equal(element('#checkout')['aria-disabled'],'true');assert(!element('#checkout').href);
assert.equal(element('#assembly').value,100);
for(const p of menuProducts.filter(p=>p.category==='burger')){
 const markup=vm.runInContext(`productVariants(products.find(p=>p.id==='${p.id}'),1)`,context);
 assert(!markup.includes('<select'));
 assert.equal((markup.match(/type="radio"/g)||[]).length,2);
 assert(markup.includes('value="1" checked'));
}
events.get('change')({target:{matches:s=>s==='[data-variant]',dataset:{variant:'b-66'},value:'1'}});
assert.equal(element('#price-b-66').textContent,'$6.990');
vm.runInContext("addProduct('b-66')",context);
assert(decodeURIComponent(element('#checkout').href).includes('Doble + papas fritas'));
events.get('change')({target:{matches:s=>s==='[data-variant]',dataset:{variant:'b-66'},value:'0'}});
assert.equal(element('#price-b-66').textContent,'$5.300');
assert.equal(element('#subtotal').textContent,'$6.990','Changing selection must preserve existing cart prices');
// Every menu item receives a miniature; only Ruta 66 keeps its ingredient link.
const thumbnails=vm.runInContext('products.map(p=>({id:p.id,category:p.category,html:productThumbnail(p)}))',context);
assert.equal(thumbnails.length,57);
for(const thumbnail of thumbnails){
 assert(thumbnail.html.includes('Imagen ilustrativa'));
 if(thumbnail.id==='b-66'){assert(thumbnail.html.includes('href="#ingredientes"'));continue}
 assert(thumbnail.html.includes('data-mini="'+thumbnail.id+'"'));
 const asset=thumbnail.html.match(/background-image:url\('([^']+)'\)/)[1];
 assert(fs.existsSync(asset),'Missing miniature sheet '+asset);
 const position=thumbnail.html.match(/background-position:([\d.]+)% ([\d.]+)%/);
 assert(position&&Number(position[1])<=100&&Number(position[2])<=100);
}
for(const category of ['burger','sandwich','hotdog','share','drink']){
 const cards=thumbnails.filter(t=>t.category===category&&t.id!=='b-66');
 assert.equal(new Set(cards.map(t=>t.html.match(/background-position:[^\"]+/)[0])).size,cards.length);
}
const html=fs.readFileSync('index.html','utf8');
for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(!ref.startsWith('http')&&!ref.startsWith('#'))assert(fs.existsSync(ref.replace(/^\//, '')),'Missing asset '+ref)}
assert(!html.includes('23000'));assert(!html.includes('promo4.jpg'));
assert(html.match(/<section class="hero"[\s\S]*?burger_hand.jpg[\s\S]*?<\/section>/));
// Defensive boundary tests: malformed data and corrupt state must not throw.
context.candidateCatalog=JSON.parse(JSON.stringify(menuProducts));
assert.equal(vm.runInContext('validateCatalog(candidateCatalog).length',context),57);
for(const patch of [
 {id:'bad:id'}, {id:''}, {name:''}, {name:null}, {category:'unknown'},
 {variants:null}, {variants:[]}, {variants:[{label:'',price:1}]},
 {variants:[{label:'x',price:0}]}, {variants:[{label:'x',price:-1}]},
 {variants:[{label:'x',price:1.5}]}, {variants:[{label:'x',price:Infinity}]},
 {variants:[{label:'x',price:NaN}]}, {variants:[{label:'x',price:'100'}]},
 {variants:[{label:'x',price:Number.MAX_SAFE_INTEGER+1}]},
 {variants:new Array(2)}, {description:{}}, {included:42},
]){
 context.candidateCatalog=[{...menuProducts[0],...patch}];
 assert.equal(vm.runInContext('validateCatalog(candidateCatalog).length',context),0);
}
context.candidateCatalog=[menuProducts[0],menuProducts[0]];
assert.equal(vm.runInContext('validateCatalog(candidateCatalog).length',context),1);
assert.equal(vm.runInContext('validateCatalog(null).length',context),0);
vm.runInContext('cart.clear();selections.clear()',context);
for(const value of [-1,2,NaN,Infinity,1.5,'',' ','-1','01','1e0',null,{},Symbol('bad'),1n]){
 context.invalidValue=value;
 assert.equal(vm.runInContext("addProduct('b-66',invalidValue)",context),false);
}
assert.equal(vm.runInContext("addProduct('missing',0)",context),false);
assert.equal(vm.runInContext('cart.size',context),0);
for(const qty of [0,-1,NaN,Infinity,1.5,'1',{},Symbol('bad'),1n,Number.MAX_SAFE_INTEGER]){
 context.invalidValue=qty;
 vm.runInContext("cart.set('b-66:0',invalidValue);renderCart()",context);
 assert.equal(vm.runInContext('cart.size',context),0);
 assert.equal(element('#subtotal').textContent,'$0');
}
for(const key of ['missing:0','b-66:-1','b-66:2','b-66:01','b-66:0:0','b-66:NaN','b-66:Infinity',{},null]){
 context.invalidValue=key;
 vm.runInContext('cart.set(invalidValue,1);renderCart()',context);
 assert.equal(vm.runInContext('cart.size',context),0);
}
vm.runInContext("addProduct('b-66',0)",context);
assert.equal(vm.runInContext("setQuantity('b-66:0',Number.MAX_SAFE_INTEGER)",context),false);
assert.equal(vm.runInContext("changeQuantity('b-66:0','99')",context),false);
assert.equal(vm.runInContext("changeQuantity('b-66:0',1)",context),true);
assert.equal(element('#subtotal').textContent,'$10.600');
vm.runInContext("changeQuantity('b-66:0',-1);changeQuantity('b-66:0',-1)",context);
assert.equal(element('#checkout')['aria-disabled'],'true');
for(const value of ['-1','2','NaN','Infinity','', '1.5']){
 events.get('change')({target:{matches:()=>true,dataset:{variant:'b-66'},value}});
 assert.equal(vm.runInContext("selections.has('b-66')",context),false);
}
events.get('change')({target:{matches:()=>true,dataset:{variant:'missing'},value:'0'}});
element('#search').value='';
vm.runInContext("selections.set('b-66',Infinity);renderProducts()",context);
assert.equal(vm.runInContext("selections.has('b-66')",context),false);
vm.runInContext('setSpread(50)',context);
for(const value of [NaN,Infinity,-Infinity,'bad','',null,{},Symbol('bad')]){
 context.invalidValue=value;
 assert.equal(vm.runInContext('setSpread(invalidValue)',context),false);
 assert.equal(element('#assembly').value,50);
}
vm.runInContext('setSpread(-10)',context);assert.equal(element('#assembly').value,0);
vm.runInContext('setSpread(110)',context);assert.equal(element('#assembly').value,100);
element('#notes').value='x'.repeat(501);
vm.runInContext("addProduct('b-66',0)",context);
assert(decodeURIComponent(element('#checkout').href).includes('x'.repeat(500)));
assert(!decodeURIComponent(element('#checkout').href).includes('x'.repeat(501)));
element('#notes').value='Sin cebolla & <img src=x onerror=alert(1)> 😀\uD800';
vm.runInContext('updateCheckout()',context);
const url=new URL(element('#checkout').href);
assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/56963978232');
assert.equal([...url.searchParams.keys()].join(','),'text');
assert(url.searchParams.get('text').includes('😀�'));

// Catalog text is treated as text even if a future editing source inserts markup.
const payload='<img src=x onerror="alert(1)"> & \'quoted\'';
const hostile={...menuProducts[0],name:payload,description:payload,included:payload,variants:[{label:payload,price:7200},{label:'Doble',price:9600}]};
const hostileContext={...context,menuProducts:[hostile]};
vm.createContext(hostileContext);element('#search').value='';
vm.runInContext(fs.readFileSync('app.js','utf8'),hostileContext);
vm.runInContext("addProduct('b-5',0)",hostileContext);
for(const id of ['#products','#cart-items']){
 const markup=element(id).innerHTML;
 assert(!markup.includes('<img src=x'));
 assert(markup.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
}
console.log('PASS: 57 products / 155 variants, existing functional checks, catalog validation, invalid indices/keys/quantities, safe totals, notes, slider and escaped catalog HTML.');
// Phase 3 regression coverage; the previous security and functional tests remain intact.
const source=fs.readFileSync('app.js','utf8');
const reorderedContext={...context,menuProducts:[...menuProducts].reverse()};
vm.createContext(reorderedContext);vm.runInContext(source,reorderedContext);
const reordered=vm.runInContext('products.map(p=>({id:p.id,html:productThumbnail(p)}))',reorderedContext);
for(const t of thumbnails)assert.equal(reordered.find(r=>r.id===t.id).html,t.html,'Sprite changed when catalog reordered: '+t.id);
assert.equal(vm.runInContext('Object.keys(thumbnailMap).length',context),57);
for(const id of ['cart-feedback','cart-dialog-feedback'])assert(html.includes(`id="${id}" class="sr-only" role="status" aria-live="polite" aria-atomic="true"`));
assert(html.includes('id="toast" aria-hidden="true"'));
vm.runInContext('cart.clear()',context);element('#cart').open=false;
vm.runInContext("addProduct('b-66',0)",context);
assert(element('#cart-feedback').textContent.includes('agregado. Cantidad 1. Subtotal $5.300'));
assert.equal(element('#cart-dialog-feedback').textContent,'');
element('#cart').open=true;
vm.runInContext("changeQuantity('b-66:0',1)",context);
assert(element('#cart-dialog-feedback').textContent.includes('cantidad 2. Subtotal $10.600'));
assert.equal(element('#cart-feedback').textContent,'');
vm.runInContext("changeQuantity('b-66:0',-1);changeQuantity('b-66:0',-1)",context);
assert(element('#cart-dialog-feedback').textContent.includes('eliminado. Subtotal $0'));
const route66=menuProducts.find(p=>p.id==='b-66');
assert(html.includes(`Simple $${route66.variants[0].price.toLocaleString('es-CL')} · Doble $${route66.variants[1].price.toLocaleString('es-CL')}`));
const promo=menuProducts.find(p=>p.id==='s-italiano');
assert.equal(promo.name,'Italiano');assert.equal(promo.variants[0].label,'Churrasco');
assert(html.includes(`data-quick="${promo.id}"`));
assert(html.includes(`<strong>$${promo.variants[0].price.toLocaleString('es-CL')}</strong>`));
const {publicFiles}=require('./build-public.cjs');
for(const name of ['logo','burger-layers','italiano-studio']){
 assert(publicFiles.includes(`assets/${name}.webp`));assert(!publicFiles.includes(`assets/${name}.png`));
 const bytes=fs.readFileSync(`assets/${name}.webp`);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert(bytes.length<fs.statSync(`assets/${name}.png`).size);
}
assert(html.includes('fetchpriority="high" width="700" height="700"'));
assert(html.includes('width="1536" height="1024"'));
assert(html.includes('Condensed:wght@700;800;900'));
assert(!html.includes('Condensed:wght@600'));
assert(fs.readFileSync('style.css','utf8').includes('left:10px;z-index:100;padding:15px'));
console.log('PASS: Phase 3 stable ID sprites (reversed catalog), cart announcements, promoted prices, optimized allowlist, dimensions and priority.');

require('./check-seo.cjs').checkSEO(__dirname);
