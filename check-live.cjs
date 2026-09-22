const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { publicFiles } = require('./build-public.cjs');

async function check() {
  require('./check-seo.cjs').checkSEO(path.join(__dirname, 'dist'));
  const { securityHeaders } = await import(pathToFileURL(path.join(__dirname,'worker.mjs')).href);
  const base = new URL(process.argv[2] || 'https://rutacentral.cl/');
  assert.equal(base.origin, 'https://rutacentral.cl', 'Production canonical origin must be https://rutacentral.cl');
  assert.equal(base.protocol, 'https:');
  assert.equal(base.pathname, '/');
  assert(!base.search && !base.hash && !base.username && !base.password);
  const forbidden = ['/.git/HEAD', '/.git/config', '/check.cjs', '/preview.cjs',
    '/assets/GENERACION.md', '/assets/REFERENCIAS-MINIATURAS.md',
    '/assets/prompts-miniaturas.json', '/prompts-miniaturas.json', '/menu-export.json',
    '/build-public.cjs', '/check-deploy.cjs', '/check-live.cjs', '/worker.mjs', '/wrangler.json',
    '/preview-security.cjs', '/SECURITY-PHASE2.md', '/check-seo.cjs'];
  let failures = 0;
  function checkHeaders(response, resource) {
    for (const [name,value] of Object.entries(securityHeaders)) {
      if (response.headers.get(name)!==value) {
        console.log(`FAIL ${resource}: ${name} missing or different`);failures++;
      }
    }
    for (const name of ['strict-transport-security','cross-origin-embedder-policy']) {
      if (response.headers.has(name)) {console.log(`FAIL ${resource}: unexpected ${name}`);failures++;}
    }
  }
  const request = url => fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  for (const resource of forbidden) {
    const response = await request(new URL(resource, base));
    checkHeaders(response,resource);
    const ok = [403, 404].includes(response.status);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${resource}: ${response.status}`);
    if (!ok) failures++;
    await response.body?.cancel(); // Never print potentially sensitive contents.
  }
  for (const relative of publicFiles) {
    const resource = relative === 'index.html' ? '/' : '/' + relative;
    const response = await request(new URL(resource, base));
    checkHeaders(response,resource);
    const bytes = Buffer.from(await response.arrayBuffer());
    const local = fs.readFileSync(path.join(__dirname, 'dist', relative));
    const textual = /\.(html|css|js|txt|xml)$/.test(relative);
    const same = textual
      ? bytes.toString('utf8').replace(/\r\n/g, '\n') === local.toString('utf8').replace(/\r\n/g, '\n')
      : bytes.equals(local);
    const expectedMime = {'robots.txt':['text/plain'], 'sitemap.xml':['application/xml','text/xml'], 'assets/favicon.png':['image/png']}[relative];
    const mimeOK = !expectedMime || expectedMime.includes((response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase());
    if (!mimeOK) console.log(`FAIL ${resource}: inappropriate MIME`);
    const ok = mimeOK && response.status === 200 && same && !response.headers.has('location');
    console.log(`${ok ? 'PASS' : 'FAIL'} ${resource}: ${response.status}; matches artifact: ${same}`);
    if (!ok) failures++;
  }
  for (const origin of ['http://rutacentral.cl', 'http://ruta-central.roberto-bravo-07.workers.dev',
    'https://ruta-central.roberto-bravo-07.workers.dev']) {
    for (const suffix of ['/', '/assets/carta-ruta-central.pdf?phase1=a%20b&x=%26&x=2', '/?next=%2Fmenu%3Fa%3D1']) {
      const secure = new URL(suffix, base);
      const response = await request(origin + suffix);
      checkHeaders(response, origin + suffix);
      const ok = response.status === 308 && response.headers.get('location') === secure.href;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${origin}${suffix}: ${response.status}; canonical path/query preserved: ${ok}`);
      if (!ok) failures++;
      await response.body?.cancel();
      // One explicit hop to the expected canonical URL; never follow an untrusted Location.
      const canonical = await request(secure);
      checkHeaders(canonical, secure.href);
      const relative = secure.pathname === '/' ? 'index.html' : secure.pathname.slice(1);
      const bytes = Buffer.from(await canonical.arrayBuffer());
      const local = fs.readFileSync(path.join(__dirname, 'dist', relative));
      const same = relative.endsWith('.html')
        ? bytes.toString('utf8').replace(/\r\n/g, '\n') === local.toString('utf8').replace(/\r\n/g, '\n')
        : bytes.equals(local);
      const noLoop = canonical.status === 200 && !canonical.headers.has('location') && same;
      console.log(`${noLoop ? 'PASS' : 'FAIL'} canonical target: ${canonical.status}; matches ASSETS artifact without redirect: ${noLoop}`);
      if (!noLoop) failures++;
    }
  }
  assert.equal(failures, 0, `${failures} public checks failed; domain migration/security not verified in production`);
  console.log('PASS: public artifact on rutacentral.cl, HTTP/legacy 308 migration without loops, path/query and Phase 2 security headers.');
}
check().catch(error => { console.error(error.message); process.exitCode = 1; });
