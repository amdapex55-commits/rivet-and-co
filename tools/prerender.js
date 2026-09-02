/* Prerender a real HTML file per route.
   The app is still client-rendered; this bakes correct <head> metadata,
   JSON-LD and a crawlable <main> so every URL returns 200 with its own
   title/description instead of falling through to 404.html. */
const fs = require('fs'), path = require('path');
global.window = global;
require('../public/assets/js/fabric.js');
require('../public/assets/js/data.js');
const S = global.SEED, F = global.Fabric;

const PUB = path.join(__dirname, '..', 'public');
/* pristine shell — never written to, so prerendering is idempotent */
const SHELL = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
const SITE = 'https://amdapex55-commits.github.io/rivet-and-co';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pkr = n => 'Rs ' + Math.round(n).toLocaleString('en-PK');
const fit = k => (S.FIT_LABELS[k] || k);
const wash = k => ((F.WASHES[k] || {}).name || k);
const priceOf = p => p.salePrice || p.price;
const stockTotal = p => Object.keys(p.stock).reduce((a, k) => a + (+p.stock[k] || 0), 0);

function page(route, { title, desc, main, ld }) {
  let h = SHELL;
  const canonical = SITE + (route === '/' ? '/' : route + '/');
  h = h.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(title) + '</title>');
  h = h.replace(/(<meta name="description" content=")[^"]*(">)/, '$1' + esc(desc) + '$2');
  h = h.replace(/(<link rel="canonical" href=")[^"]*(">)/, '$1' + canonical + '$2');
  h = h.replace(/(<meta property="og:title" content=")[^"]*(">)/, '$1' + esc(title) + '$2');
  h = h.replace(/(<meta property="og:description" content=")[^"]*(">)/, '$1' + esc(desc) + '$2');
  h = h.replace(/(<meta property="og:url" content=")[^"]*(">)/, '$1' + canonical + '$2');
  h = h.replace(/(<meta name="twitter:title" content=")[^"]*(">)/, '$1' + esc(title) + '$2');
  h = h.replace(/(<meta name="twitter:description" content=")[^"]*(">)/, '$1' + esc(desc) + '$2');
  if (ld) {
    h = h.replace('</head>',
      '<script type="application/ld+json" id="ld-page">' + JSON.stringify(ld) + '</script>\n</head>');
  }
  if (main) h = h.replace('<main id="main" tabindex="-1"></main>',
    '<main id="main" tabindex="-1">' + main + '</main>');
  return h;
}

function write(route, html) {
  const dir = route === '/' ? PUB : path.join(PUB, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

let n = 0;

/* ---- home ---- */
write('/', page('/', {
  title: S.SEO.title, desc: S.SEO.description,
  main: '<div class="wrap" style="padding-block:30px"><p class="eyebrow">' + esc(S.LINE) + '</p>' +
    '<h1 class="h-lg">Built for movement.</h1><p>' + esc(S.CONTENT.heroSub) + '</p></div>'
})); n++;

/* ---- products ---- */
S.PRODUCTS.forEach(p => {
  const out = stockTotal(p) === 0;
  const sizes = S.KID_SIZES.filter(s => (+p.stock[s] || 0) > 0);
  const title = p.name + ' — ' + fit(p.fit) + ' Kids Denim 4–14Y | Rivet & Co.';
  const desc = p.description + ' ' + pkr(priceOf(p)) + '. Sizes 4Y–14Y.';
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, sku: p.id, description: p.description,
    image: p.images.map(i => SITE + '/' + i),
    brand: { '@type': 'Brand', name: 'Rivet & Co.' },
    color: wash(p.wash), material: p.fabric,
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 4, suggestedMaxAge: 14 },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: {
      '@type': 'Offer', url: SITE + '/product/' + p.slug + '/',
      priceCurrency: 'PKR', price: priceOf(p),
      availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Rivet & Co.' }
    }
  };
  const main = '<div class="wrap" style="padding-block:24px">' +
    '<p class="eyebrow">' + esc(S.LINE) + ' · ' + esc(fit(p.fit)) + ' · ' + esc(wash(p.wash)) + '</p>' +
    '<h1 class="h-md" style="margin:8px 0">' + esc(p.name) + '</h1>' +
    '<p><strong>' + pkr(priceOf(p)) + '</strong>' + (p.salePrice ? ' <s>' + pkr(p.price) + '</s>' : '') + '</p>' +
    '<p>' + esc(p.description) + '</p>' +
    '<img src="' + p.images[0] + '" alt="' + esc(p.name) + '" width="900" height="1350" style="max-width:420px;margin-top:16px">' +
    '<p style="margin-top:14px">Fabric: ' + esc(p.fabric) + '</p>' +
    '<p>' + (out ? 'Sold out' : 'Available in ' + esc(sizes.join(', '))) + '</p>' +
    '</div>';
  write('/product/' + p.slug, page('/product/' + p.slug, { title, desc, main, ld }));
  n++;
});

/* ---- collections ---- */
S.COLLECTIONS.forEach(c => {
  const list = S.PRODUCTS.filter(p => (p.collections || []).indexOf(c.slug) > -1);
  const title = c.title + ' — Kids Denim 4–14Y | Rivet & Co.';
  const desc = c.tag + '. ' + list.length + ' style' + (list.length === 1 ? '' : 's') + ' in PKR, sizes 4Y–14Y, delivered across Pakistan.';
  const main = '<div class="wrap" style="padding-block:24px"><p class="eyebrow">' + esc(S.LINE) + '</p>' +
    '<h1 class="h-lg">' + esc(c.title) + '</h1><p>' + esc(c.tag) + '</p><ul style="margin-top:16px">' +
    list.map(p => '<li><a href="product/' + p.slug + '/">' + esc(p.name) + ' — ' + pkr(priceOf(p)) + '</a></li>').join('') +
    '</ul></div>';
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.title, description: c.tag,
    url: SITE + '/collections/' + c.slug + '/',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: list.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, url: SITE + '/product/' + p.slug + '/', name: p.name
      }))
    }
  };
  write('/collections/' + c.slug, page('/collections/' + c.slug, { title, desc, main, ld }));
  n++;
});

/* ---- shop + static ---- */
const statics = [
  ['/shop', 'All Denim — Kids Jeans 4–14Y | Rivet & Co.',
    'Every Rivet Jr style, 4Y to 14Y. Filter by age, fit, wash and price. Prices in PKR, delivered across Pakistan.',
    '<div class="wrap" style="padding-block:24px"><p class="eyebrow">' + esc(S.LINE) + '</p><h1 class="h-lg">All Denim</h1><ul style="margin-top:16px">' +
    S.PRODUCTS.map(p => '<li><a href="product/' + p.slug + '/">' + esc(p.name) + ' — ' + pkr(priceOf(p)) + '</a></li>').join('') + '</ul></div>'],
  ['/size-guide', 'Size guide — Kids 4–14Y | Rivet & Co.',
    'Rivet Jr kids denim size guide: age, height, waist and inseam in centimetres for 4Y to 14Y.',
    '<div class="wrap" style="padding-block:24px"><h1 class="h-lg">Size guide</h1><table><thead><tr><th>Size</th><th>Age</th><th>Height</th><th>Waist</th><th>Inseam</th></tr></thead><tbody>' +
    S.SIZE_GUIDE.map(r => '<tr><td>' + r.size + '</td><td>' + r.age + '</td><td>' + r.height + '</td><td>' + r.waist + '</td><td>' + r.inseam + '</td></tr>').join('') +
    '</tbody></table></div>'],
  ['/shipping-returns', 'Delivery & returns | Rivet & Co.',
    'Delivery across Pakistan in 2–4 days, cash on delivery nationwide, and 7-day size exchanges.',
    '<div class="wrap" style="padding-block:24px"><h1 class="h-lg">Delivery &amp; returns</h1><p>Dispatched in 1–2 working days from Karachi. 2–4 days nationwide. Cash on delivery available. 7-day size exchange.</p></div>'],
  ['/about', 'Our denim | Rivet & Co.',
    'How Rivet & Co. makes the Rivet Jr kids range in Pakistan — fabric, fit and finishing.',
    '<div class="wrap" style="padding-block:24px"><h1 class="h-lg">Everyday jeans, better made.</h1><p>One block, revised four times, tested on kids who do not go easy on clothes.</p></div>'],
  ['/wishlist', 'Wishlist | Rivet & Co.', 'Denim you saved at Rivet & Co.', ''],
  ['/cart', 'Cart | Rivet & Co.', 'Your Rivet & Co. cart.', ''],
  ['/account', 'Account | Rivet & Co.', 'Your Rivet & Co. orders and saved denim.', '']
];
statics.forEach(([route, title, desc, main]) => {
  write(route, page(route, { title, desc, main }));
  n++;
});

/* generic SPA fallback for anything not prerendered */
fs.writeFileSync(path.join(PUB, '404.html'), SHELL);

console.log('prerendered ' + n + ' routes + 404.html');
