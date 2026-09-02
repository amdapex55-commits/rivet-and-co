/* ============================================================
   App — router, first-load splash, SEO head, global wiring
   ============================================================ */
(function (root, doc) {
  'use strict';
  var St = root.Store, F = root.Fabric, S = root.SEED, U = root.UI, P = root.Pages, A = root.Admin;
  var $ = U.$, $$ = U.$$;

  /* ---------------- base path ----------------
     The site can be served from the domain root or from a project
     subfolder (GitHub Pages). <base> is the single source of truth;
     everything below routes relative to it. */
  var BASE = (function () {
    var b = doc.querySelector('base');
    if (!b) return '';
    return new URL(b.href).pathname.replace(/\/+$/, '');
  })();
  function routePath() {
    var p = location.pathname;
    if (BASE && p.indexOf(BASE) === 0) p = p.slice(BASE.length);
    return p.replace(/\/+$/, '') || '/';
  }
  function absUrl(path) { return location.origin + BASE + (path || '/'); }

  /* Anchors are authored as "/shop" so the app reads the same at the domain
     root. On a project site that path 404s if the browser — not the router —
     follows it: open-in-new-tab, middle-click, copy-link, crawlers. So every
     data-link href gets the base written into the DOM, and anything added
     later is caught by the observer below. */
  function fixLinks(scope) {
    if (!BASE) return;
    var nodes = (scope || doc).querySelectorAll('a[data-link]');
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i], h = a.getAttribute('href');
      if (!h || h.charAt(0) !== '/' || h.indexOf(BASE + '/') === 0 || h === BASE) continue;
      a.setAttribute('href', BASE + h);
    }
  }
  function watchLinks() {
    if (!BASE || !root.MutationObserver) return;
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        var added = recs[i].addedNodes;
        for (var k = 0; k < added.length; k++) {
          var n = added[k];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('a[data-link]')) fixLinks(n.parentNode || doc);
          else if (n.querySelector && n.querySelector('a[data-link]')) fixLinks(n);
        }
      }
    }).observe(doc.body, { childList: true, subtree: true });
  }

  /* ---------------- routes ---------------- */
  var ROUTES = [
    [/^\/$/,                        function () { return P.home(); }],
    [/^\/shop$/,                    function (m, q) { return P.shop({ params: {}, query: q }); }],
    [/^\/collections\/([\w-]+)$/,   function (m, q) { q = Object.assign({}, q, { collection: m[1] }); return P.shop({ params: {}, query: q }); }],
    [/^\/product\/([\w-]+)$/,       function (m, q) { return P.product({ params: { slug: m[1] }, query: q }); }],
    [/^\/cart$/,                    function () { return P.cart(); }],
    [/^\/wishlist$/,                function () { return P.wishlist(); }],
    [/^\/checkout$/,                function () { return P.checkout(); }],
    [/^\/order\/([\w-]+)$/,         function (m) { return P.orderConfirmed({ params: { id: m[1] } }); }],
    [/^\/account$/,                 function () { return P.account(); }],
    [/^\/fit-finder$/,              function () { return P.fitFinder(); }],
    [/^\/size-guide$/,              function () { return P.sizeGuide(); }],
    [/^\/shipping-returns$/,        function () { return P.shipping(); }],
    [/^\/about$/,                   function () { return P.about(); }],
    [/^\/admin$/,                   function (m, q) { return A.admin({ params: {}, query: q }); }],
    [/^\/admin\/([\w-]+)$/,         function (m, q) { return A.admin({ params: { tab: m[1] }, query: q }); }]
  ];

  function parseQuery(search) {
    var q = {};
    (search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('='), k = i < 0 ? kv : kv.slice(0, i);
      q[decodeURIComponent(k)] = i < 0 ? '1' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
    });
    return q;
  }

  var current = null;
  function resolve(path, query) {
    for (var i = 0; i < ROUTES.length; i++) {
      var m = path.match(ROUTES[i][0]);
      if (m) { try { return ROUTES[i][1](m, query); } catch (e) { console.error(e); return errorPage(e); } }
    }
    return P.notFound();
  }
  function errorPage(e) {
    return {
      title: 'Something went wrong | Rivet & Co.', desc: '',
      html: '<div class="wrap" style="padding-block:60px">' +
        U.emptyState(U.ICONS.alert, 'Something went wrong', 'This page failed to render. Reload, or head back to the shop.', 'Back to shop', '/shop') +
        '<pre class="errbox" style="max-width:600px;margin:20px auto 0;white-space:pre-wrap;font-size:11px">' + U.esc(e && e.message || e) + '</pre></div>',
      mount: function () {}
    };
  }

  function render(scroll) {
    var path = routePath();
    var query = parseQuery(location.search);
    var main = $('#main');
    var page = resolve(path, query);
    current = { path: path, query: query };

    doc.body.classList.toggle('in-admin', !!page.admin);
    $('#hdr').hidden = !!page.admin;
    $('#ftr').hidden = !!page.admin;
    $('#botnav').hidden = !!page.admin;
    $('#wa').hidden = !!page.admin;

    main.innerHTML = page.html;
    fixLinks(doc);
    applySEO(page);
    if (page.mount) page.mount(main);
    U.refreshCounts();
    U.observeReveals(main);
    markNav(path);
    if (scroll !== false) root.scrollTo({ top: 0, behavior: 'instant' in doc.documentElement.style ? 'instant' : 'auto' });
    main.focus({ preventScroll: true });
  }

  var Router = {
    go: function (url) {
      if (url === routePath() + location.search) return render();
      history.pushState({}, '', BASE + url); render();
    },
    replace: function (url) { history.replaceState({}, '', BASE + url); },
    refresh: function () { render(false); },
    current: function () { return current; },
    path: routePath, base: function () { return BASE; }, abs: absUrl
  };
  root.Router = Router;

  root.addEventListener('popstate', function () { render(false); });

  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-link]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1 || a.target === '_blank') return;
    /* works for "/shop", "shop" and "/rivet-and-co/shop" alike: route off the
       resolved path, so the markup can stay base-relative */
    if (a.origin !== location.origin) return;
    var p = a.pathname;
    if (BASE && p.indexOf(BASE) === 0) p = p.slice(BASE.length) || '/';
    e.preventDefault();
    U.closeOverlay();
    Router.go(p + (a.search || ''));
  });

  /* ---------------- head / SEO ---------------- */
  function meta(sel, attr, val) {
    var n = doc.head.querySelector(sel);
    if (!n) { return; }
    n.setAttribute(attr, val);
  }
  function applySEO(page) {
    var seo = St.seo;
    var here = routePath(), isHome = here === '/';
    var title = page && page.title ? page.title : seo.title;
    var desc = page && page.desc ? page.desc : seo.description;
    var canonical = (seo.canonical || absUrl('/')).replace(/\/$/, '') + (isHome ? '/' : here + '/');

    doc.title = title;
    meta('meta[name="description"]', 'content', desc);
    meta('meta[name="keywords"]', 'content', seo.keywords);
    meta('link[rel="canonical"]', 'href', canonical);
    meta('meta[property="og:title"]', 'content', title);
    meta('meta[property="og:description"]', 'content', desc);
    meta('meta[property="og:url"]', 'content', canonical);
    meta('meta[property="og:image"]', 'content', seo.ogImage);
    meta('meta[name="twitter:title"]', 'content', title);
    meta('meta[name="twitter:description"]', 'content', desc);
    meta('meta[name="twitter:image"]', 'content', seo.ogImage);
    $$('meta[name="theme-color"]').forEach(function (n) {
      if (!n.media || n.media.indexOf('light') > -1) n.setAttribute('content', seo.themeColor);
    });

    var robots = doc.head.querySelector('meta[name="robots"]');
    if (page && page.noindex) {
      if (!robots) { robots = doc.createElement('meta'); robots.name = 'robots'; doc.head.appendChild(robots); }
      robots.content = 'noindex,nofollow';
    } else if (robots) robots.remove();

    var old = doc.getElementById('ld-page');
    if (old) old.remove();
    if (page && page.ld) {
      var s = doc.createElement('script');
      s.type = 'application/ld+json'; s.id = 'ld-page';
      s.textContent = JSON.stringify(page.ld);
      doc.head.appendChild(s);
    }
  }

  /* ---------------- chrome (brand-driven bits) ---------------- */
  function paintChrome() {
    var b = St.db.brand, c = St.content;
    var wm = $('#wordmark');
    if (wm) {
      if (b.logo) wm.innerHTML = '<img src="' + b.logo + '" alt="Rivet &amp; Co." style="height:26px;width:auto">';
      else {
        var t = (b.logoText || 'RIVET & CO.').replace('&', '<em>&amp;</em>');
        wm.innerHTML = t;
      }
    }
    if (b.favicon) {
      $$('link[rel="icon"]').forEach(function (n) { n.remove(); });
      var l = doc.createElement('link'); l.rel = 'icon'; l.href = b.favicon;
      doc.head.appendChild(l);
    }
    var tick = $('.hdr__ticker__in');
    if (tick && c.announcements && c.announcements.length) {
      tick.innerHTML = c.announcements
        .map(function (a, i) { return '<span class="' + (i ? '' : 'is-on') + '">' + U.esc(a) + '</span>'; }).join('');
      startTicker();
    }
    var wa = $('#wa');
    if (wa) wa.href = 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent('Hi Rivet & Co., I need help with sizing');
  }

  /* ---------------- announcement rotator ---------------- */
  var tickerTimer = null;
  function startTicker() {
    clearInterval(tickerTimer);
    var items = $$('.hdr__ticker span');
    if (items.length < 2) return;
    var i = 0;
    tickerTimer = setInterval(function () {
      if (doc.hidden) return;
      items[i].classList.remove('is-on');
      i = (i + 1) % items.length;
      items[i].classList.add('is-on');
    }, 4200);
  }

  /* ---------------- nav state ---------------- */
  function markNav(path) {
    $$('#botnav [data-nav]').forEach(function (n) {
      var k = n.dataset.nav;
      var on = (k === 'shop' && (path === '/shop' || path.indexOf('/collections') === 0 || path.indexOf('/product') === 0)) ||
               (k === 'wishlist' && path === '/wishlist') ||
               (k === 'account' && (path === '/account' || path.indexOf('/order/') === 0));
      n.classList.toggle('is-active', !!on);
    });
    $$('.hdr__nav a').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === path);
    });
  }

  /* ---------------- global delegated actions ---------------- */
  doc.addEventListener('click', function (e) {
    var w = e.target.closest('[data-wish]');
    if (w) {
      e.preventDefault();
      var id = w.dataset.wish, now = St.toggleWish(id);
      $$('[data-wish="' + id + '"]').forEach(function (n) {
        n.classList.toggle('is-on', now);
        n.setAttribute('aria-pressed', String(now));
        n.innerHTML = U.iconHeart(now);
        n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop');
      });
      U.refreshCounts();
      U.toast(now ? 'Saved to wishlist' : 'Removed from wishlist');
      if (routePath() === '/wishlist') setTimeout(function () { Router.refresh(); }, 260);
      return;
    }
    var sz = e.target.closest('[data-sizes]');
    if (sz) {
      e.preventDefault();
      var c = sz.closest('.card');
      var open = c.classList.toggle('is-open');
      sz.setAttribute('aria-expanded', String(open));
      return;
    }
    var q = e.target.closest('[data-quick]');
    if (q) { e.preventDefault(); U.quickAdd(q.dataset.quick); return; }
    var sg = e.target.closest('[data-sizeguide]');
    if (sg) { e.preventDefault(); U.sizeGuide(sg.dataset.sizeguide); return; }
  });

  doc.addEventListener('submit', function (e) {
    var n = e.target.closest('[data-news]');
    if (!n) return;
    e.preventDefault();
    var v = n.email.value.trim();
    if (!v || v.indexOf('@') < 0) return U.toast('Enter a valid email', 'err');
    U.toast('You are on the list. <b>Welcome.</b>');
    n.reset();
  });

  /* ---------------- header behaviour ---------------- */
  function wireHeader() {
    $('#btn-cart').addEventListener('click', U.openCart);
    $('#bn-cart').addEventListener('click', U.openCart);
    $('#btn-search').addEventListener('click', U.openSearch);
    $('#bn-search').addEventListener('click', U.openSearch);
    $('#btn-menu').addEventListener('click', U.openNav);

    var last = 0, hdr = $('#hdr'), wa = $('#wa'), ticking = false;
    function onScroll() {
      var y = root.scrollY;
      hdr.classList.toggle('is-stuck', y > 8);
      if (wa) {
        var buy = $('.stickybuy.is-on');
        var down = y > last + 4 && y > 220;
        var up = y < last - 4;
        if (buy) wa.classList.add('is-tucked');
        else if (down) wa.classList.add('is-tucked');
        else if (up || y < 120) wa.classList.remove('is-tucked');
      }
      last = y;
      ticking = false;
    }
    root.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    St.on('cart', function () { U.refreshCounts(); U.renderCart(); });
    St.on('wish', U.refreshCounts);
    root.addEventListener('rc:quota', function () {
      U.toast('Browser storage is full — export your data and remove large uploaded images.', 'err');
    });
  }

  /* ---------------- splash ---------------- */
  function splash() {
    var el = $('#splash');
    var seen = false;
    try { seen = sessionStorage.getItem('rc:splash') === '1' || localStorage.getItem('rc:splash-ever') === '1' && false; } catch (e) {}
    if (seen || routePath().indexOf('/admin') === 0) {
      el.remove();
      return Promise.resolve();
    }
    try { sessionStorage.setItem('rc:splash', '1'); } catch (e) {}
    doc.body.classList.add('no-scroll');
    return new Promise(function (res) {
      setTimeout(function () {
        el.classList.add('is-out');
        doc.body.classList.remove('no-scroll');
        setTimeout(function () { el.remove(); res(); }, 760);
      }, 2000);
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    doc.documentElement.classList.add('has-js');
    /* safety net: if the observer never fires, reveal everything */
    setTimeout(function () { $$('.rv:not(.in)').forEach(function (n) { n.classList.add('in'); }); }, 4000);
    /* denim texture behind the splash */
    doc.documentElement.style.setProperty('--denim-hero',
      'url("' + F.url({ shot: 'texture', wash: 'dark-indigo', seed: 4, seam: false }) + '")');

    paintChrome();
    U.renderFooter();
    fixLinks(doc);
    watchLinks();
    wireHeader();
    A.wireGesture();
    U.wireCardPeek();
    render();
    splash();

    /* keyboard shortcut for search on desktop */
    doc.addEventListener('keydown', function (e) {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
          ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(doc.activeElement.tagName) < 0) {
        e.preventDefault(); U.openSearch();
      }
    });
  }

  root.App = { paintChrome: paintChrome, applySEO: applySEO, boot: boot };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
