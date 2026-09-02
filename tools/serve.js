/* Tiny static server with SPA fallback — dev only. */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'public'), PORT = 4321;
/* served under the same base path as GitHub Pages so <base> behaves identically */
const BASE = '/rivet-and-co';
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === BASE) { res.writeHead(302, { location: BASE + '/' }).end(); return; }
  if (url.startsWith(BASE + '/')) url = url.slice(BASE.length);
  else if (url === '/') { res.writeHead(302, { location: BASE + '/' }).end(); return; }
  let file = path.join(ROOT, url);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (!path.extname(file)) {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    else file = path.join(ROOT, 'index.html');            // SPA fallback
  }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }).end('404'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('Rivet & Co. dev server on http://localhost:' + PORT));
