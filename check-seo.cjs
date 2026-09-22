const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

function checkSEO(root) {
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const html = read('index.html');
  const head = html.split('</head>')[0];
  const canonical = 'https://rutacentral.cl/';
  const title = 'Ruta Central | Hamburguesas y churrascos en Maipú';
  const description = 'Hamburguesas, churrascos y chorrillanas en Maipú. Elige tu ruta y prepara tu pedido por WhatsApp.';
  const image = canonical + 'assets/burger_hand.jpg';
  const alt = 'Fotografía de una hamburguesa de Ruta Central con queso y vegetales';
  assert(!head.includes('workers.dev'));
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1);
  assert(head.includes(`<link rel="canonical" href="${canonical}">`));
  assert(head.includes('<link rel="icon" type="image/png" href="/assets/favicon.png">'));
  assert(head.includes(`<title>${title}</title>`));
  const metas = [...head.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)">/g)];
  const expected = {description, 'og:type':'website', 'og:site_name':'Ruta Central',
    'og:locale':'es_CL', 'og:url':canonical, 'og:title':title, 'og:description':description,
    'og:image':image, 'og:image:alt':alt, 'twitter:card':'summary', 'twitter:title':title,
    'twitter:description':description, 'twitter:image':image, 'twitter:image:alt':alt};
  for (const [key, value] of Object.entries(expected)) {
    assert.deepEqual(metas.filter(m => m[1] === key).map(m => m[2]), [value], key);
  }
  assert(!head.includes('twitter:site') && !head.includes('twitter:creator'));
  const blocks = [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  assert.deepEqual(JSON.parse(blocks[0][1]), {
    '@context':'https://schema.org', '@type':'Restaurant', name:'Ruta Central', url:canonical,
    telephone:'+56963978232', address:{'@type':'PostalAddress',
      streetAddress:'Av. Central Gonzalo Pérez Llona 497 Local 3', addressLocality:'Maipú', addressCountry:'CL'},
    logo:canonical+'assets/logo.webp', image, menu:canonical+'assets/carta-ruta-central.pdf',
    sameAs:['https://instagram.com/rutacentral.maipu'], servesCuisine:['Hamburguesas','Sándwiches','Comida rápida'],
  });
  assert.equal(read('robots.txt').replace(/\r\n/g, '\n'),
    'User-agent: *\nAllow: /\n\nSitemap: https://rutacentral.cl/sitemap.xml\n');
  // Strict grammar for our single-URL XML document; rejects extra nodes, attributes and URLs.
  assert.match(read('sitemap.xml'), /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*<url>\s*<loc>https:\/\/rutacentral\.cl\/<\/loc>\s*<\/url>\s*<\/urlset>\s*$/);
  const png = fs.readFileSync(path.join(root, 'assets/favicon.png'));
  assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  let offset=8; const chunks=[]; const data=[];
  while (offset < png.length) {
    assert(offset+12<=png.length);
    const size=png.readUInt32BE(offset), end=offset+8+size;
    assert(end+4<=png.length);
    const type=png.toString('ascii',offset+4,offset+8);
    let crc=0xffffffff;
    for (const byte of png.subarray(offset+4,end)) {
      crc ^= byte;
      for(let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0);
    }
    assert.equal((crc^0xffffffff)>>>0,png.readUInt32BE(end),`PNG CRC ${type}`);
    chunks.push(type);
    if(type==='IDAT') data.push(png.subarray(offset+8,end));
    offset=end+4;
  }
  assert.equal(chunks[0],'IHDR'); assert.equal(chunks.at(-1),'IEND');
  assert.equal(png.readUInt32BE(8),13);
  const width=png.readUInt32BE(16), height=png.readUInt32BE(20);
  assert(width>=48 && width===height);
  assert.deepEqual([...png.subarray(24,29)],[8,6,0,0,0]); // RGBA8, noninterlaced.
  const pixels=zlib.inflateSync(Buffer.concat(data));
  assert.equal(pixels.length,height*(width*4+1));
  for(let row=0;row<height;row++) assert(pixels[row*(width*4+1)]<=4);
  const expectedFiles=['index.html','style.css','experience.css','menu-data.js','app.js',
    'assets/logo.webp','assets/burger_hand.jpg','assets/burger-layers.webp','assets/italiano-studio.webp',
    'assets/carta-ruta-central.pdf','assets/mini-hamburguesas.webp','assets/mini-sandwiches.webp',
    'assets/mini-completos.webp','assets/mini-compartir.webp','assets/mini-bebidas.webp',
    'robots.txt','sitemap.xml','assets/favicon.png'];
  assert.deepEqual([...require('./build-public.cjs').publicFiles].sort(),expectedFiles.sort());
  console.log('PASS: SEO metadata, exact Restaurant data, robots, single-URL XML, valid square PNG and exact 18-file allowlist.');
}
module.exports = {checkSEO};
