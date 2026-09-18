const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { publicFiles } = require('./build-public.cjs');

async function check() {
  const base = new URL(process.argv[2] || 'https://ruta-central.roberto-bravo-07.workers.dev/');
  assert.equal(base.protocol, 'https:');
  assert.equal(base.pathname, '/');
  assert(!base.search && !base.hash && !base.username && !base.password);
  const forbidden = ['/.git/HEAD', '/.git/config', '/check.cjs', '/preview.cjs',
    '/assets/GENERACION.md', '/assets/REFERENCIAS-MINIATURAS.md',
    '/assets/prompts-miniaturas.json', '/prompts-miniaturas.json', '/menu-export.json',
    '/build-public.cjs', '/check-deploy.cjs', '/check-live.cjs', '/worker.mjs', '/wrangler.json'];
  let failures = 0;
  const request = url => fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  for (const resource of forbidden) {
    const response = await request(new URL(resource, base));
    const ok = [403, 404].includes(response.status);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${resource}: ${response.status}`);
    if (!ok) failures++;
    await response.body?.cancel(); // Never print potentially sensitive contents.
  }
  for (const relative of publicFiles) {
    const resource = relative === 'index.html' ? '/' : '/' + relative;
    const response = await request(new URL(resource, base));
    const bytes = Buffer.from(await response.arrayBuffer());
    const local = fs.readFileSync(path.join(__dirname, 'dist', relative));
    const textual = /\.(html|css|js)$/.test(relative);
    const same = textual
      ? bytes.toString('utf8').replace(/\r\n/g, '\n') === local.toString('utf8').replace(/\r\n/g, '\n')
      : bytes.equals(local);
    const ok = response.status === 200 && same;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${resource}: ${response.status}; matches artifact: ${same}`);
    if (!ok) failures++;
  }
  for (const suffix of ['/', '/assets/carta-ruta-central.pdf?phase1=a%20b&x=%26']) {
    const secure = new URL(suffix, base);
    const insecure = new URL(secure);
    insecure.protocol = 'http:';
    const response = await request(insecure);
    const ok = [301, 308].includes(response.status) && response.headers.get('location') === secure.href;
    console.log(`${ok ? 'PASS' : 'FAIL'} HTTP ${suffix}: ${response.status}; HTTPS path/query preserved: ${ok}`);
    if (!ok) failures++;
    await response.body?.cancel();
  }
  assert.equal(failures, 0, `${failures} public checks failed; Phase 1 is not closed in production`);
  console.log('PASS: public Phase 1 checks.');
}
check().catch(error => { console.error(error.message); process.exitCode = 1; });
