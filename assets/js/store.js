/* ============================================================
   Store — persistence, cart, wishlist, orders, admin auth.
   Seed data is copied into localStorage on first run; the
   admin edits that working copy. "Reset to factory" restores.
   ============================================================ */
(function (root) {
  'use strict';

  var NS = 'rc:', VERSION = 3, S = root.SEED, F = root.Fabric;

  /* ---------- storage ---------- */
  function ls(k, v) {
    try {
      if (v === undefined) { var s = localStorage.getItem(NS + k); return s == null ? null : JSON.parse(s); }
      if (v === null) { localStorage.removeItem(NS + k); return null; }
      localStorage.setItem(NS + k, JSON.stringify(v));
      return v;
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        root.dispatchEvent(new CustomEvent('rc:quota'));
      }
      return null;
    }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var db = {};
  function boot() {
    var v = ls('v');
    if (v !== VERSION) { hardReset(true); ls('v', VERSION); }
    db.products  = ls('products')  || clone(S.PRODUCTS);
    db.orders    = ls('orders')    || clone(S.ORDERS);
    db.customers = ls('customers') || clone(S.CUSTOMERS);
    db.coupons   = ls('coupons')   || clone(S.COUPONS);
    db.content   = Object.assign(clone(S.CONTENT), ls('content') || {});
    db.seo       = Object.assign(clone(S.SEO), ls('seo') || {});
    db.brand     = ls('brand') || { logoText: 'RIVET & CO.', favicon: null, logo: null };
    db.cart      = ls('cart') || [];
    db.wish      = ls('wish') || [];
    db.recent    = ls('recent') || [];
    db.me        = ls('me') || null;
  }
  function hardReset(quiet) {
    ['products','orders','customers','coupons','content','seo','brand'].forEach(function (k) { ls(k, null); });
    if (!quiet) { boot(); emit('*'); }
  }
  function save(k) { ls(k, db[k]); emit(k); }

  /* ---------- events ---------- */
  var subs = {};
  function on(evt, fn) { (subs[evt] = subs[evt] || []).push(fn); return function () { off(evt, fn); }; }
  function off(evt, fn) { if (subs[evt]) subs[evt] = subs[evt].filter(function (f) { return f !== fn; }); }
  function emit(evt, data) {
    (subs[evt] || []).forEach(function (f) { f(data); });
    if (evt !== '*') (subs['*'] || []).forEach(function (f) { f(evt, data); });
  }

  /* ---------- money ---------- */
  function pkr(n) { return 'Rs ' + Math.round(n).toLocaleString('en-PK'); }

  /* ---------- products ---------- */
  function products(opts) {
    opts = opts || {};
    var list = db.products.filter(function (p) { return opts.all ? true : p.active !== false; });
    return list;
  }
  function product(slug) {
    for (var i = 0; i < db.products.length; i++) if (db.products[i].slug === slug) return db.products[i];
    return null;
  }
  function productById(id) {
    for (var i = 0; i < db.products.length; i++) if (db.products[i].id === id) return db.products[i];
    return null;
  }
  function totalStock(p) {
    var t = 0; for (var k in p.stock) t += (+p.stock[k] || 0); return t;
  }
  function priceOf(p) { return p.salePrice || p.price; }
  function discountPct(p) { return p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0; }

  /* images: uploaded gallery wins, otherwise generate from the fabric engine */
  var SHOTS = ['flat', 'crop', 'back', 'detail'];
  function images(p, washKey) {
    if (p.images && p.images.length) return p.images;
    var w = washKey || p.wash;
    return SHOTS.map(function (shot, i) {
      return F.url({ shot: shot, wash: w, fit: p.fit, seed: (p.seed || 7) + i * 13 });
    });
  }
  function thumb(p, i, washKey) { var a = images(p, washKey); return a[Math.min(i || 0, a.length - 1)]; }

  /* ---------- filtering ---------- */
  function query(q) {
    q = q || {};
    var out = products();
    if (q.collection) out = out.filter(function (p) { return (p.collections || []).indexOf(q.collection) > -1; });
    if (q.gender && q.gender !== 'kids') out = [];
    if (q.fit && q.fit.length) out = out.filter(function (p) { return q.fit.indexOf(p.fit) > -1; });
    if (q.wash && q.wash.length) out = out.filter(function (p) {
      if (q.wash.indexOf(p.wash) > -1) return true;
      return (p.colors || []).some(function (c) { return q.wash.indexOf(c.key) > -1; });
    });
    if (q.size && q.size.length) out = out.filter(function (p) {
      return q.size.some(function (s) { return (+p.stock[s] || 0) > 0; });
    });
    if (q.max) out = out.filter(function (p) { return priceOf(p) <= +q.max; });
    if (q.min) out = out.filter(function (p) { return priceOf(p) >= +q.min; });
    if (q.instock) out = out.filter(function (p) { return totalStock(p) > 0; });
    if (q.sale) out = out.filter(function (p) { return !!p.salePrice; });
    if (q.q) {
      var t = q.q.toLowerCase();
      out = out.filter(function (p) {
        return (p.name + ' ' + p.fit + ' ' + p.wash + ' ' + (p.description || '') + ' ' + (p.collections || []).join(' '))
          .toLowerCase().indexOf(t) > -1;
      });
    }
    var sort = q.sort || 'featured';
    out = out.slice().sort(function (a, b) {
      if (sort === 'price-asc')  return priceOf(a) - priceOf(b);
      if (sort === 'price-desc') return priceOf(b) - priceOf(a);
      if (sort === 'new')        return b.createdAt - a.createdAt;
      if (sort === 'best')       return b.sold - a.sold;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.sold - a.sold;
    });
    return out;
  }

  /* ---------- cart ---------- */
  function lineKey(id, size, color) { return id + '|' + size + '|' + color; }
  function addToCart(p, size, color, qty) {
    qty = qty || 1;
    var color2 = color || p.wash, k = lineKey(p.id, size, color2);
    var avail = +p.stock[size] || 0;
    if (avail <= 0) return { ok: false, msg: 'That size is sold out.' };
    var found = null;
    db.cart.forEach(function (l) { if (l.key === k) found = l; });
    if (found) {
      if (found.qty + qty > avail) return { ok: false, msg: 'Only ' + avail + ' left in ' + size + '.' };
      found.qty += qty;
    } else {
      db.cart.push({ key: k, id: p.id, slug: p.slug, name: p.name, size: size, color: color2, qty: Math.min(qty, avail), price: priceOf(p) });
    }
    save('cart'); return { ok: true };
  }
  function setQty(key, qty) {
    db.cart = db.cart.map(function (l) {
      if (l.key !== key) return l;
      var p = productById(l.id), avail = p ? (+p.stock[l.size] || 0) : 99;
      l.qty = Math.max(0, Math.min(qty, avail));
      return l;
    }).filter(function (l) { return l.qty > 0; });
    save('cart');
  }
  function removeLine(key) { db.cart = db.cart.filter(function (l) { return l.key !== key; }); save('cart'); }
  function clearCart() { db.cart = []; save('cart'); }
  function cartCount() { return db.cart.reduce(function (a, l) { return a + l.qty; }, 0); }

  function findCoupon(code) {
    if (!code) return null;
    var c = null;
    db.coupons.forEach(function (x) { if (x.active && x.code.toUpperCase() === String(code).toUpperCase()) c = x; });
    return c;
  }
  /* Launch bundle: the N cheapest units together cost a flat price.
     Applied automatically, and stacked before any coupon. */
  function bundleDiscount() {
    var c = db.content;
    if (!c.bundleActive) return { amount: 0, short: c.bundleQty || 2 };
    var qty = c.bundleQty || 2, flat = c.bundlePrice || 0;
    var units = [];
    db.cart.forEach(function (l) {
      for (var i = 0; i < l.qty; i++) units.push(l.price);
    });
    if (units.length < qty) return { amount: 0, short: qty - units.length };
    units.sort(function (a, b) { return a - b; });
    var sets = Math.floor(units.length / qty), amount = 0;
    for (var s = 0; s < sets; s++) {
      var chunk = units.slice(s * qty, s * qty + qty);
      var full = chunk.reduce(function (a, b) { return a + b; }, 0);
      if (full > flat) amount += full - flat;
    }
    return { amount: amount, short: 0, sets: sets };
  }

  function totals(code) {
    var sub = db.cart.reduce(function (a, l) { return a + l.price * l.qty; }, 0);
    var bundle = bundleDiscount();
    var c = findCoupon(code), discount = bundle.amount, freeShip = false, err = null;
    var afterBundle = sub - bundle.amount;
    if (code && !c) err = 'That code is not valid.';
    if (c) {
      if (afterBundle < (c.min || 0)) { err = 'Spend ' + pkr(c.min) + ' to use ' + c.code + '.'; c = null; }
      else if (c.type === 'percent') discount += Math.round(afterBundle * c.value / 100);
      else if (c.type === 'fixed') discount += Math.min(c.value, afterBundle);
      else if (c.type === 'shipping') freeShip = true;
    }
    var over = db.content.freeShipOver, flat = db.content.flatShipping;
    var shipping = (sub - discount) >= over || freeShip || sub === 0 ? 0 : flat;
    return { sub: sub, discount: discount, bundle: bundle.amount, bundleShort: bundle.short,
             shipping: shipping, total: Math.max(0, sub - discount + shipping),
             coupon: c, err: err, toFree: Math.max(0, over - (sub - discount)) };
  }

  /* ---------- wishlist ---------- */
  function wished(id) { return db.wish.indexOf(id) > -1; }
  function toggleWish(id) {
    var i = db.wish.indexOf(id);
    if (i > -1) db.wish.splice(i, 1); else db.wish.unshift(id);
    save('wish'); return i === -1;
  }

  /* ---------- orders ---------- */
  function placeOrder(info, code) {
    var t = totals(code);
    if (!db.cart.length) return { ok: false, msg: 'Your cart is empty.' };
    var id = 'RC-' + (10300 + db.orders.length + Math.floor(Math.random() * 400));
    var cust = null;
    db.customers.forEach(function (c) { if (c.phone === info.phone) cust = c; });
    if (!cust) {
      cust = { id: 'C' + (3000 + db.customers.length), name: info.name, phone: info.phone,
               email: info.email || '', city: info.city, createdAt: Date.now() };
      db.customers.unshift(cust); save('customers');
    }
    var order = {
      id: id, customerId: cust.id, customer: info.name, phone: info.phone, email: info.email || '',
      city: info.city, address: info.address, note: info.note || '',
      items: db.cart.map(function (l) { return { id: l.id, slug: l.slug, name: l.name, size: l.size, color: l.color, qty: l.qty, price: l.price }; }),
      subtotal: t.sub, discount: t.discount, shipping: t.shipping, total: t.total,
      coupon: t.coupon ? t.coupon.code : '', payment: info.payment || 'COD',
      status: 'new', createdAt: Date.now()
    };
    /* decrement inventory */
    db.cart.forEach(function (l) {
      var p = productById(l.id);
      if (p) p.stock[l.size] = Math.max(0, (+p.stock[l.size] || 0) - l.qty);
    });
    if (t.coupon) { t.coupon.uses = (t.coupon.uses || 0) + 1; save('coupons'); }
    db.orders.unshift(order); save('orders'); save('products');
    clearCart();
    db.me = { name: info.name, phone: info.phone, email: info.email || '', city: info.city, address: info.address };
    save('me');
    return { ok: true, order: order };
  }
  function myOrders() {
    if (!db.me) return [];
    return db.orders.filter(function (o) { return o.phone === db.me.phone; });
  }

  /* ---------- analytics for admin ---------- */
  function stats() {
    var now = Date.now(), d30 = now - 30 * 86400000, d60 = now - 60 * 86400000;
    var live = db.orders.filter(function (o) { return o.status !== 'cancelled'; });
    var cur = live.filter(function (o) { return o.createdAt >= d30; });
    var prev = live.filter(function (o) { return o.createdAt < d30 && o.createdAt >= d60; });
    var sum = function (a) { return a.reduce(function (x, o) { return x + o.total; }, 0); };
    var sold = {};
    live.forEach(function (o) { o.items.forEach(function (i) { sold[i.id] = (sold[i.id] || 0) + i.qty; }); });
    var best = Object.keys(sold).map(function (id) { return { p: productById(id), qty: sold[id] }; })
      .filter(function (x) { return x.p; }).sort(function (a, b) { return b.qty - a.qty; }).slice(0, 6);
    var low = products({ all: true }).map(function (p) {
      return { p: p, total: totalStock(p), zeros: Object.keys(p.stock).filter(function (s) { return !p.stock[s]; }).length };
    }).filter(function (x) { return x.total < 24; }).sort(function (a, b) { return a.total - b.total; }).slice(0, 8);
    var rev = sum(cur), prevRev = sum(prev);
    var series = [];
    for (var i = 13; i >= 0; i--) {
      var s0 = now - i * 86400000, dayStart = new Date(s0).setHours(0, 0, 0, 0);
      var dayEnd = dayStart + 86400000;
      series.push(sum(live.filter(function (o) { return o.createdAt >= dayStart && o.createdAt < dayEnd; })));
    }
    return {
      revenue: rev, revenueDelta: prevRev ? Math.round((rev - prevRev) / prevRev * 100) : 0,
      orders: cur.length, ordersDelta: prev.length ? Math.round((cur.length - prev.length) / prev.length * 100) : 0,
      aov: cur.length ? Math.round(rev / cur.length) : 0,
      pending: db.orders.filter(function (o) { return o.status === 'new' || o.status === 'confirmed'; }).length,
      customers: db.customers.length, best: best, low: low, series: series,
      unitsSold: live.reduce(function (a, o) { return a + o.items.reduce(function (x, i) { return x + i.qty; }, 0); }, 0)
    };
  }

  /* ---------- admin auth ---------- */
  var DEFAULT_PW = 'rivet2026';
  function fallbackHash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return 'f' + h.toString(16);
  }
  function hash(pw) {
    var salted = 'rivet$' + pw;
    if (root.crypto && root.crypto.subtle && root.isSecureContext) {
      return root.crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted)).then(function (buf) {
        return 's' + Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      });
    }
    return Promise.resolve(fallbackHash(salted));
  }
  function authRecord() {
    var a = ls('auth');
    if (!a) { a = { hash: null, attempts: 0, lockUntil: 0 }; ls('auth', a); }
    return a;
  }
  function ensureAuth() {
    var a = authRecord();
    if (a.hash) return Promise.resolve(a);
    return hash(DEFAULT_PW).then(function (h) { a.hash = h; ls('auth', a); return a; });
  }
  function login(pw) {
    return ensureAuth().then(function (a) {
      if (a.lockUntil && Date.now() < a.lockUntil) {
        return { ok: false, msg: 'Too many attempts. Try again in ' + Math.ceil((a.lockUntil - Date.now()) / 1000) + 's.' };
      }
      return hash(pw).then(function (h) {
        if (h === a.hash) {
          a.attempts = 0; a.lockUntil = 0; ls('auth', a);
          try { sessionStorage.setItem(NS + 'adm', String(Date.now())); } catch (e) {}
          return { ok: true };
        }
        a.attempts = (a.attempts || 0) + 1;
        if (a.attempts >= 5) { a.lockUntil = Date.now() + 60000; a.attempts = 0; }
        ls('auth', a);
        return { ok: false, msg: a.lockUntil ? 'Locked for 60 seconds.' : 'Incorrect password.' };
      });
    });
  }
  function changePw(oldPw, newPw) {
    return login(oldPw).then(function (r) {
      if (!r.ok) return r;
      return hash(newPw).then(function (h) {
        var a = authRecord(); a.hash = h; ls('auth', a);
        return { ok: true };
      });
    });
  }
  function isAdmin() {
    try {
      var t = sessionStorage.getItem(NS + 'adm');
      if (!t) return false;
      if (Date.now() - (+t) > 3600000) { logout(); return false; }
      return true;
    } catch (e) { return false; }
  }
  function touchAdmin() { try { sessionStorage.setItem(NS + 'adm', String(Date.now())); } catch (e) {} }
  function logout() { try { sessionStorage.removeItem(NS + 'adm'); } catch (e) {} }

  /* ---------- recent searches ---------- */
  function addRecent(term) {
    term = (term || '').trim(); if (!term) return;
    db.recent = [term].concat(db.recent.filter(function (t) { return t.toLowerCase() !== term.toLowerCase(); })).slice(0, 6);
    save('recent');
  }

  boot();

  root.Store = {
    db: db, save: save, boot: boot, hardReset: hardReset, ls: ls, clone: clone,
    on: on, off: off, emit: emit, pkr: pkr,
    products: products, product: product, productById: productById, query: query,
    images: images, thumb: thumb, totalStock: totalStock, priceOf: priceOf, discountPct: discountPct,
    addToCart: addToCart, setQty: setQty, removeLine: removeLine, clearCart: clearCart,
    bundleDiscount: bundleDiscount,
    cartCount: cartCount, totals: totals, findCoupon: findCoupon,
    wished: wished, toggleWish: toggleWish,
    placeOrder: placeOrder, myOrders: myOrders, stats: stats,
    login: login, logout: logout, isAdmin: isAdmin, touchAdmin: touchAdmin, changePw: changePw,
    ensureAuth: ensureAuth, DEFAULT_PW: DEFAULT_PW,
    addRecent: addRecent,
    get content() { return db.content; }, get seo() { return db.seo; }
  };
})(typeof window !== 'undefined' ? window : this);
