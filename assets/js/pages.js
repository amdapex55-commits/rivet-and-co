/* ============================================================
   Pages — every customer-facing view.
   Each page returns { title, desc, html, mount?, ld? }
   ============================================================ */
(function (root, doc) {
  'use strict';
  var St = root.Store, F = root.Fabric, S = root.SEED, U = root.UI;
  var $ = U.$, $$ = U.$$, esc = U.esc, pkr = function (n) { return St.pkr(n); };

  function img(opts, cls, alt, w, h) {
    return '<img class="' + (cls || '') + '" src="' + F.url(opts) + '" alt="' + esc(alt || '') +
      '" loading="lazy" decoding="async" width="' + (w || 900) + '" height="' + (h || 1200) + '">';
  }
  function grid(list, opts) {
    return '<div class="grid">' + list.map(function (p) { return U.card(p, opts); }).join('') + '</div>';
  }
  function crumbs(parts) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + parts.map(function (p, i) {
      var last = i === parts.length - 1;
      return (last ? '<span aria-current="page" style="color:var(--char-2)">' + esc(p[0]) + '</span>'
                   : '<a href="' + p[1] + '" data-link>' + esc(p[0]) + '</a><span>/</span>');
    }).join('') + '</nav>';
  }

  /* ============================ HOME ============================ */
  function home() {
    var c = St.content;
    var newest = St.query({ collection: 'new-arrivals', sort: 'new' }).slice(0, 8);
    var best = St.query({ collection: 'best-sellers', sort: 'best' }).slice(0, 6);
    var fits = [
      { fit: 'skinny',   img: 'assets/img/products/ice-scrape-skinny-jean-1.jpg',          note: 'Closest leg' },
      { fit: 'slim',     img: 'assets/img/products/classic-indigo-slim-jean-1.jpg',        note: 'Close, not tight' },
      { fit: 'straight', img: 'assets/img/products/charcoal-utility-straight-pant-1.jpg',  note: 'The everyday leg' },
      { fit: 'jogger',   img: 'assets/img/products/shadow-denim-jogger-1.jpg',             note: 'Elastic hem' }
    ];
    var washes = [
      { key: 'dark-wash', img: 'assets/img/products/classic-indigo-slim-jean-1.jpg', label: 'Dark Wash' },
      { key: 'acid-wash', img: 'assets/img/products/slate-acid-skinny-jean-2.jpg',   label: 'Acid Wash' },
      { key: 'slim-fit',  img: 'assets/img/products/cloud-wash-slim-jean-1.jpg',     label: 'Light Wash' }
    ];

    var html =
    /* --- first screen: brand + product mood --- */
    '<section class="hero">' +
      '<div class="hero__media">' + img({ shot: 'texture', wash: c.heroWash, seed: 11 }, '', '', 1600, 1000) + '</div>' +
      '<div class="wrap"><div class="hero__in">' +
        '<p class="eyebrow hero__eyebrow"><i></i>' + esc(c.heroEyebrow) + '</p>' +
        '<h1 class="h-xl">' + c.heroTitle + '</h1>' +
        '<p class="hero__sub">' + esc(c.heroSub) + '</p>' +
        '<div class="hero__cta">' +
          '<a class="btn btn--light" href="' + esc(c.heroCta1Href) + '" data-link>' + esc(c.heroCta1) + '</a>' +
          '<a class="btn btn--ghost" style="--fg-b:#fff;border-color:rgba(246,243,237,.34)" href="' + esc(c.heroCta2Href) + '" data-link>' + esc(c.heroCta2) + '</a>' +
        '</div>' +
        '<div class="hero__meta">' +
          '<div>Sizes<b>4Y – 14Y</b></div>' +
          '<div>Fabric<b>10.5–12.5 oz</b></div>' +
          '<div>Delivery<b>Nationwide COD</b></div>' +
        '</div>' +
      '</div></div>' +
    '</section>' +

    /* --- product mood immediately under the fold line --- */
    '<section class="hero__peek">' +
      '<div class="wrap" style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">' +
        '<p class="eyebrow" style="color:var(--blue-400)">In stock now</p>' +
        '<a href="/shop" data-link style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue-300);font-weight:600">All denim</a>' +
      '</div>' +
      '<div class="wrap"><div class="rail rail--cards">' +
        best.slice(0, 6).map(function (p) { return U.card(p, { nosizes: true }); }).join('') +
      '</div></div>' +
    '</section>' +

    /* --- shop by fit --- */
    '<section class="sec sec--tight rv"><div class="wrap">' +
      '<div class="sec__head"><h2 class="h-md">Shop by fit</h2><a href="/shop" data-link>All fits</a></div>' +
      '<div class="rail rail--cards">' + fits.map(function (f) {
        return '<a class="fitchip" href="/shop?fit=' + f.fit + '" data-link>' +
          '<img src="' + f.img + '" alt="' + esc(U.fitLabel(f.fit)) + ' fit kids denim" loading="lazy" decoding="async" width="900" height="900">' +
          '<b>' + U.fitLabel(f.fit) + '</b><i>' + esc(f.note) + '</i></a>';
      }).join('') + '</div>' +
    '</div></section>' +

    /* --- new arrivals --- */
    '<section class="sec rv"><div class="wrap">' +
      '<div class="sec__head"><div><p class="eyebrow">Just landed</p><h2 class="h-lg" style="margin-top:6px">New Arrivals</h2></div>' +
      '<a href="/collections/new-arrivals" data-link>See all</a></div>' +
      grid(newest.slice(0, 4)) +
    '</div></section>' +

    /* --- editorial split --- */
    '<section class="split split--rev rv" style="background:var(--paper-2)">' +
      '<div class="split__media"><img src="assets/img/products/storm-rip-skinny-jean-2.jpg" alt="Close-up of Rivet Jr denim, showing a taped knee rip and inseam stitching" loading="lazy" decoding="async" width="900" height="1200"></div>' +
      '<div class="split__body">' +
        '<p class="eyebrow">The make</p>' +
        '<h2 class="h-lg" style="margin-top:10px">' + esc(c.editorialTitle) + '</h2>' +
        '<p style="margin-top:14px;color:var(--char-2);max-width:44ch">' + esc(c.editorialBody) + '</p>' +
        '<ul class="specs">' +
          '<li><b>01</b><p><strong>Reinforced knees</strong>A second denim panel bonded inside the knee, where kids jeans die first.</p></li>' +
          '<li><b>02</b><p><strong>Adjustable waist</strong>Internal elastic tab from 5Y up, so one size lasts two growth spurts.</p></li>' +
          '<li><b>03</b><p><strong>Bar-tacked stress points</strong>Pocket corners, fly and belt loops locked with copper thread.</p></li>' +
        '</ul>' +
        '<a class="btn btn--ghost" style="margin-top:24px" href="/about" data-link>How it is made</a>' +
      '</div>' +
    '</section>' +

    /* --- quote --- */
    '<section class="quote rv"><p class="serif">' + c.quote + '</p></section>' +

    /* --- washes --- */
    '<section class="sec sec--tight rv"><div class="wrap">' +
      '<div class="sec__head"><h2 class="h-md">Three washes</h2><a href="/shop" data-link>Filter by wash</a></div>' +
      '<div class="washband">' + washes.map(function (w) {
        return '<a href="/collections/' + w.key + '" data-link>' +
          '<img src="' + w.img + '" alt="' + esc(w.label) + ' kids denim" loading="lazy" decoding="async" width="900" height="1200">' +
          '<span>' + esc(w.label) + '</span></a>';
      }).join('') + '</div>' +
    '</div></section>' +

    /* --- best sellers --- */
    '<section class="sec rv"><div class="wrap">' +
      '<div class="sec__head"><div><p class="eyebrow">Proven</p><h2 class="h-lg" style="margin-top:6px">Best Sellers</h2></div>' +
      '<a href="/collections/best-sellers" data-link>See all</a></div>' +
      grid(best.slice(0, 4)) +
    '</div></section>' +

    /* --- size confidence --- */
    '<section class="sec sec--tight rv"><div class="wrap panel" style="padding:24px">' +
      '<p class="eyebrow">Sizing</p>' +
      '<h2 class="h-md" style="margin:8px 0 6px">Get the size right the first time</h2>' +
      '<p class="small dim" style="max-width:46ch">Sized by age and matched to height and waist in centimetres. Between sizes, take the larger — every pair adjusts at the waist.</p>' +
      '<div style="overflow-x:auto;margin-top:16px"><table class="sgtable"><thead><tr><th>Size</th><th>Age</th><th>Height cm</th><th>Waist cm</th></tr></thead><tbody>' +
        S.SIZE_GUIDE.map(function (r) { return '<tr><td>' + r.size + '</td><td>' + r.age + '</td><td>' + r.height + '</td><td>' + r.waist + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<button class="btn btn--ghost btn--sm" style="margin-top:16px" data-sizeguide="">Full size guide</button>' +
    '</div></section>' +

    /* --- coming soon --- */
    '<section class="soon rv">' +
      '<p class="eyebrow" style="color:var(--brass-lt)">Next</p>' +
      '<h2 class="h-lg" style="margin-top:10px">' + esc(c.soonTitle) + '</h2>' +
      '<p>' + esc(c.soonBody) + '</p>' +
      '<div class="soon__row"><a href="/shop?gender=men" data-link>Men · Soon</a><a href="/shop?gender=women" data-link>Women · Soon</a></div>' +
    '</section>' +

    /* --- trust --- */
    '<section class="trust">' +
      '<div><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg>' +
        '<strong>Free over ' + pkr(c.freeShipOver) + '</strong><span>Flat ' + pkr(c.flatShipping) + ' below</span></div>' +
      '<div><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/></svg>' +
        '<strong>7-day exchange</strong><span>Size swaps, no fuss</span></div>' +
      '<div><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 4 6v6c0 4.4 3.2 8.2 8 9 4.8-.8 8-4.6 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>' +
        '<strong>Cash on delivery</strong><span>Nationwide</span></div>' +
    '</section>';

    return {
      title: St.seo.title,
      desc: St.seo.description,
      html: html,
      mount: function () { U.observeReveals(); }
    };
  }

  /* ============================ SHOP ============================ */
  /* Options come from what is actually in the catalogue, so the panel never
     offers a filter that would return nothing. */
  function filterDefs() {
    var live = St.products(), fits = [], washes = [];
    live.forEach(function (p) {
      if (fits.indexOf(p.fit) < 0) fits.push(p.fit);
      (p.colors || [{ key: p.wash }]).forEach(function (c) {
        if (washes.indexOf(c.key) < 0) washes.push(c.key);
      });
      if (washes.indexOf(p.wash) < 0) washes.push(p.wash);
    });
    var order = Object.keys(S.FIT_LABELS);
    fits.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    return [
      { key: 'size', label: 'Age / Size', opts: S.KID_SIZES.map(function (x) { return { v: x, l: x }; }) },
      { key: 'fit',  label: 'Fit', opts: fits.map(function (k) { return { v: k, l: U.fitLabel(k) }; }) },
      { key: 'wash', label: 'Wash / Colour', opts: washes.map(function (k) { return { v: k, l: F.washName(k), c: F.washColor(k) }; }) }
    ];
  }

  function parseQ(q) {
    var st = {
      collection: q.collection || '', gender: q.gender || '',
      size: (q.size || '').split(',').filter(Boolean),
      fit: (q.fit || '').split(',').filter(Boolean),
      wash: (q.wash || '').split(',').filter(Boolean),
      max: q.max ? +q.max : 0,
      instock: q.instock === '1', sale: q.sale === '1',
      sort: q.sort || 'featured', q: q.q || ''
    };
    return st;
  }
  function toQuery(st) {
    var p = [];
    if (st.collection) p.push('collection=' + st.collection);
    if (st.gender) p.push('gender=' + st.gender);
    ['size', 'fit', 'wash'].forEach(function (k) { if (st[k].length) p.push(k + '=' + st[k].join(',')); });
    if (st.max) p.push('max=' + st.max);
    if (st.instock) p.push('instock=1');
    if (st.sale) p.push('sale=1');
    if (st.sort && st.sort !== 'featured') p.push('sort=' + st.sort);
    if (st.q) p.push('q=' + encodeURIComponent(st.q));
    return p.length ? '?' + p.join('&') : '';
  }
  function activeCount(st) {
    return st.size.length + st.fit.length + st.wash.length + (st.max ? 1 : 0) + (st.instock ? 1 : 0) + (st.sale ? 1 : 0);
  }
  var MAXP = 5000;

  function filtersHTML(st) {
    var h = filterDefs().map(function (g) {
      return '<div class="fgroup"><h4>' + esc(g.label) + '</h4><div class="fopts">' + g.opts.map(function (o) {
        var on = st[g.key].indexOf(o.v) > -1;
        return '<button class="fopt' + (on ? ' is-on' : '') + '" data-f="' + g.key + '" data-v="' + esc(o.v) + '" aria-pressed="' + on + '">' +
          (o.c ? '<i style="background:' + o.c + '"></i>' : '') + esc(o.l) + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    h += '<div class="fgroup"><h4>Max price</h4><div class="frange">' +
      '<input type="range" min="2500" max="' + MAXP + '" step="100" value="' + (st.max || MAXP) + '" data-range aria-label="Maximum price">' +
      '<output data-out>' + (st.max ? 'Up to ' + pkr(st.max) : 'Any price') + '</output></div></div>';
    h += '<div class="fgroup"><h4>Availability</h4>' +
      '<label class="check"><input type="checkbox" data-f="instock"' + (st.instock ? ' checked' : '') + '> In stock only</label>' +
      '<label class="check"><input type="checkbox" data-f="sale"' + (st.sale ? ' checked' : '') + '> On sale</label></div>';
    return h;
  }

  function chipsHTML(st) {
    var out = [];
    ['size', 'fit', 'wash'].forEach(function (k) {
      st[k].forEach(function (v) {
        var l = k === 'fit' ? U.fitLabel(v) : k === 'wash' ? U.washLabel(v) : v;
        out.push('<span class="chip">' + esc(l) + '<button data-rmf="' + k + '" data-v="' + esc(v) + '" aria-label="Remove filter ' + esc(l) + '">' + U.iconX() + '</button></span>');
      });
    });
    if (st.max) out.push('<span class="chip">Under ' + pkr(st.max) + '<button data-rmf="max" aria-label="Remove price filter">' + U.iconX() + '</button></span>');
    if (st.instock) out.push('<span class="chip">In stock<button data-rmf="instock" aria-label="Remove availability filter">' + U.iconX() + '</button></span>');
    if (st.sale) out.push('<span class="chip">On sale<button data-rmf="sale" aria-label="Remove sale filter">' + U.iconX() + '</button></span>');
    if (st.q) out.push('<span class="chip">“' + esc(st.q) + '”<button data-rmf="q" aria-label="Clear search term">' + U.iconX() + '</button></span>');
    if (out.length > 1) out.push('<button class="chip chip--clear" data-clearf>Clear all</button>');
    return out.length ? '<div class="chips">' + out.join('') + '</div>' : '';
  }

  function shop(ctx) {
    var st = parseQ(ctx.query);
    var coll = st.collection ? S.COLLECTIONS.filter(function (c) { return c.slug === st.collection; })[0] : null;
    var soon = st.gender === 'men' || st.gender === 'women';
    var title = soon ? (st.gender === 'men' ? 'Men' : 'Women') : (coll ? coll.title : (st.q ? 'Search: ' + st.q : 'All Denim'));

    var head = '<div class="wrap pagehead">' +
      crumbs([['Home', '/'], [title, '']]) +
      ((st.collection === 'kids-4-14' || !st.collection) && !soon ? '<p class="eyebrow" style="margin-bottom:6px">' + esc(S.LINE) + '</p>' : '') +
      '<h1 class="h-lg">' + esc(title) + '</h1>' +
      '<p>' + esc(soon ? 'Adult denim is in development. The kids block scales directly to men’s 28–38 and women’s 24–32.'
        : coll ? coll.tag : 'Kids denim 4–14Y. Filter by age, fit, wash and price.') + '</p>' +
      '</div>';

    var collRail = '<div class="wrap"><div class="collrail">' +
      '<a href="/shop" data-link class="' + (!st.collection ? 'is-active' : '') + '">All</a>' +
      S.COLLECTIONS.map(function (c) {
        return '<a href="/collections/' + c.slug + '" data-link class="' + (st.collection === c.slug ? 'is-active' : '') + '">' + esc(c.title) + '</a>';
      }).join('') + '</div></div>';

    if (soon) {
      return { title: title + ' — Coming soon | Rivet & Co.', desc: 'Adult denim from Rivet & Co. is coming soon.',
        html: head + collRail + '<div class="wrap">' +
          '<div class="soon" style="border-radius:10px;margin-bottom:40px">' +
            '<p class="eyebrow" style="color:var(--brass-lt)">Coming soon</p>' +
            '<h2 class="h-lg" style="margin-top:10px">' + esc(title) + '’s denim is being cut.</h2>' +
            '<p>Same pattern discipline, adult sizing. Kids 4–14 is live now.</p>' +
            '<div class="soon__row"><a href="/shop" data-link>Shop Kids 4–14</a></div>' +
          '</div></div>',
        mount: function () {} };
    }

    var html = head + collRail +
      '<div class="toolbar"><div class="toolbar__in">' +
        '<button class="filtbtn" data-openfilters>' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M6 12h12M10 18h4"/></svg>Filter' +
          (activeCount(st) ? '<b>' + activeCount(st) + '</b>' : '') + '</button>' +
        '<span class="toolbar__count" data-count>—</span>' +
        '<select class="sortsel" data-sort aria-label="Sort products">' +
          [['featured', 'Featured'], ['new', 'Newest'], ['best', 'Best selling'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']]
            .map(function (o) { return '<option value="' + o[0] + '"' + (st.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
        '</select>' +
      '</div></div>' +
      '<div class="wrap"><div class="shop__cols">' +
        '<aside class="shop__side" aria-label="Filters"><div data-sidefilters>' + filtersHTML(st) + '</div></aside>' +
        '<div><div data-chips>' + chipsHTML(st) + '</div><div data-results>' + U.skeletonGrid(8) + '</div></div>' +
      '</div></div>';

    return {
      title: title + ' | Rivet & Co.',
      desc: (coll ? coll.tag + '. ' : '') + 'Kids denim 4–14Y in PKR. Filter by age, fit, wash and price.',
      html: html,
      mount: function (main) { mountShop(main, st); }
    };
  }

  function mountShop(main, st) {
    var results = $('[data-results]', main);
    function push(replace) {
      var here = root.Router.path();
      var url = (st.collection ? '/collections/' + st.collection : '/shop') + toQuery(
        Object.assign({}, st, { collection: here.indexOf('/collections/') === 0 ? '' : st.collection }));
      /* keep collection in the path when we came in through one */
      if (here.indexOf('/collections/') === 0) {
        var s2 = Object.assign({}, st); s2.collection = '';
        url = '/collections/' + st.collection + toQuery(s2);
      }
      root.Router.replace(url);
    }
    function render(instant) {
      var run = function () {
        var list = St.query(st);
        $('[data-count]', main).textContent = list.length + (list.length === 1 ? ' product' : ' products');
        $('[data-chips]', main).innerHTML = chipsHTML(st);
        results.innerHTML = list.length ? grid(list)
          : U.emptyState(U.ICONS.search, 'Nothing matches those filters',
              'Try widening the age range or clearing the wash filter.', 'Clear filters',
              root.Router.path());
        var fb = $('.filtbtn', main);
        if (fb) fb.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M6 12h12M10 18h4"/></svg>Filter' +
          (activeCount(st) ? '<b>' + activeCount(st) + '</b>' : '');
        U.observeReveals(main);
      };
      if (instant) run();
      else { results.innerHTML = U.skeletonGrid(6); setTimeout(run, 220); }
    }
    render(true);

    function applyFilter(k, v) {
      if (k === 'instock' || k === 'sale') st[k] = !st[k];
      else {
        var i = st[k].indexOf(v);
        if (i > -1) st[k].splice(i, 1); else st[k].push(v);
      }
      push(); render();
      var side = $('[data-sidefilters]', main);
      if (side) side.innerHTML = filtersHTML(st);
      var sheetBox = $('#sheet [data-sheetfilters]');
      if (sheetBox) sheetBox.innerHTML = filtersHTML(st);
    }

    function wireFilterBox(box) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-f]');
        if (b && b.tagName === 'BUTTON') applyFilter(b.dataset.f, b.dataset.v);
      });
      box.addEventListener('change', function (e) {
        var c = e.target.closest('input[type=checkbox][data-f]');
        if (c) applyFilter(c.dataset.f);
      });
      box.addEventListener('input', function (e) {
        var r = e.target.closest('[data-range]');
        if (!r) return;
        var v = +r.value;
        var out = box.querySelector('[data-out]');
        if (out) out.textContent = v >= MAXP ? 'Any price' : 'Up to ' + pkr(v);
      });
      box.addEventListener('change', function (e) {
        var r = e.target.closest('[data-range]');
        if (!r) return;
        st.max = (+r.value >= MAXP) ? 0 : +r.value;
        push(); render();
      });
    }
    var side = $('[data-sidefilters]', main);
    if (side) wireFilterBox(side);

    main.addEventListener('click', function (e) {
      if (e.target.closest('[data-openfilters]')) {
        var el = U.sheet('Filter', '<div data-sheetfilters>' + filtersHTML(st) + '</div>',
          '<button class="btn btn--block" data-close>Show results</button>');
        wireFilterBox($('[data-sheetfilters]', el));
        return;
      }
      var rm = e.target.closest('[data-rmf]');
      if (rm) {
        var k = rm.dataset.rmf;
        if (k === 'max') st.max = 0;
        else if (k === 'instock' || k === 'sale') st[k] = false;
        else if (k === 'q') st.q = '';
        else st[k] = st[k].filter(function (x) { return x !== rm.dataset.v; });
        push(); render();
        if (side) side.innerHTML = filtersHTML(st);
        return;
      }
      if (e.target.closest('[data-clearf]')) {
        st.size = []; st.fit = []; st.wash = []; st.max = 0; st.instock = false; st.sale = false; st.q = '';
        push(); render();
        if (side) side.innerHTML = filtersHTML(st);
      }
    });
    main.addEventListener('change', function (e) {
      var s = e.target.closest('[data-sort]');
      if (s) { st.sort = s.value; push(); render(); }
    });
  }

  /* ============================ PRODUCT ============================ */
  function product(ctx) {
    var p = St.product(ctx.params.slug);
    if (!p || p.active === false) return notFound();
    var wash = ctx.query.color && (p.colors || []).some(function (c) { return c.key === ctx.query.color; }) ? ctx.query.color : p.wash;
    var imgs = St.images(p, wash);
    var out = St.totalStock(p) === 0, off = St.discountPct(p), price = St.priceOf(p);
    var also = St.query({ sort: 'best' }).filter(function (x) { return x.id !== p.id; });
    var look = also.filter(function (x) { return x.fit !== p.fit; }).slice(0, 4);

    var html = '<div class="wrap pdp">' +
      crumbs([['Home', '/'], ['Shop', '/shop'], [p.name, '']]) +
      '<div class="pdp__cols">' +
        '<div class="pdp__left">' +
          '<div class="gal">' +
            '<div class="gal__track" data-gal tabindex="0" aria-label="Product images">' +
              imgs.map(function (src, i) {
                return '<img src="' + src + '" alt="' + esc(p.name + ' — view ' + (i + 1)) + '" ' +
                  (i ? 'loading="lazy"' : 'fetchpriority="high"') + ' decoding="async" width="900" height="1125">';
              }).join('') +
            '</div>' +
            '<div class="gal__dots" data-dots aria-hidden="true">' + imgs.map(function (_, i) { return '<i class="' + (i ? '' : 'is-on') + '"></i>'; }).join('') + '</div>' +
            '<button class="card__wish gal__wish' + (St.wished(p.id) ? ' is-on' : '') + '" data-wish="' + esc(p.id) + '" aria-pressed="' + St.wished(p.id) + '" aria-label="Save to wishlist">' + U.iconHeart(St.wished(p.id)) + '</button>' +
          '</div>' +
          '<div class="gal__thumbs" data-thumbs>' + imgs.map(function (src, i) {
            return '<button class="' + (i ? '' : 'is-on') + '" data-th="' + i + '" aria-label="View image ' + (i + 1) + '"><img src="' + src + '" alt="" loading="lazy"></button>';
          }).join('') + '</div>' +
        '</div>' +

        '<div class="pdp__right"><div class="pdp__head">' +
          '<p class="pdp__meta">' + (p.line ? '<span class="linetag">' + esc(p.line) + '</span>' : '') +
            esc(U.fitLabel(p.fit)) + '<i></i>' + esc(U.washLabel(wash)) + '<i></i>' + esc(p.ageRange) + '</p>' +
          '<h1 class="h-md">' + esc(p.name) + '</h1>' +
          '<div class="pdp__price"><b>' + pkr(price) + '</b>' +
            (p.salePrice ? '<s>' + pkr(p.price) + '</s><span class="off">' + off + '% OFF</span>' : '') + '</div>' +
          '<p class="pdp__tax">Inclusive of all taxes · Free delivery over ' + pkr(St.content.freeShipOver) + '</p>' +
          '<p style="margin-top:14px;color:var(--char-2);font-size:14.5px">' + esc(p.description) + '</p>' +

          ((p.colors || []).length > 1 ? '<div class="block"><div class="block__lbl"><h3>Colour</h3><span data-colorname>' + esc(U.washLabel(wash)) + '</span></div>' +
            '<div class="swatches">' + p.colors.map(function (c) {
              return '<button class="swatch' + (c.key === wash ? ' is-on' : '') + '" data-color="' + esc(c.key) + '" aria-label="' + esc(c.name) + '" aria-pressed="' + (c.key === wash) + '"><i style="background:' + c.hex + '"></i></button>';
            }).join('') + '</div></div>' : '') +

          '<div class="block"><div class="block__lbl"><h3>Size · Age</h3>' +
            '<button data-sizeguide="' + esc(p.slug) + '">Size guide</button></div>' +
            '<div class="sizes" role="radiogroup" aria-label="Select size">' + S.KID_SIZES.map(function (s) {
              var stk = +p.stock[s] || 0;
              return '<button class="sizeopt' + (stk === 0 ? ' is-out' : stk <= 3 ? ' is-low' : '') + '" role="radio" aria-checked="false"' +
                (stk === 0 ? ' aria-disabled="true" tabindex="-1"' : '') + ' data-size="' + s + '">' + s + '</button>';
            }).join('') + '</div>' +
            '<p class="small dim" style="margin-top:9px" data-stockmsg>' + (out ? 'Sold out in every size — back soon.' : 'Select a size. True to age; between sizes, take the larger.') + '</p>' +
          '</div>' +

          '<div class="pdp__actions">' +
            '<button class="btn" data-add' + (out ? ' disabled' : '') + '>' + (out ? 'Sold out' : 'Add to cart') + '</button>' +
            '<button class="iconsq' + (St.wished(p.id) ? ' is-on' : '') + '" data-wish="' + esc(p.id) + '" aria-pressed="' + St.wished(p.id) + '" aria-label="Save to wishlist">' + U.iconHeart(St.wished(p.id)) + '</button>' +
            '<button class="iconsq" data-share aria-label="Share this product">' +
              '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '</div>' +
          (out ? '<a class="btn btn--ghost btn--block" style="margin-top:10px" href="https://wa.me/' + esc(St.content.whatsapp) + '?text=' + encodeURIComponent('Notify me when ' + p.name + ' is back') + '" target="_blank" rel="noopener">Notify me on WhatsApp</a>' : '') +

          '<div class="acc">' +
            '<details open><summary>Fabric &amp; care</summary><div class="acc__body"><dl>' +
              '<dt>Fabric</dt><dd>' + esc(p.fabric) + '</dd>' +
              '<dt>Fit</dt><dd>' + esc(U.fitLabel(p.fit)) + ' leg, mid rise</dd>' +
              '<dt>Wash</dt><dd>' + esc(U.washLabel(wash)) + '</dd>' +
              '<dt>Care</dt><dd>' + esc(p.care) + '</dd></dl></div></details>' +
            '<details><summary>Delivery &amp; returns</summary><div class="acc__body"><ul>' +
              '<li>Dispatched in 1–2 working days from Karachi.</li>' +
              '<li>Delivery 2–4 days nationwide. Flat ' + pkr(St.content.flatShipping) + ', free over ' + pkr(St.content.freeShipOver) + '.</li>' +
              '<li>Cash on delivery available across Pakistan.</li>' +
              '<li>7-day size exchange, unworn with tags attached.</li></ul></div></details>' +
            '<details><summary>Fit notes</summary><div class="acc__body">Sized by age and matched to height and waist. The waist adjusts internally from 5Y up. If your child is between two ages, take the larger — the tab takes up the slack now and the length lasts longer.</div></details>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

      '<section class="sec rv"><div class="sec__head"><h2 class="h-md">Complete the look</h2><a href="/shop" data-link>All denim</a></div>' +
        '<div class="rail rail--cards">' + look.map(function (x) { return U.card(x, { nosizes: true }); }).join('') + '</div></section>' +
    '</div>' +

    '<div class="stickybuy" data-sticky>' +
      '<div class="stickybuy__i"><img src="' + imgs[0] + '" alt=""><div>' +
      '<div class="nm">' + esc(p.name) + '</div><div class="pr">' + pkr(price) + '</div></div></div>' +
      '<button class="btn" data-add' + (out ? ' disabled' : '') + '>' + (out ? 'Sold out' : 'Add to cart') + '</button>' +
    '</div>';

    var ld = {
      '@context': 'https://schema.org', '@type': 'Product',
      name: p.name, image: St.images(p, wash).map(function (src) { return root.Router.abs('/') + src; }),
      description: p.description, sku: p.id, brand: { '@type': 'Brand', name: 'Rivet & Co.' },
      color: U.washLabel(wash), material: p.fabric, audience: { '@type': 'PeopleAudience', suggestedMinAge: 4, suggestedMaxAge: 14 },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
      offers: {
        '@type': 'Offer', url: root.Router.abs('/product/' + p.slug),
        priceCurrency: 'PKR', price: price,
        availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'Rivet & Co.' }
      }
    };

    return {
      title: (p.seoTitle || (p.name + ' — ' + U.fitLabel(p.fit) + ' Kids Denim 4–14Y')) + ' | Rivet & Co.',
      desc: p.seoDesc || (p.description + ' ' + pkr(price) + '. Sizes 4Y–14Y.'),
      ld: ld,
      html: html,
      mount: function (main) { mountPDP(main, p, wash); }
    };
  }

  function mountPDP(main, p, wash) {
    var chosen = null;
    var track = $('[data-gal]', main), dots = $$('[data-dots] i', main), thumbs = $$('[data-th]', main);
    if (track) {
      track.addEventListener('scroll', function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
        thumbs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); });
      }, { passive: true });
    }
    main.addEventListener('click', function (e) {
      var th = e.target.closest('[data-th]');
      if (th && track) { track.scrollTo({ left: track.clientWidth * (+th.dataset.th), behavior: 'smooth' }); return; }

      var sz = e.target.closest('[data-size]');
      if (sz) {
        $$('.sizeopt', main).forEach(function (n) { n.classList.remove('is-on'); n.setAttribute('aria-checked', 'false'); });
        sz.classList.add('is-on'); sz.setAttribute('aria-checked', 'true'); chosen = sz.dataset.size;
        var left = +p.stock[chosen] || 0;
        $('[data-stockmsg]', main).textContent = left <= 3 ? 'Only ' + left + ' left in ' + chosen + '.' : 'In stock in ' + chosen + ' · ships in 1–2 days.';
        return;
      }
      var col = e.target.closest('[data-color]');
      if (col) { root.Router.go('/product/' + p.slug + '?color=' + col.dataset.color); return; }

      if (e.target.closest('[data-add]')) {
        if (!chosen) {
          U.toast('Choose a size first', 'err');
          var box = $('.sizes', main);
          if (box) { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); box.animate ? box.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
            { duration: 260 }) : null; }
          return;
        }
        var r = St.addToCart(p, chosen, wash, 1);
        if (r.ok) { U.toast('Added <b>' + esc(p.name) + '</b> · ' + chosen); U.openCart(); }
        else U.toast(r.msg, 'err');
        return;
      }
      if (e.target.closest('[data-share]')) {
        var url = location.href;
        if (navigator.share) navigator.share({ title: p.name, text: p.description, url: url }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { U.toast('Link copied'); });
        else U.toast(url);
      }
    });

    var sticky = $('[data-sticky]', main);
    var addBtn = $('.pdp__actions [data-add]', main);
    if (sticky && addBtn && 'IntersectionObserver' in root) {
      new IntersectionObserver(function (es) {
        sticky.classList.toggle('is-on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0);
      }, { threshold: 0 }).observe(addBtn);
    }
    U.observeReveals(main);
  }

  /* ============================ CART PAGE ============================ */
  function cartPage() {
    var t = St.totals(U.currentCoupon());
    var lines = St.db.cart;
    var body = lines.length
      ? '<div class="shop__cols" style="grid-template-columns:minmax(0,1fr) 340px">' +
          '<div>' + lines.map(function (l) {
            var p = St.productById(l.id);
            return '<div class="line" data-key="' + esc(l.key) + '">' +
              '<a href="/product/' + esc(l.slug) + '" data-link><img src="' + (p ? St.thumb(p, 0, l.color) : '') + '" alt="" loading="lazy"></a>' +
              '<div><a href="/product/' + esc(l.slug) + '" data-link><p class="line__nm">' + esc(l.name) + '</p></a>' +
              '<p class="line__va">' + esc(l.size) + ' · ' + esc(U.washLabel(l.color)) + '</p>' +
              '<div class="line__bot"><div class="qty"><button data-qty="-1" aria-label="Decrease">−</button><span>' + l.qty + '</span><button data-qty="1" aria-label="Increase">+</button></div>' +
              '<span class="line__pr">' + pkr(l.price * l.qty) + '</span></div>' +
              '<button class="line__rm" data-rm style="margin-top:8px">Remove</button></div></div>';
          }).join('') + '</div>' +
          '<aside class="panel" style="align-self:start"><h3>Summary</h3>' +
            '<div class="sums"><div><span>Subtotal</span><span>' + pkr(t.sub) + '</span></div>' +
            (t.discount ? '<div class="disc"><span>Discount</span><span>−' + pkr(t.discount) + '</span></div>' : '') +
            '<div><span>Delivery</span><span>' + (t.shipping ? pkr(t.shipping) : 'Free') + '</span></div>' +
            '<div class="tot"><span>Total</span><span>' + pkr(t.total) + '</span></div></div>' +
            '<a class="btn btn--block" href="/checkout" data-link>Checkout</a>' +
            '<a class="btn btn--ghost btn--block" style="margin-top:9px" href="/shop" data-link>Keep shopping</a></aside>' +
        '</div>'
      : U.emptyState(U.ICONS.bag, 'Your cart is empty', 'Nothing here yet. Start with the fits that keep selling out.', 'Shop best sellers', '/collections/best-sellers');

    return {
      title: 'Cart | Rivet & Co.', desc: 'Your Rivet & Co. cart.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Cart', '']]) + '<h1 class="h-lg">Cart</h1></div><div class="wrap" style="padding-bottom:50px">' + body + '</div>',
      mount: function (main) {
        main.addEventListener('click', function (e) {
          var line = e.target.closest('.line'), key = line && line.dataset.key;
          var q = e.target.closest('[data-qty]');
          if (q && key) {
            var l = St.db.cart.filter(function (x) { return x.key === key; })[0];
            if (l) St.setQty(key, l.qty + (+q.dataset.qty));
            root.Router.refresh(); return;
          }
          if (e.target.closest('[data-rm]') && key) { St.removeLine(key); U.toast('Removed from cart'); root.Router.refresh(); }
        });
      }
    };
  }

  /* ============================ WISHLIST ============================ */
  function wishlist() {
    var list = St.db.wish.map(function (id) { return St.productById(id); }).filter(Boolean);
    return {
      title: 'Wishlist | Rivet & Co.', desc: 'Denim you saved at Rivet & Co.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Wishlist', '']]) +
        '<h1 class="h-lg">Wishlist</h1><p>' + (list.length ? list.length + ' saved' : 'Saved on this device') + '</p></div>' +
        '<div class="wrap" style="padding-bottom:50px">' +
        (list.length ? grid(list) : U.emptyState(U.ICONS.heart, 'Nothing saved yet',
          'Tap the heart on any pair to keep it here for later.', 'Browse denim', '/shop')) + '</div>',
      mount: function (main) { U.observeReveals(main); }
    };
  }

  /* ============================ CHECKOUT ============================ */
  function checkout() {
    var t = St.totals(U.currentCoupon());
    if (!St.db.cart.length) {
      return { title: 'Checkout | Rivet & Co.', desc: 'Checkout',
        html: '<div class="wrap" style="padding-block:40px">' + U.emptyState(U.ICONS.bag, 'Nothing to check out',
          'Your cart is empty.', 'Shop denim', '/shop') + '</div>', mount: function () {} };
    }
    var me = St.db.me || {};
    return {
      title: 'Checkout | Rivet & Co.', desc: 'Secure checkout — cash on delivery available.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Cart', '/cart'], ['Checkout', '']]) +
        '<h1 class="h-lg">Checkout</h1></div>' +
        '<div class="wrap" style="padding-bottom:60px"><div class="steps"><div class="is-on">Details</div><div class="is-on">Delivery</div><div>Done</div></div>' +
        '<div class="shop__cols" style="grid-template-columns:minmax(0,1fr) 340px">' +
        '<form class="panel" data-checkout novalidate>' +
          '<h3>Delivery details</h3>' +
          '<label class="field"><span>Full name</span><input name="name" required autocomplete="name" value="' + esc(me.name || '') + '"><small hidden>Enter your name</small></label>' +
          '<div class="field-row">' +
            '<label class="field"><span>Phone</span><input name="phone" type="tel" required inputmode="tel" autocomplete="tel" placeholder="03XX XXXXXXX" value="' + esc(me.phone || '') + '"><small hidden>Enter a valid phone</small></label>' +
            '<label class="field"><span>City</span><input name="city" required autocomplete="address-level2" value="' + esc(me.city || '') + '"><small hidden>Enter your city</small></label>' +
          '</div>' +
          '<label class="field"><span>Address</span><textarea name="address" required autocomplete="street-address" placeholder="House, street, area">' + esc(me.address || '') + '</textarea><small hidden>Enter your address</small></label>' +
          '<label class="field"><span>Email (optional)</span><input name="email" type="email" autocomplete="email" value="' + esc(me.email || '') + '"></label>' +
          '<label class="field"><span>Order note (optional)</span><input name="note" placeholder="Landmark, delivery timing…"></label>' +
          '<h3 style="margin-top:24px">Payment</h3>' +
          '<label class="check"><input type="radio" name="payment" value="COD" checked> Cash on delivery</label>' +
          '<label class="check"><input type="radio" name="payment" value="Bank"> Bank transfer (details sent on WhatsApp)</label>' +
          '<button class="btn btn--block" style="margin-top:20px" type="submit">Place order · ' + pkr(t.total) + '</button>' +
          '<p class="small dim" style="text-align:center;margin-top:10px">You will get a WhatsApp confirmation within an hour.</p>' +
        '</form>' +
        '<aside class="panel" style="align-self:start"><h3>' + St.cartCount() + ' item' + (St.cartCount() > 1 ? 's' : '') + '</h3>' +
          St.db.cart.map(function (l) {
            var p = St.productById(l.id);
            return '<div class="orow"><span style="display:flex;gap:10px;align-items:center">' +
              '<img src="' + (p ? St.thumb(p, 0, l.color) : '') + '" alt="" width="40" height="50" style="width:40px;height:50px;object-fit:cover;border-radius:4px" loading="lazy">' +
              '<span><b style="display:block;font-size:13px">' + esc(l.name) + '</b><span class="small dim">' + esc(l.size) + ' × ' + l.qty + '</span></span></span>' +
              '<span>' + pkr(l.price * l.qty) + '</span></div>';
          }).join('') +
          '<div class="sums" style="margin-top:14px"><div><span>Subtotal</span><span>' + pkr(t.sub) + '</span></div>' +
          (t.discount ? '<div class="disc"><span>Discount</span><span>−' + pkr(t.discount) + '</span></div>' : '') +
          '<div><span>Delivery</span><span>' + (t.shipping ? pkr(t.shipping) : 'Free') + '</span></div>' +
          '<div class="tot"><span>Total</span><span>' + pkr(t.total) + '</span></div></div></aside>' +
        '</div></div>',
      mount: function (main) {
        var form = $('[data-checkout]', main);
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var data = {}, ok = true;
          ['name', 'phone', 'city', 'address'].forEach(function (k) {
            var f = form[k], v = f.value.trim(), bad = !v || (k === 'phone' && v.replace(/\D/g, '').length < 10);
            f.closest('.field').classList.toggle('is-err', bad);
            var s = f.closest('.field').querySelector('small'); if (s) s.hidden = !bad;
            if (bad) ok = false; else data[k] = v;
          });
          data.email = form.email.value.trim();
          data.note = form.note.value.trim();
          data.payment = form.payment.value;
          if (!ok) { U.toast('Check the highlighted fields', 'err'); form.querySelector('.is-err input,.is-err textarea').focus(); return; }
          var btn = form.querySelector('button[type=submit]');
          btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Placing order…';
          setTimeout(function () {
            var r = St.placeOrder(data, U.currentCoupon());
            if (!r.ok) { btn.disabled = false; btn.textContent = 'Place order'; U.toast(r.msg, 'err'); return; }
            U.setCoupon('');
            root.Router.go('/order/' + r.order.id);
          }, 650);
        });
      }
    };
  }

  function orderConfirmed(ctx) {
    var o = St.db.orders.filter(function (x) { return x.id === ctx.params.id; })[0];
    if (!o) return notFound();
    return {
      title: 'Order ' + o.id + ' confirmed | Rivet & Co.', desc: 'Your order is confirmed.',
      html: '<div class="wrap" style="padding-block:44px 60px;max-width:640px">' +
        '<div style="text-align:center">' +
          '<div class="okcheck"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12.5 4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<h1 class="h-lg">Order placed.</h1>' +
          '<p class="dim" style="margin-top:10px">' + esc(o.id) + ' · we will confirm on WhatsApp within the hour.</p>' +
        '</div>' +
        '<div class="panel" style="margin-top:26px"><h3>What you ordered</h3>' +
          o.items.map(function (i) {
            return '<div class="orow"><span>' + esc(i.name) + ' · ' + esc(i.size) + ' × ' + i.qty + '</span><span>' + pkr(i.price * i.qty) + '</span></div>';
          }).join('') +
          '<div class="sums" style="margin-top:12px">' +
          '<div><span>Subtotal</span><span>' + pkr(o.subtotal) + '</span></div>' +
          (o.discount ? '<div class="disc"><span>Discount</span><span>−' + pkr(o.discount) + '</span></div>' : '') +
          '<div><span>Delivery</span><span>' + (o.shipping ? pkr(o.shipping) : 'Free') + '</span></div>' +
          '<div class="tot"><span>Total (' + esc(o.payment) + ')</span><span>' + pkr(o.total) + '</span></div></div></div>' +
        '<div class="panel"><h3>Delivering to</h3><p class="small">' + esc(o.customer) + '<br>' + esc(o.address) + '<br>' + esc(o.phone) + '</p></div>' +
        '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">' +
          '<a class="btn" style="flex:1" href="/shop" data-link>Keep shopping</a>' +
          '<a class="btn btn--ghost" style="flex:1" href="/account" data-link>My orders</a></div>' +
      '</div>',
      mount: function () {}
    };
  }

  /* ============================ ACCOUNT ============================ */
  function account() {
    var me = St.db.me, orders = St.myOrders();
    var body;
    if (!me) {
      body = U.emptyState(U.ICONS.box, 'No orders on this device',
        'Place an order and it will show up here with its status. No password needed.', 'Shop denim', '/shop');
    } else {
      body = '<div class="panel"><h3>Details</h3>' +
        '<div class="orow"><span class="dim">Name</span><span>' + esc(me.name) + '</span></div>' +
        '<div class="orow"><span class="dim">Phone</span><span>' + esc(me.phone) + '</span></div>' +
        '<div class="orow"><span class="dim">City</span><span>' + esc(me.city) + '</span></div>' +
        (me.email ? '<div class="orow"><span class="dim">Email</span><span>' + esc(me.email) + '</span></div>' : '') +
        '</div>' +
        '<div class="panel"><h3>Orders (' + orders.length + ')</h3>' +
        (orders.length ? orders.map(function (o) {
          return '<div class="orow"><span><b>' + esc(o.id) + '</b><br><span class="small dim">' +
            new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) +
            ' · ' + o.items.length + ' item' + (o.items.length > 1 ? 's' : '') + '</span></span>' +
            '<span style="text-align:right"><span class="pill pill--' + esc(o.status) + '">' + esc(o.status) + '</span><br><b style="font-size:13px">' + pkr(o.total) + '</b></span></div>';
        }).join('') : '<p class="small dim">No orders yet.</p>') + '</div>' +
        '<div class="panel"><h3>Saved</h3><p class="small dim">' + St.db.wish.length + ' item' + (St.db.wish.length === 1 ? '' : 's') + ' in your wishlist.</p>' +
        '<a class="btn btn--ghost btn--sm" style="margin-top:12px" href="/wishlist" data-link>Open wishlist</a></div>';
    }
    return {
      title: 'Account | Rivet & Co.', desc: 'Your Rivet & Co. orders and saved denim.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Account', '']]) +
        '<h1 class="h-lg">Account</h1><p>Orders are stored on this device. Nothing to sign into.</p></div>' +
        '<div class="wrap" style="padding-bottom:60px;max-width:720px">' + body + '</div>',
      mount: function () {}
    };
  }

  /* ============================ STATIC ============================ */
  function sizeGuidePage() {
    return {
      title: 'Size guide — Kids 4–14Y | Rivet & Co.',
      desc: 'Rivet & Co. kids denim size guide: age, height, waist and inseam in centimetres.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Size guide', '']]) +
        '<h1 class="h-lg">Size guide</h1><p>Measured flat, in centimetres. Match the waist first, then check height.</p></div>' +
        '<div class="wrap" style="padding-bottom:60px;max-width:760px">' +
        '<div class="panel"><div style="overflow-x:auto"><table class="sgtable"><thead><tr><th>Size</th><th>Age</th><th>Height</th><th>Waist</th><th>Inseam</th></tr></thead><tbody>' +
        S.SIZE_GUIDE.map(function (r) { return '<tr><td>' + r.size + '</td><td>' + r.age + '</td><td>' + r.height + '</td><td>' + r.waist + '</td><td>' + r.inseam + '</td></tr>'; }).join('') +
        '</tbody></table></div></div>' +
        '<div class="acc"><details open><summary>Between two sizes?</summary><div class="acc__body">Take the larger. Every pair from 5Y up has an internal adjustable waist tab.</div></details>' +
        '<details><summary>How to measure</summary><div class="acc__body"><ul><li>Waist: measure around the natural waist, over a t-shirt.</li>' +
        '<li>Inseam: from crotch seam to hem on a pair that already fits.</li><li>Height: barefoot against a wall.</li></ul></div></details>' +
        '<details><summary>Men’s and women’s sizing</summary><div class="acc__body">Adult fits are in development — men’s 28–38 and women’s 24–32.</div></details></div>' +
        '</div>',
      mount: function () {}
    };
  }
  function shippingPage() {
    return {
      title: 'Delivery & returns | Rivet & Co.',
      desc: 'Delivery across Pakistan, cash on delivery, and 7-day exchanges.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Delivery & returns', '']]) +
        '<h1 class="h-lg">Delivery &amp; returns</h1></div><div class="wrap" style="padding-bottom:60px;max-width:720px">' +
        '<div class="acc" style="border-top:0">' +
        '<details open><summary>Delivery</summary><div class="acc__body"><ul>' +
        '<li>Dispatched in 1–2 working days from Karachi.</li><li>2–4 days nationwide.</li>' +
        '<li>Flat ' + pkr(St.content.flatShipping) + '. Free over ' + pkr(St.content.freeShipOver) + '.</li></ul></div></details>' +
        '<details><summary>Payment</summary><div class="acc__body">Cash on delivery nationwide, or bank transfer — details are sent on WhatsApp after you order.</div></details>' +
        '<details><summary>Exchanges</summary><div class="acc__body">7 days for a size exchange, unworn with tags. Message us on WhatsApp and we arrange the pickup.</div></details>' +
        '<details><summary>Returns</summary><div class="acc__body">Faulty or incorrect items are replaced or refunded in full. Tell us within 7 days of delivery.</div></details>' +
        '</div><a class="btn btn--brass" style="margin-top:22px" href="https://wa.me/' + esc(St.content.whatsapp) + '" target="_blank" rel="noopener">Ask on WhatsApp</a></div>',
      mount: function () {}
    };
  }
  function about() {
    return {
      title: 'Our denim | Rivet & Co.',
      desc: 'How Rivet & Co. makes kids denim in Pakistan — fabric, fit and finishing.',
      html: '<section class="hero" style="min-height:auto"><div class="hero__media">' +
        img({ shot: 'detail', wash: 'raw-indigo', seed: 21 }, '', '', 1600, 900) + '</div>' +
        '<div class="wrap"><div class="hero__in" style="min-height:52svh">' +
        '<p class="eyebrow hero__eyebrow"><i></i>Since 2026 · Karachi</p>' +
        '<h1 class="h-lg" style="color:#fff">Everyday jeans, <em class="serif">better made.</em></h1>' +
        '<p class="hero__sub">One block, revised four times, tested on kids who do not go easy on clothes.</p>' +
        '</div></div></section>' +
        '<div class="wrap sec" style="max-width:720px">' +
        '<p class="serif" style="font-size:clamp(20px,5vw,30px);line-height:1.25">We started with kids denim because it is the hardest thing to get right. If a pair survives 4–14, it will survive anything.</p>' +
        '<ul class="specs" style="margin-top:30px">' +
        '<li><b>01</b><p><strong>Fabric</strong>10.5–12.5 oz cotton denim woven in Pakistan, with a small amount of elastane where the fit needs recovery.</p></li>' +
        '<li><b>02</b><p><strong>Construction</strong>Reinforced knee panels, bar-tacked stress points and copper thread at every corner that normally fails.</p></li>' +
        '<li><b>03</b><p><strong>Finishing</strong>Washes done in small lots. Acid wash is hand-finished, so no two pairs match exactly.</p></li>' +
        '<li><b>04</b><p><strong>Next</strong>Men’s 28–38 and women’s 24–32, on the same block, next season.</p></li>' +
        '</ul><a class="btn" style="margin-top:26px" href="/shop" data-link>Shop the denim</a></div>',
      mount: function () {}
    };
  }
  function notFound() {
    return {
      title: 'Page not found | Rivet & Co.', desc: 'That page does not exist.', status: 404,
      html: '<div class="wrap" style="padding-block:60px">' +
        U.emptyState(U.ICONS.alert, 'That page does not exist', 'The link may be old, or the product may have been retired.', 'Back to shop', '/shop') + '</div>',
      mount: function () {}
    };
  }

  root.Pages = {
    home: home, shop: shop, product: product, cart: cartPage, wishlist: wishlist,
    checkout: checkout, orderConfirmed: orderConfirmed, account: account,
    sizeGuide: sizeGuidePage, shipping: shippingPage, about: about, notFound: notFound
  };
})(window, document);
