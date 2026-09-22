// Local CSP smoke preview; serves only dist. Does not emulate Cloudflare itself.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { publicFiles, inventory } = require('./build-public.cjs');
const root = path.join(__dirname, 'dist');
inventory(root);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png',
  '.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.webp':'image/webp','.pdf':'application/pdf'};

import(pathToFileURL(path.join(__dirname, 'worker.mjs')).href).then(({default:worker}) => {
  const env = { ASSETS: { fetch: async request => {
    let file;
    try { file = decodeURIComponent(new URL(request.url).pathname).slice(1) || 'index.html'; }
    catch { return new Response('Bad request', {status:400}); }
    if (!publicFiles.includes(file)) return new Response('Not found', {status:404});
    return new Response(request.method==='HEAD'?null:fs.readFileSync(path.join(root,file)), {
      headers:{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'},
    });
  } } };
  const port = Number(process.env.PORT || 4175);
  http.createServer(async(req,res) => {
    try {
      // Loopback HTTP is used only to inspect the final HTTPS response in a browser.
      // Redirect behavior is tested separately in check-deploy.cjs.
      const url=new URL(req.url,'https://rutacentral.cl');
      const response=await worker.fetch(new Request(url,{method:req.method}),env);
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(500);res.end('Preview error'); }
  }).listen(port,'127.0.0.1',()=>console.log(`Security preview: http://127.0.0.1:${port}`));
}).catch(error=>{console.error(error.message);process.exitCode=1});
