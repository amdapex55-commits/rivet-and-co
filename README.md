# Rivet & Co.

Premium mobile-first denim storefront + hidden admin. Static, zero-dependency,
zero-runtime-cost — deploys to Cloudflare Pages as-is.

    public/            what gets deployed
      index.html       app shell + all meta/SEO tags
      assets/css/      one stylesheet
      assets/js/
        fabric.js      procedural denim engine — generates every product shot as SVG
        data.js        seed catalogue, collections, sizing, orders, content, SEO
        store.js       persistence, cart, wishlist, orders, coupons, admin auth
        ui.js          shared components (cards, drawers, sheets, search, toasts)
        pages.js       customer-facing views
        admin.js       hidden admin dashboard
        app.js         router, splash, SEO head, global wiring
      manifest.webmanifest, robots.txt, sitemap.xml, _redirects
    tools/             dev only — never deployed
      serve.js         static server with SPA fallback
      asset.html       renders the favicon/app-icon/OG source art
      sheet.html       denim engine contact sheet
      frame.html       exact-width capture harness
      probe.html       layout measurement harness

## Run it

```bash
node tools/serve.js
```

Then open http://localhost:4321

## Deploy

Cloudflare Pages. `wrangler.jsonc` pins `pages_build_output_dir` to `./public`,
so only that directory is published — the repo root (and `.git`) never is.

```bash
npx wrangler pages deploy
```

`public/_redirects` sends every unmatched path to `index.html` so the clean URLs
(`/shop`, `/product/[slug]`, `/collections/[slug]`, `/admin`) work on refresh and
on direct links.

## Admin

Triple-tap (or triple-click) the **RIVET & CO.** wordmark in the top-left within
700ms. That reveals a password prompt — the gesture is discovery, not security.

Default password: `rivet2026` — change it in **Admin → Settings → Security**.
Session lasts 60 minutes; five wrong attempts lock input for 60 seconds.

`/admin` also works as a direct URL and is gated by the same password. It is
`noindex,nofollow` and excluded in `robots.txt`.

### What the admin covers

Overview (revenue, orders, AOV, 14-day chart, best sellers, low stock) ·
Products (create/edit/duplicate/delete, image gallery upload, colours,
inventory by size **and** colour, kids 4–14Y plus adult waist size sets,
price and sale price, collections, per-product SEO) · Orders (status workflow,
detail sheet, WhatsApp shortcut) · Customers · Coupons · Homepage content ·
SEO (with live Google preview, OG image upload) · Settings (brand assets,
favicon/logo upload, password, JSON export/import, factory reset).

## Where the images come from

There is no photography and no external asset. `fabric.js` generates every shot
— flat lay, back, macro detail, editorial crop, folded stack, full-bleed texture
— as an SVG built from layered `feTurbulence` weave, a twill pattern, wash-specific
fade maps, and drawn construction details (waistband, belt loops, fly, pockets,
bar tacks, copper stitching, brass rivets). Fits (slim/straight/tapered/relaxed/
jogger/bootcut) are real pattern parameters, so a jogger renders with a cuff and a
bootcut flares from the knee.

Replace them any time: upload real photos per product in the admin gallery, and
that product uses your photos instead. "Use generated denim shots instead" reverts.

## Data & the one thing to fix before going live

Everything — products, orders, customers, coupons, content, SEO, admin password
hash — lives in `localStorage` in the visitor's own browser. That makes the whole
store real and clickable with no backend and no monthly cost, and it is the right
shape for a launch demo or a design sign-off.

It is **not** a real shop yet. Orders placed by a customer land in that customer's
browser, not in yours, and the admin password gate is client-side. Before taking
money, move `store.js`'s reads/writes behind a real API and put `/admin` behind
server auth. The data model is deliberately plain JSON so that port is mechanical.

Use **Admin → Settings → Export JSON** before clearing site data.

## Notes

- Splash screen shows once per browser session (`sessionStorage`), 2s, then fades.
- Prices are PKR. Free delivery threshold and flat rate are editable in the admin.
- Filters live in the URL, so a filtered view is shareable and back/forward works.
- Structured data: `Organization` sitewide, `Product` + `Offer` on every PDP.
