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
for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(!ref.startsWith('http')&&!ref.startsWith('#'))assert(fs.existsSync(ref),'Missing asset '+ref)}
assert(!html.includes('23000'));assert(!html.includes('promo4.jpg'));
assert(html.match(/<section class="hero"[\s\S]*?burger_hand.jpg[\s\S]*?<\/section>/));
console.log('PASS: 57 miniatures with unique cells and valid assets; real hero photo preserved; 155 variants, cart totals, WhatsApp encoding, search and ingredient control.');
