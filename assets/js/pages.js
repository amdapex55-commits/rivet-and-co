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
  var WASH_SHOTS = {
    'ice-wash':     'assets/img/products/ice-scrape-skinny-jean-1.jpg',
    'dark-indigo':  'assets/img/products/classic-indigo-slim-jean-1.jpg',
    'washed-black': 'assets/img/products/black-fade-slim-jean-1.jpg',
    'slate-acid':   'assets/img/products/slate-acid-skinny-jean-1.jpg',
    'mid-blue':     'assets/img/products/storm-rip-skinny-jean-1.jpg',
    'deep-acid':    'assets/img/products/deep-acid-straight-jean-1.jpg',
    'charcoal':     'assets/img/products/charcoal-utility-straight-pant-1.jpg'
  };

  function seam(id) {
    return '<div class="seam rv" data-seam aria-hidden="true">' +
      '<svg viewBox="0 0 1200 16" preserveAspectRatio="none">' +
        '<path d="M0 8 H1200" fill="none" stroke="var(--line)" stroke-width="1"/>' +
        '<path class="seam__st" d="M0 5 H1200" fill="none" stroke="#C98A4B" stroke-width="2.2" stroke-dasharray="13 10" stroke-linecap="round"/>' +
        '<path class="seam__st seam__st--2" d="M0 11 H1200" fill="none" stroke="#C98A4B" stroke-width="2.2" stroke-dasharray="13 10" stroke-linecap="round" opacity=".55"/>' +
      '</svg></div>';
  }

  function home() {
    var c = St.content;
    var all = St.query({ sort: 'featured' });
    var best = St.query({ collection: 'best-sellers', sort: 'best' });
    var heroFront = St.product('ice-scrape-skinny-jean') || all[0];
    var heroBack = St.product('classic-indigo-slim-jean') || all[1] || all[0];

    var fitKeys = ['skinny', 'slim', 'straight', 'jogger'];
    var washOrder = ['ice-wash', 'dark-indigo', 'washed-black', 'slate-acid', 'mid-blue', 'deep-acid', 'charcoal'];
    function washChip(k) {
      return '<a class="washchip" href="/shop?wash=' + k + '" data-link>' +
        '<img src="' + WASH_SHOTS[k] + '" alt="' + esc(F.washName(k)) + ' kids denim" loading="lazy" decoding="async" width="800" height="1200">' +
        '<span><i style="background:' + F.washColor(k) + '"></i>' + esc(F.washName(k)) + '</span></a>';
    }
    var washTrack = washOrder.map(washChip).join('');

    /* lookbook: the detail frames, not another product grid */
    var look = all.slice(0, 6).map(function (p, i) {
      var imgs = St.images(p);
      return '<a class="lb__tile' + (i === 0 ? ' lb__tile--wide' : '') + '" href="/product/' + esc(p.slug) + '" data-link>' +
        '<img src="' + imgs[i % 2 === 0 ? 1 : 2] + '" alt="' + esc(p.name) + ' detail" loading="lazy" decoding="async" width="800" height="1200">' +
        '<span>' + esc(p.name) + '</span></a>';
    }).join('');

    var html =
    /* ---------- hero: mood, one CTA ---------- */
    '<section class="hero">' +
      '<div class="hero__media" data-par="0.28">' + img({ shot: 'texture', wash: c.heroWash, seed: 11, seam: false }, '', '', 1600, 1000) + '</div>' +
      '<div class="hero__seam" data-par="0.62" aria-hidden="true">' +
        '<svg viewBox="0 0 400 900" preserveAspectRatio="none">' +
          '<path class="hero__stitch" d="M292 -40 L120 940" stroke="rgba(216,166,110,.55)" stroke-width="2.5" stroke-dasharray="14 11" fill="none"/>' +
          '<path class="hero__stitch hero__stitch--2" d="M316 -40 L144 940" stroke="rgba(216,166,110,.55)" stroke-width="2.5" stroke-dasharray="14 11" fill="none"/>' +
          '<path d="M304 -40 L132 940" stroke="rgba(255,255,255,.07)" stroke-width="26" fill="none"/>' +
        '</svg>' +
      '</div>' +
      '<div class="wrap"><div class="hero__in">' +
        '<div class="hero__copy">' +
          '<p class="eyebrow hero__eyebrow"><i></i>' + esc(c.heroEyebrow) + '</p>' +
          '<h1 class="h-xl">' + c.heroTitle + '</h1>' +
          '<p class="hero__sub">' + esc(c.heroSub) + '</p>' +
          '<div class="hero__cta">' +
            '<a class="btn btn--light" href="/shop" data-link>Shop the first drop</a>' +
          '</div>' +
          '<a class="herolink" href="/fit-finder" data-link>Not sure of the size? Try the fit finder →</a>' +
          '<div class="hero__meta">' +
            '<div>Sizes<b>4Y – 14Y</b></div>' +
            '<div>Fabric<b>10.5–13 oz</b></div>' +
            '<div>Delivery<b>Nationwide COD</b></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero__stage" data-par="-0.1">' +
          '<a class="hero__shot hero__shot--back" href="/product/' + esc(heroBack.slug) + '" data-link aria-label="' + esc(heroBack.name) + '">' +
            '<img src="' + St.thumb(heroBack, 0) + '" alt="' + esc(heroBack.name) + '" fetchpriority="high" decoding="async" width="800" height="1200"></a>' +
          '<a class="hero__shot hero__shot--front" href="/product/' + esc(heroFront.slug) + '" data-link aria-label="' + esc(heroFront.name) + '">' +
            '<img src="' + St.thumb(heroFront, 0) + '" alt="' + esc(heroFront.name) + '" fetchpriority="high" decoding="async" width="800" height="1200">' +
            '<span class="hero__tag">' + esc(heroFront.name) + ' · ' + pkr(St.priceOf(heroFront)) + '</span></a>' +
        '</div>' +
      '</div></div>' +
    '</section>' +

    seam() +

    /* ---------- choose the fit (interactive) ---------- */
    '<section class="sec sec--tight rv" data-fitpick><div class="wrap">' +
      '<div class="sec__head"><div><p class="eyebrow">Start here</p><h2 class="h-lg" style="margin-top:6px">Choose the fit</h2></div>' +
      '<a href="/fit-finder" data-link>Fit finder</a></div>' +
      '<div class="fittabs" role="tablist">' + fitKeys.map(function (k, i) {
        return '<button role="tab" class="fittab' + (i ? '' : ' is-on') + '" data-fit="' + k + '" aria-selected="' + (i === 0) + '">' + esc(U.fitLabel(k)) + '</button>';
      }).join('') + '</div>' +
      '<p class="fitline" data-fitline>' + esc((S.FIT_NOTES[fitKeys[0]] || {}).line || '') + '</p>' +
      '<div class="rail rail--cards" data-fitrail></div>' +
    '</div></section>' +

    /* ---------- bundle ---------- */
    (c.bundleActive ?
    '<section class="bundle"><div class="wrap"><div class="bundle__in">' +
      '<div class="bundle__copy">' +
        '<p class="eyebrow" style="color:var(--brass-lt)">Launch offer</p>' +
        '<h2 class="h-lg">' + esc(c.bundleTitle) + '</h2>' +
        '<p>' + esc(c.bundleBody) + '</p>' +
        '<div class="bundle__cta">' +
          '<a class="btn btn--brass" href="/shop" data-link>Shop the bundle</a>' +
          '<span class="bundle__note">Applies itself in the cart · mix any two styles</span>' +
        '</div>' +
      '</div>' +
      '<div class="bundle__pics">' +
        '<img src="assets/img/products/classic-indigo-slim-jean-1.jpg" alt="" loading="lazy" decoding="async" width="800" height="1200">' +
        '<img src="assets/img/products/shadow-denim-jogger-1.jpg" alt="" loading="lazy" decoding="async" width="800" height="1200">' +
        '<span class="bundle__plus">+</span>' +
      '</div>' +
    '</div></div></section>' : '') +

    /* ---------- built for movement: the make, in three details ---------- */
    '<section class="story rv"><div class="wrap">' +
      '<p class="eyebrow">The make</p>' +
      '<h2 class="h-lg" style="margin:8px 0 10px">' + esc(c.editorialTitle) + '</h2>' +
      '<p class="story__lead">' + esc(c.editorialBody) + '</p>' +
      '<div class="story__row">' +
        '<figure><img src="assets/img/products/storm-rip-skinny-jean-2.jpg" alt="Taped knee rip and inseam stitching" loading="lazy" decoding="async" width="800" height="1200">' +
          '<figcaption><b>Knees</b>A second denim panel bonded inside, where kids jeans die first.</figcaption></figure>' +
        '<figure><img src="assets/img/products/classic-indigo-slim-jean-1.jpg" alt="Waistband, belt loops and bar tacks" loading="lazy" decoding="async" width="800" height="1200">' +
          '<figcaption><b>Waist</b>Internal elastic tab from 5Y up, so one size lasts two growth spurts.</figcaption></figure>' +
        '<figure><img src="assets/img/products/shadow-denim-jogger-3.jpg" alt="Back pockets and stitching" loading="lazy" decoding="async" width="800" height="1200">' +
          '<figcaption><b>Stitching</b>Pocket corners, fly and loops bar-tacked in copper thread.</figcaption></figure>' +
      '</div>' +
      '<a class="btn btn--ghost" style="margin-top:22px" href="/about" data-link>How it is made</a>' +
    '</div></section>' +

    '<section class="quote rv"><p class="serif">' + c.quote + '</p></section>' +

    /* ---------- the first drop ---------- */
    '<section class="drop rv">' +
      '<div class="wrap"><div class="sec__head"><div><p class="eyebrow" style="color:var(--brass-lt)">The first drop</p>' +
      '<h2 class="h-lg" style="margin-top:6px;color:#fff">' + all.length + ' pieces, one block</h2></div>' +
      '<a href="/shop" data-link style="color:var(--blue-300)">See all</a></div></div>' +
      '<div class="wrap"><div class="rail rail--cards">' +
        all.map(function (p) { return U.card(p, { nosizes: true }); }).join('') +
      '</div></div>' +
    '</section>' +

    /* ---------- moving wash selector ---------- */
    '<section class="sec sec--tight rv">' +
      '<div class="wrap"><div class="sec__head"><div><p class="eyebrow">Seven finishes</p>' +
      '<h2 class="h-md" style="margin-top:6px">Shop by wash</h2></div><a href="/shop" data-link>All washes</a></div></div>' +
      '<div class="washrail" role="list"><div class="washrail__track">' + washTrack + washTrack + '</div></div>' +
    '</section>' +

    /* ---------- lookbook ---------- */
    '<section class="sec sec--tight rv"><div class="wrap">' +
      '<div class="sec__head"><div><p class="eyebrow">Up close</p><h2 class="h-md" style="margin-top:6px">The details</h2></div>' +
      '<a href="/shop" data-link>Shop all</a></div>' +
      '<div class="lb">' + look + '</div>' +
    '</div></section>' +

    seam() +

    /* ---------- parent trust ---------- */
    '<section class="sec sec--tight rv"><div class="wrap">' +
      '<div class="sec__head"><h2 class="h-md">Buying for a child you cannot measure right now?</h2></div>' +
      '<div class="ptrust">' +
        '<a class="ptrust__c" href="/fit-finder" data-link><b>Fit finder</b><span>Five questions, a size and two or three pairs.</span></a>' +
        '<a class="ptrust__c" href="https://wa.me/' + esc(c.whatsapp) + '?text=' + encodeURIComponent('Hi, sizing help please. My child is ') + '" target="_blank" rel="noopener"><b>WhatsApp sizing help</b><span>Send an age and height, we reply with the size.</span></a>' +
        '<a class="ptrust__c" href="/shipping-returns" data-link><b>Wrong size? Exchange it</b><span>7 days, unworn with tags. We arrange pickup.</span></a>' +
        '<a class="ptrust__c" href="/shipping-returns" data-link><b>Cash on delivery</b><span>Pay when it arrives, anywhere in Pakistan.</span></a>' +
      '</div>' +
    '</div></section>' +

    '<div class="wrap">' + proofStrip() + '</div>' +

    '<section class="soon rv">' +
      '<p class="eyebrow" style="color:var(--brass-lt)">Next</p>' +
      '<h2 class="h-lg" style="margin-top:10px">' + esc(c.soonTitle) + '</h2>' +
      '<p>' + esc(c.soonBody) + '</p>' +
      '<div class="soon__row"><a href="/shop?gender=men" data-link>Men · Soon</a><a href="/shop?gender=women" data-link>Women · Soon</a></div>' +
    '</section>';

    return {
      title: St.seo.title,
      desc: St.seo.description,
      html: html,
      mount: function (main) {
        U.observeReveals();
        parallax(main);
        mountFitPick(main);
        drawSeams(main);
      }
    };
  }

  /* the fit tabs swap the rail in place — no page change */
  function mountFitPick(main) {
    var wrap = $('[data-fitpick]', main);
    if (!wrap) return;
    var rail = $('[data-fitrail]', wrap), line = $('[data-fitline]', wrap);
    function show(fit) {
      var list = St.query({ fit: [fit], sort: 'best' }).slice(0, 3);
      rail.innerHTML = list.length
        ? list.map(function (p) { return U.card(p, { nosizes: true }); }).join('') +
          '<a class="fitmore" href="/shop?fit=' + fit + '" data-link>All ' + esc(U.fitLabel(fit).toLowerCase()) + ' →</a>'
        : '<p class="small dim" style="padding:12px 0">Nothing in this fit right now.</p>';
      line.textContent = (S.FIT_NOTES[fit] || {}).line || '';
      line.classList.remove('pulse'); void line.offsetWidth; line.classList.add('pulse');
      rail.scrollTo({ left: 0, behavior: 'smooth' });
    }
    wrap.addEventListener('click', function (e) {
      var t = e.target.closest('[data-fit]');
      if (!t) return;
      $$('.fittab', wrap).forEach(function (b) { b.classList.toggle('is-on', b === t); b.setAttribute('aria-selected', String(b === t)); });
      show(t.dataset.fit);
    });
    show('skinny');
  }

  /* stitch dividers draw themselves in when they scroll into view */
  function drawSeams(main) {
    var nodes = $$('[data-seam]', main);
    if (!nodes.length) return;
    if (!('IntersectionObserver' in root)) { nodes.forEach(function (n) { n.classList.add('drawn'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); } });
    }, { threshold: .3 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* hero denim drifts slower than the page */
  function parallax(main) {
    var nodes = $$('[data-par]', main);
    if (!nodes.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ticking = false;
    function frame() {
      var y = root.scrollY;
      nodes.forEach(function (n) {
        if (y > root.innerHeight * 1.4) return;
        n.style.transform = 'translate3d(0,' + (y * parseFloat(n.dataset.par)).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    root.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
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
  /* What each shot in the pack actually shows, so the gallery can label it. */
  var SHOT_LABELS = ['Full front', 'Waist &amp; front', 'Fabric &amp; rip detail', 'Back &amp; pockets'];

  function ageLineFor(size) {
    for (var i = 0; i < S.SIZE_GUIDE.length; i++) {
      var r = S.SIZE_GUIDE[i];
      if (r.size === size) return 'Usually fits ' + r.age.replace(' yrs', '-year-olds').replace('–', '–') +
        ' · ' + r.height + ' cm tall · ' + r.waist + ' cm waist';
    }
    return '';
  }

  function product(ctx) {
    var p = St.product(ctx.params.slug);
    if (!p || p.active === false) return notFound();
    var wash = ctx.query.color && (p.colors || []).some(function (c) { return c.key === ctx.query.color; }) ? ctx.query.color : p.wash;
    var imgs = St.images(p, wash);
    var out = St.totalStock(p) === 0, off = St.discountPct(p), price = St.priceOf(p);
    var note = S.FIT_NOTES[p.fit] || S.FIT_NOTES.slim;
    var also = St.query({ sort: 'best' }).filter(function (x) { return x.id !== p.id; });
    var look = also.filter(function (x) { return x.fit !== p.fit; }).slice(0, 4);
    var midSize = S.KID_SIZES[3];

    var html = '<div class="wrap pdp">' +
      crumbs([['Home', '/'], ['Shop', '/shop'], [p.name, '']]) +
      '<div class="pdp__cols">' +
        '<div class="pdp__left">' +
          '<div class="gal">' +
            '<div class="gal__track" data-gal tabindex="0" aria-label="' + esc(p.name) + ' images">' +
              imgs.map(function (src, i) {
                return '<figure class="gal__slide"><img src="' + src + '" alt="' + esc(p.name + ' — ' + SHOT_LABELS[i].replace('&amp;', 'and')) + '" ' +
                  (i ? 'loading="lazy"' : 'fetchpriority="high"') + ' decoding="async" width="800" height="1200">' +
                  '<figcaption>' + SHOT_LABELS[i] + '</figcaption></figure>';
              }).join('') +
            '</div>' +
            '<div class="gal__dots" data-dots aria-hidden="true">' + imgs.map(function (_, i) { return '<i class="' + (i ? '' : 'is-on') + '"></i>'; }).join('') + '</div>' +
            '<button class="card__wish gal__wish' + (St.wished(p.id) ? ' is-on' : '') + '" data-wish="' + esc(p.id) + '" aria-pressed="' + St.wished(p.id) + '" aria-label="Save to wishlist">' + U.iconHeart(St.wished(p.id)) + '</button>' +
          '</div>' +
          '<div class="gal__thumbs" data-thumbs>' + imgs.map(function (src, i) {
            return '<button class="' + (i ? '' : 'is-on') + '" data-th="' + i + '" aria-label="View ' + SHOT_LABELS[i].replace('&amp;', 'and') + '"><img src="' + src + '" alt="" loading="lazy"></button>';
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

          '<div class="chiprow" aria-label="Best for">' +
            '<span class="chiprow__lbl">Best for</span>' +
            (p.bestFor || []).map(function (b) { return '<span class="usechip">' + esc(b) + '</span>'; }).join('') +
          '</div>' +

          ((p.colors || []).length > 1 ? '<div class="block"><div class="block__lbl"><h3>Colour</h3><span data-colorname>' + esc(U.washLabel(wash)) + '</span></div>' +
            '<div class="swatches">' + p.colors.map(function (c) {
              return '<button class="swatch' + (c.key === wash ? ' is-on' : '') + '" data-color="' + esc(c.key) + '" aria-label="' + esc(c.name) + '" aria-pressed="' + (c.key === wash) + '"><i style="background:' + c.hex + '"></i></button>';
            }).join('') + '</div></div>' : '') +

          /* size selector as woven waist tabs */
          '<div class="block"><div class="block__lbl"><h3>Size · Age</h3>' +
            '<button data-sizeguide="' + esc(p.slug) + '">Size guide</button></div>' +
            '<div class="sizes" role="radiogroup" aria-label="Select size">' + S.KID_SIZES.map(function (x) {
              var stk = +p.stock[x] || 0;
              return '<button class="sizeopt' + (stk === 0 ? ' is-out' : stk <= 3 ? ' is-low' : '') + '" role="radio" aria-checked="false"' +
                (stk === 0 ? ' aria-disabled="true" tabindex="-1"' : '') + ' data-size="' + x + '">' +
                '<span class="sizeopt__tab">' + x + '</span></button>';
            }).join('') + '</div>' +
            '<p class="agefit" data-agefit>' + (out ? 'Sold out in every size — back soon.' : ageLineFor(midSize) + ' · pick a size to confirm') + '</p>' +
          '</div>' +

          '<div class="pdp__actions">' +
            '<button class="btn" data-add' + (out ? ' disabled' : '') + '>' + (out ? 'Sold out' : 'Add to cart') + '</button>' +
            '<button class="iconsq' + (St.wished(p.id) ? ' is-on' : '') + '" data-wish="' + esc(p.id) + '" aria-pressed="' + St.wished(p.id) + '" aria-label="Save to wishlist">' + U.iconHeart(St.wished(p.id)) + '</button>' +
            '<button class="iconsq" data-share aria-label="Share this product">' +
              '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '</div>' +
          (out ? '<a class="btn btn--ghost btn--block" style="margin-top:10px" href="https://wa.me/' + esc(St.content.whatsapp) + '?text=' + encodeURIComponent('Notify me when ' + p.name + ' is back') + '" target="_blank" rel="noopener">Notify me on WhatsApp</a>' : '') +
          '<a class="waline" href="https://wa.me/' + esc(St.content.whatsapp) + '?text=' + encodeURIComponent('Hi, sizing help for the ' + p.name + ' — my child is ') + '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.9 1 4 1.6 6.2 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3Z"/></svg>' +
            'Not sure of the size? Send us an age and height</a>' +

          /* why this fit works */
          '<section class="fitwhy">' +
            '<p class="eyebrow">Why this fit works</p>' +
            '<h2 class="h-sm" style="margin:8px 0 8px">' + esc(note.line) + '</h2>' +
            '<p>' + esc(note.body) + '</p>' +
            '<a class="linkline" href="/fit-finder" data-link style="display:inline-block;margin-top:14px">Try the fit finder</a>' +
          '</section>' +

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
            '<details><summary>Sizing notes</summary><div class="acc__body">Sized by age and matched to height and waist. The waist adjusts internally from 5Y up. Between two ages, take the larger — the tab takes up the slack now and the length lasts longer.</div></details>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

      proofStrip(4) +

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

  /* ---------- proof ---------- */
  var PROOF_ICONS = {
    flag:  '<path d="M6 21V4m0 0h11l-2 4 2 4H6" />',
    ruler: '<path d="M3 9h18v6H3zM7 9v3M11 9v4M15 9v3M19 9v4"/>',
    swap:  '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    chat:  '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12Z"/>',
    wash:  '<path d="M4 7h16v12H4zM4 11h16M8 4v3M16 4v3"/>',
    rivet: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4"/>'
  };
  function proofStrip(n) {
    var items = S.PROOF.slice(0, n || S.PROOF.length);
    return '<section class="proof rv"><div class="proof__grid">' + items.map(function (x) {
      return '<div class="proof__i">' +
        '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">' + (PROOF_ICONS[x.icon] || '') + '</svg>' +
        '<div><strong>' + esc(x.title) + '</strong><span>' + esc(x.body) + '</span></div></div>';
    }).join('') + '</div></section>';
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
        var af = $('[data-agefit]', main);
        if (af) {
          af.textContent = ageLineFor(chosen) + (left <= 3 ? ' · only ' + left + ' left' : '');
          af.classList.remove('pulse'); void af.offsetWidth; af.classList.add('pulse');
        }
        sz.classList.remove('tap'); void sz.offsetWidth; sz.classList.add('tap');
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
        if (r.ok) {
          U.rivetBurst(e.target.closest('[data-add]'));
          U.toast('Added <b>' + esc(p.name) + '</b> · ' + chosen);
          setTimeout(function () { U.openCart(); }, 260);
        }
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
        var on = !es[0].isIntersecting && es[0].boundingClientRect.top < 0;
        sticky.classList.toggle('is-on', on);
        var wa = $('#wa', doc);
        if (wa) wa.classList.toggle('is-tucked', on);
      }, { threshold: 0 }).observe(addBtn);
    }
    U.observeReveals(main);
  }

  /* ============================ FIT FINDER ============================ */
  function parseRange(str) {
    var m = String(str).split(/[–-]/);
    return [parseFloat(m[0]), parseFloat(m[1] || m[0])];
  }
  function sizeForHeight(cm) {
    for (var i = 0; i < S.SIZE_GUIDE.length; i++) {
      var r = parseRange(S.SIZE_GUIDE[i].height);
      if (cm >= r[0] && cm <= r[1]) return S.SIZE_GUIDE[i].size;
    }
    return cm < parseRange(S.SIZE_GUIDE[0].height)[0]
      ? S.SIZE_GUIDE[0].size : S.SIZE_GUIDE[S.SIZE_GUIDE.length - 1].size;
  }
  function sizeForAge(age) {
    for (var i = 0; i < S.SIZE_GUIDE.length; i++) {
      var r = parseRange(S.SIZE_GUIDE[i].age.replace(' yrs', ''));
      if (age >= r[0] && age <= r[1]) return S.SIZE_GUIDE[i].size;
    }
    return S.KID_SIZES[S.KID_SIZES.length - 1];
  }

  function recommend(a) {
    var byH = a.height ? sizeForHeight(a.height) : null;
    var byA = sizeForAge(a.age);
    var size = byH || byA;
    var conflict = byH && byH !== byA;

    var scored = St.query({ sort: 'best' }).map(function (p) {
      var note = S.FIT_NOTES[p.fit] || {}, sc = 0, why = [];
      if (a.fit && a.fit !== 'any') {
        if (p.fit === a.fit) { sc += 5; why.push('the ' + U.fitLabel(p.fit).toLowerCase() + ' leg you asked for'); }
        else sc -= 1;
      }
      if ((note.build || []).indexOf(a.build) > -1) { sc += 3; if (a.fit === 'any') why.push('cut for a ' + a.build + ' build'); }
      else sc -= 4;
      var hits = (p.bestFor || []).filter(function (b) { return a.uses.indexOf(b) > -1; });
      sc += hits.length * 2;
      if (hits.length) why.push('made for ' + hits.join(' and ').toLowerCase());
      var stock = +p.stock[size] || 0;
      if (stock <= 0) sc -= 12; else if (stock <= 3) sc += 1; else sc += 4;
      if ((p.collections || []).indexOf('best-sellers') > -1) sc += 1;
      return { p: p, sc: sc, why: why, stock: stock };
    }).filter(function (x) { return x.stock > 0; })
      .sort(function (x, y) { return y.sc - x.sc; });

    return { size: size, byAge: byA, byHeight: byH, conflict: conflict, picks: scored.slice(0, 3) };
  }

  var FF_STEPS = [
    { key: 'age', q: 'Who are we buying for?', hint: 'Their age in years.',
      opts: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(function (n) { return { v: n, l: n + 'Y' }; }) },
    { key: 'height', q: 'How tall are they?', hint: 'Roughly is fine — it beats age for getting the size right.',
      opts: [{ v: 0, l: 'Not sure' }, { v: 103, l: 'Under 107 cm' }, { v: 110, l: '107–114' }, { v: 117, l: '114–120' },
             { v: 126, l: '120–132' }, { v: 137, l: '132–142' }, { v: 147, l: '142–152' }, { v: 157, l: '152–162' }] },
    { key: 'build', q: 'How would you describe their build?', hint: 'This decides how close the leg should be.',
      opts: [{ v: 'slim', l: 'Slim' }, { v: 'average', l: 'Average' }, { v: 'healthy', l: 'Healthy' }] },
    { key: 'fit', q: 'Any fit they prefer?', hint: 'Pick one, or let us choose.',
      opts: [{ v: 'any', l: 'Let us choose' }, { v: 'skinny', l: 'Skinny' }, { v: 'slim', l: 'Slim' },
             { v: 'straight', l: 'Straight' }, { v: 'jogger', l: 'Jogger' }] },
    { key: 'uses', q: 'What are they mostly for?', hint: 'Choose as many as you like.', multi: true,
      opts: S.USES.map(function (u) { return { v: u.label, l: u.label }; }) }
  ];

  function fitFinder() {
    return {
      title: 'Fit Finder — get the size right first time | Rivet & Co.',
      desc: 'Answer five quick questions about age, height, build and use, and we will recommend the right Rivet Jr size and two or three styles.',
      html: '<div class="wrap pagehead">' + crumbs([['Home', '/'], ['Fit finder', '']]) +
        '<p class="eyebrow">' + esc(S.LINE) + '</p>' +
        '<h1 class="h-lg">Fit finder</h1>' +
        '<p>Five questions, about thirty seconds. We will tell you the size and the two or three pairs worth buying.</p></div>' +
        '<div class="wrap ff" data-ff><div class="ff__bar"><i data-ffbar style="width:0%"></i></div>' +
        '<div data-ffbody></div></div>',
      mount: function (main) { mountFF(main); }
    };
  }

  function mountFF(main) {
    var a = { age: null, height: null, build: null, fit: null, uses: [] };
    var step = 0;
    var body = $('[data-ffbody]', main), bar = $('[data-ffbar]', main);

    function draw() {
      bar.style.width = Math.round((step / FF_STEPS.length) * 100) + '%';
      if (step >= FF_STEPS.length) return results();
      var st = FF_STEPS[step];
      var val = a[st.key];
      body.innerHTML =
        '<div class="ff__step">' +
          '<p class="ff__count">Question ' + (step + 1) + ' of ' + FF_STEPS.length + '</p>' +
          '<h2 class="h-md">' + esc(st.q) + '</h2>' +
          '<p class="ff__hint">' + esc(st.hint) + '</p>' +
          '<div class="ff__opts">' + st.opts.map(function (o) {
            var on = st.multi ? val.indexOf(o.v) > -1 : val === o.v;
            return '<button class="ff__opt' + (on ? ' is-on' : '') + '" data-v="' + esc(String(o.v)) + '" aria-pressed="' + on + '">' + esc(o.l) + '</button>';
          }).join('') + '</div>' +
          '<div class="ff__nav">' +
            (step ? '<button class="btn btn--ghost btn--sm" data-back>Back</button>' : '<span></span>') +
            (st.multi ? '<button class="btn btn--sm" data-next' + (val.length ? '' : ' disabled') + '>See results</button>' : '') +
          '</div>' +
        '</div>';
    }

    function results() {
      var r = recommend(a);
      bar.style.width = '100%';
      var picks = r.picks;
      body.innerHTML =
        '<div class="ff__result">' +
          '<p class="ff__count">Recommendation</p>' +
          '<h2 class="h-lg">Size ' + esc(r.size) + '</h2>' +
          '<p class="ff__hint">' + esc(ageLineFor(r.size)) + '</p>' +
          (r.conflict ? '<p class="ff__flag">Their height suggests <b>' + esc(r.byHeight) + '</b> while their age suggests <b>' + esc(r.byAge) + '</b>. We have gone with height, and the waist adjusts either way.</p>' : '') +
          (picks.length
            ? '<div class="ff__picks">' + picks.map(function (x, i) {
                return '<article class="ffpick">' +
                  '<a href="/product/' + esc(x.p.slug) + '" data-link><img src="' + St.thumb(x.p, 0) + '" alt="' + esc(x.p.name) + '" loading="lazy" width="800" height="1200"></a>' +
                  '<div><p class="ffpick__rank">' + (i ? 'Also good' : 'Best match') + '</p>' +
                  '<a href="/product/' + esc(x.p.slug) + '" data-link><h3 class="h-sm">' + esc(x.p.name) + '</h3></a>' +
                  '<p class="ffpick__why">' + esc(x.why.length ? x.why.join(', ') : 'in stock in ' + r.size + ' and cut for their build') + '</p>' +
                  '<p class="ffpick__price">' + pkr(St.priceOf(x.p)) + ' · ' + (x.stock <= 3 ? 'only ' + x.stock + ' left in ' + r.size : 'in stock in ' + r.size) + '</p>' +
                  '<button class="btn btn--sm" data-ffadd="' + esc(x.p.slug) + '" data-ffsize="' + esc(r.size) + '">Add ' + esc(r.size) + ' to cart</button>' +
                  '</div></article>';
              }).join('') + '</div>'
            : '<p class="ff__flag">Nothing is in stock in ' + esc(r.size) + ' right now. Message us on WhatsApp and we will tell you when it lands.</p>') +
          '<div class="ff__again">' +
            '<button class="btn btn--ghost btn--sm" data-restart>Start again</button>' +
            '<a class="btn btn--ghost btn--sm" href="/shop" data-link>Browse everything</a>' +
          '</div>' +
        '</div>';
    }

    main.addEventListener('click', function (e) {
      var o = e.target.closest('.ff__opt');
      if (o) {
        var st = FF_STEPS[step], raw = o.dataset.v;
        var v = (st.key === 'age' || st.key === 'height') ? +raw : raw;
        if (st.multi) {
          var i = a.uses.indexOf(v);
          if (i > -1) a.uses.splice(i, 1); else a.uses.push(v);
          draw();
        } else {
          a[st.key] = (st.key === 'height' && v === 0) ? null : v;
          step++; draw();
        }
        return;
      }
      if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); draw(); return; }
      if (e.target.closest('[data-next]')) { step++; draw(); return; }
      if (e.target.closest('[data-restart]')) { a = { age: null, height: null, build: null, fit: null, uses: [] }; step = 0; draw(); return; }
      var add = e.target.closest('[data-ffadd]');
      if (add) {
        var p = St.product(add.dataset.ffadd);
        var res = St.addToCart(p, add.dataset.ffsize, null, 1);
        if (res.ok) { U.rivetBurst(add); U.toast('Added <b>' + esc(p.name) + '</b> · ' + add.dataset.ffsize); setTimeout(U.openCart, 300); }
        else U.toast(res.msg, 'err');
      }
    });

    draw();
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
              '<a href="/product/' + esc(l.slug) + '" data-link aria-label="' + esc(l.name) + '"><img src="' + (p ? St.thumb(p, 0, l.color) : '') + '" alt="' + esc(l.name) + '" loading="lazy"></a>' +
              '<div><a href="/product/' + esc(l.slug) + '" data-link><p class="line__nm">' + esc(l.name) + '</p></a>' +
              '<p class="line__va">' + esc(l.size) + ' · ' + esc(U.washLabel(l.color)) + '</p>' +
              '<div class="line__bot"><div class="qty"><button data-qty="-1" aria-label="Decrease">−</button><span>' + l.qty + '</span><button data-qty="1" aria-label="Increase">+</button></div>' +
              '<span class="line__pr">' + pkr(l.price * l.qty) + '</span></div>' +
              '<button class="line__rm" data-rm style="margin-top:8px">Remove</button></div></div>';
          }).join('') + '</div>' +
          '<aside class="panel" style="align-self:start"><h3>Summary</h3>' +
            '<div class="sums"><div><span>Subtotal</span><span>' + pkr(t.sub) + '</span></div>' +
            (t.bundle ? '<div class="disc"><span>' + esc(St.content.bundleTitle) + '</span><span>−' + pkr(t.bundle) + '</span></div>' : '') +
            (t.discount - t.bundle > 0 ? '<div class="disc"><span>Discount</span><span>−' + pkr(t.discount - t.bundle) + '</span></div>' : '') +
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
              '<img src="' + (p ? St.thumb(p, 0, l.color) : '') + '" alt="' + esc(l.name) + '" width="40" height="50" style="width:40px;height:50px;object-fit:cover;border-radius:4px" loading="lazy">' +
              '<span><b style="display:block;font-size:13px">' + esc(l.name) + '</b><span class="small dim">' + esc(l.size) + ' × ' + l.qty + '</span></span></span>' +
              '<span>' + pkr(l.price * l.qty) + '</span></div>';
          }).join('') +
          '<div class="sums" style="margin-top:14px"><div><span>Subtotal</span><span>' + pkr(t.sub) + '</span></div>' +
          (t.bundle ? '<div class="disc"><span>' + esc(St.content.bundleTitle) + '</span><span>−' + pkr(t.bundle) + '</span></div>' : '') +
          (t.discount - t.bundle > 0 ? '<div class="disc"><span>Discount</span><span>−' + pkr(t.discount - t.bundle) + '</span></div>' : '') +
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
    checkout: checkout, orderConfirmed: orderConfirmed, account: account, fitFinder: fitFinder,
    sizeGuide: sizeGuidePage, shipping: shippingPage, about: about, notFound: notFound
  };
})(window, document);
