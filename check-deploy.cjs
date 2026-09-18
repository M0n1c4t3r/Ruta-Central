const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { build, publicFiles, inventory } = require('./build-public.cjs');

async function check() {
  const output = build();
  assert.deepEqual(inventory(output), [...publicFiles].sort());
  for (const relative of publicFiles) {
    assert(fs.readFileSync(path.join(output, relative)).equals(fs.readFileSync(path.join(__dirname, relative))), relative);
  }
  const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  assert(!html.includes('### Comentario de Referencia ###'));
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (!ref.startsWith('http') && !ref.startsWith('#')) assert(publicFiles.includes(ref), `Missing HTML asset: ${ref}`);
  }
  for (const css of ['style.css', 'experience.css']) {
    for (const [, ref] of fs.readFileSync(path.join(output, css), 'utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
      assert(publicFiles.includes(ref), `Missing CSS asset: ${ref}`);
    }
  }
  const config = require('./wrangler.json');
  assert.equal(config.main, 'worker.mjs');
  assert.equal(config.assets.directory, './dist');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.assets.not_found_handling, 'none');
  const { default: worker, securityHeaders, withSecurityHeaders } = await import(pathToFileURL(path.join(__dirname, 'worker.mjs')).href);
  function checkHeaders(response) {
    for (const [name, value] of Object.entries(securityHeaders)) assert.equal(response.headers.get(name), value, name);
    assert.equal(response.headers.get('strict-transport-security'), null);
    assert.equal(response.headers.get('cross-origin-embedder-policy'), null);
    assert.equal(response.headers.get('cross-origin-resource-policy'), null);
    const policy=response.headers.get('content-security-policy');
    assert(!policy.includes('unsafe-eval'));
    assert(policy.includes("script-src 'self';"));
    assert(policy.includes("script-src-attr 'none';"));
    assert(policy.includes("style-src 'self' https://fonts.googleapis.com;"));
    assert(policy.includes("style-src-attr 'unsafe-inline';"));
    assert(policy.includes('font-src https://fonts.gstatic.com;'));
  }
  for (const status of [200, 206, 304, 404]) {
    const original=new Response(status===304?null:'asset', {status, headers:{'ETag':'"test"','Content-Type':'application/pdf','Content-Security-Policy':'old-policy'}});
    const wrapped=withSecurityHeaders(original);
    checkHeaders(wrapped);
    assert.equal(wrapped.status,status);
    assert.equal(wrapped.headers.get('etag'),'"test"');
    assert.equal(wrapped.headers.get('content-type'),'application/pdf');
    assert.equal(await wrapped.text(),status===304?'':'asset');
  }
  let assetCalls = 0;
  // Models the asset boundary, not the Cloudflare runtime. Public verification is separate.
  const env = { ASSETS: { fetch: async request => {
    assetCalls++;
    const relative = new URL(request.url).pathname.slice(1) || 'index.html';
    return publicFiles.includes(relative)
      ? new Response(fs.readFileSync(path.join(output, relative)))
      : new Response('Not found', { status: 404 });
  } } };
  for (const suffix of ['/', '/assets/carta-ruta-central.pdf?download=1', '/?q=a%20b&x=%26', '/.git/HEAD']) {
    const url = 'http://ruta-central.example' + suffix;
    const response = await worker.fetch(new Request(url), env);
    assert.equal(response.status, 308);
    checkHeaders(response);
    assert.equal(response.headers.get('location'), url.replace(/^http:/, 'https:'));
  }
  assert.equal(assetCalls, 0, 'HTTP must redirect before assets are read');
  for (const relative of publicFiles) {
    const response = await worker.fetch(new Request('https://ruta-central.example/' + relative), env);
    assert.equal(response.status, 200, relative);
    checkHeaders(response);
    assert.equal(response.headers.get('location'), null, 'HTTPS must not loop');
    assert(Buffer.from(await response.arrayBuffer()).equals(fs.readFileSync(path.join(output, relative))));
  }
  for (const relative of ['.git/HEAD', '.git/config', 'check.cjs', 'preview.cjs', 'assets/GENERACION.md',
    'assets/REFERENCIAS-MINIATURAS.md', 'assets/prompts-miniaturas.json', 'prompts-miniaturas.json',
    'menu-export.json', 'build-public.cjs', 'worker.mjs', 'wrangler.json',
    'preview-security.cjs', 'SECURITY-PHASE2.md']) {
    const response = await worker.fetch(new Request('https://ruta-central.example/' + relative), env);
    assert.equal(response.status, 404, relative);
    checkHeaders(response);
    assert(!fs.existsSync(path.join(output, relative)), relative);
  }
  assert(!fs.existsSync(path.join(output,'_headers')), 'Header policy is centralized in the Worker');
  assert(!/http-equiv=["']Content-Security-Policy/i.test(html));
  console.log('PASS: artifact bytes/references/exclusions, HTTP 308 without loops, security headers on assets/redirects/404/304/206, body and cache metadata preserved (mock ASSETS).');
}
check().catch(error => { console.error(error); process.exitCode = 1; });
