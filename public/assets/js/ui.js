/* ============================================================
   UI — shared components: overlays, cards, cart, search, toasts
   ============================================================ */
(function (root, doc) {
  'use strict';
  var St = root.Store, F = root.Fabric, S = root.SEED;

  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
    return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]; }); }
  function fitLabel(f) { return S.FIT_LABELS[f] || f; }
  function washLabel(w) { return F.washName(w); }

  /* ---------- toasts ---------- */
  function toast(msg, kind) {
    var box = $('#toasts');
    var t = doc.createElement('div');
    t.className = 'toast' + (kind === 'err' ? ' toast--err' : '');
    t.innerHTML = msg;
    box.appendChild(t);
    setTimeout(function () {
      t.classList.add('is-out');
      setTimeout(function () { t.remove(); }, 320);
    }, kind === 'err' ? 3800 : 2600);
  }

  /* ---------- overlay plumbing ---------- */
  var openEl = null, lastFocus = null;
  function lockScroll(on) { doc.body.classList.toggle('no-scroll', !!on); }
  function showScrim(on) {
    var s = $('#scrim');
    if (on) { s.hidden = false; requestAnimationFrame(function () { s.classList.add('is-on'); }); }
    else { s.classList.remove('is-on'); setTimeout(function () { s.hidden = true; }, 300); }
  }
  function openOverlay(el, cls) {
    closeOverlay(true);
    lastFocus = doc.activeElement;
    openEl = el;
    el.hidden = false;
    showScrim(true); lockScroll(true);
    requestAnimationFrame(function () {
      el.classList.add(cls || 'is-open');
      var f = el.querySelector('input:not([type=hidden]),button,[href],select');
      if (f && !('ontouchstart' in root)) f.focus();
    });
  }
  function closeOverlay(silent) {
    if (!openEl) { if (!silent) { showScrim(false); lockScroll(false); } return; }
    var el = openEl; openEl = null;
    el.classList.remove('is-open');
    setTimeout(function () { el.hidden = true; }, 420);
    if (!silent) { showScrim(false); lockScroll(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  }
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlay(); });

  /* focus trap */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !openEl) return;
    var f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', openEl)
      .filter(function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- generic sheet & modal ---------- */
  function sheet(title, body, foot) {
    var el = $('#sheet');
    el.innerHTML = '<div class="sheet__grip"></div>' +
      '<div class="ov__head"><h2 id="sheet-title">' + esc(title) + '</h2>' +
      '<button class="x" data-close aria-label="Close">' + iconX() + '</button></div>' +
      '<div class="ov__body">' + body + '</div>' +
      (foot ? '<div class="ov__foot">' + foot + '</div>' : '');
    el.setAttribute('aria-labelledby', 'sheet-title');
    openOverlay(el);
    return el;
  }
  function modal(body, opts) {
    var el = $('#modal');
    el.innerHTML = '<div class="modal__card">' + body + '</div>';
    el.hidden = false;
    lastFocus = doc.activeElement; openEl = el;
    showScrim(true); lockScroll(true);
    requestAnimationFrame(function () {
      el.classList.add('is-open');
      var f = el.querySelector('input,button');
      if (f && !(opts && opts.nofocus)) f.focus();
    });
    return el;
  }
  function iconX() { return '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'; }
  function iconHeart(f) { return '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" ' + (f ? 'fill="currentColor"' : 'fill="none"') + '><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.9C19.5 15.4 12 20 12 20Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'; }

  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]') || e.target.id === 'scrim') closeOverlay();
  });

  /* ---------- counters ---------- */
  function refreshCounts() {
    var c = St.cartCount(), w = St.db.wish.length;
    $$('[data-cart-count]').forEach(function (n) { n.textContent = c; n.hidden = !c; });
    $$('[data-wish-count]').forEach(function (n) { n.textContent = w; n.hidden = !w; });
  }

  /* ---------- product card ---------- */
  function card(p, opts) {
    opts = opts || {};
    var imgs = St.images(p), out = St.totalStock(p) === 0;
    var price = St.priceOf(p), off = St.discountPct(p);
    var isNew = (p.collections || []).indexOf('new-arrivals') > -1;
    var isBest = (p.collections || []).indexOf('best-sellers') > -1;
    var sizes = S.KID_SIZES;
    var inStock = sizes.filter(function (s) { return (+p.stock[s] || 0) > 0; });
    var href = '/product/' + p.slug;

    /* One badge, not five. Strongest signal wins. */
    var badge = '';
    if (out)          badge = '<span class="badge badge--out">Sold out</span>';
    else if (off)     badge = '<span class="badge badge--sale">' + off + '% off</span>';
    else if (isBest)  badge = '<span class="badge badge--best">Bestseller</span>';
    else if (isNew)   badge = '<span class="badge badge--new">New</span>';

    return '<article class="card' + (out ? ' is-out' : '') + '" data-slug="' + esc(p.slug) + '">' +
      '<div class="card__media">' +
        '<a class="card__link" href="' + href + '" data-link tabindex="-1" aria-hidden="true">' +
          '<img class="a" src="' + imgs[0] + '" alt="' + esc(p.name + ' — ' + fitLabel(p.fit) + ' fit kids denim in ' + washLabel(p.wash)) + '" loading="lazy" decoding="async" width="800" height="1200">' +
          '<img class="b" src="' + imgs[1] + '" alt="' + esc(p.name + ' — waist and front detail') + '" loading="lazy" decoding="async" width="800" height="1200">' +
        '</a>' +
        (badge ? '<div class="card__badges">' + badge + '</div>' : '') +
        '<button class="card__wish' + (St.wished(p.id) ? ' is-on' : '') + '" data-wish="' + esc(p.id) + '" ' +
          'aria-label="' + (St.wished(p.id) ? 'Remove ' : 'Save ') + esc(p.name) + ' to wishlist" aria-pressed="' + St.wished(p.id) + '">' + iconHeart(St.wished(p.id)) + '</button>' +
        (out ? '' : '<div class="card__quick"><button class="btn btn--sm" data-quick="' + esc(p.slug) + '">Quick add</button></div>') +
      '</div>' +
      '<div class="card__body">' +
        '<a href="' + href + '" data-link><h3 class="card__name">' + esc(p.name) + '</h3></a>' +
        '<p class="card__meta">' + esc(fitLabel(p.fit)) + ' · ' + esc(washLabel(p.wash)) + '</p>' +
        '<div class="card__price"><b>' + St.pkr(price) + '</b>' +
          (p.salePrice ? '<s>' + St.pkr(p.price) + '</s>' : '') +
        '</div>' +
        (opts.nosizes || out ? '' :
          '<button class="card__sizetoggle" data-sizes aria-expanded="false">' +
            inStock.length + ' size' + (inStock.length === 1 ? '' : 's') +
            '<svg viewBox="0 0 12 8" width="9" height="7" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>' +
          '</button>' +
          '<div class="card__sizes">' + sizes.map(function (x) {
            return '<span class="' + ((+p.stock[x] || 0) > 0 ? '' : 'off') + '">' + x + '</span>';
          }).join('') + '</div>') +
      '</div>' +
    '</article>';
  }

  /* Press-and-hold peeks the second shot on touch, without eating the tap. */
  function wireCardPeek() {
    var start = function (e) {
      var c = e.target.closest && e.target.closest('.card');
      if (c) c.classList.add('peek');
    };
    var end = function () {
      $$('.card.peek').forEach(function (c) { c.classList.remove('peek'); });
    };
    doc.addEventListener('touchstart', start, { passive: true });
    doc.addEventListener('touchend', end, { passive: true });
    doc.addEventListener('touchcancel', end, { passive: true });
  }

  /* brass rivet + tick, popped at the button that was pressed */
  function rivetBurst(el) {
    if (!el || !el.getBoundingClientRect) return;
    var b = el.getBoundingClientRect();
    var n = doc.createElement('div');
    n.className = 'burst';
    n.style.left = (b.left + b.width / 2) + 'px';
    n.style.top = (b.top + b.height / 2) + 'px';
    n.innerHTML = '<span class="burst__ring"></span>' +
      '<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">' +
      '<defs><radialGradient id="bg1" cx="34%" cy="28%">' +
      '<stop offset="0" stop-color="#F5D2A4"/><stop offset="55%" stop-color="#B87333"/><stop offset="100%" stop-color="#6E3D13"/>' +
      '</radialGradient></defs>' +
      '<circle cx="24" cy="24" r="20" fill="url(#bg1)"/>' +
      '<path d="m15 24.5 6 6 12-12" fill="none" stroke="#FCF3E6" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    doc.body.appendChild(n);
    $$('[data-cart-count]').forEach(function (d) {
      d.classList.remove('bump'); void d.offsetWidth; d.classList.add('bump');
    });
    setTimeout(function () { n.remove(); }, 700);
  }

  function skeletonGrid(n) {
    var o = '';
    for (var i = 0; i < (n || 8); i++) {
      o += '<div class="card"><div class="sk sk-card__m"></div><div class="sk sk-line w60"></div><div class="sk sk-line w35"></div></div>';
    }
    return '<div class="grid">' + o + '</div>';
  }

  function emptyState(icon, title, body, ctaLabel, ctaHref) {
    return '<div class="empty">' + icon + '<h3 class="h-md">' + esc(title) + '</h3><p>' + esc(body) + '</p>' +
      (ctaLabel ? '<a class="btn" href="' + ctaHref + '" data-link>' + esc(ctaLabel) + '</a>' : '') + '</div>';
  }
  var ICONS = {
    bag: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 16h24l-2 24H14l-2-24Z" stroke-linejoin="round"/><path d="M18 16v-3a6 6 0 0 1 12 0v3"/></svg>',
    heart: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M24 40S9 30.6 9 21.2A8.2 8.2 0 0 1 24 16.4a8.2 8.2 0 0 1 15 4.8C39 30.6 24 40 24 40Z" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="21" cy="21" r="13"/><path d="m31 31 9 9" stroke-linecap="round"/></svg>',
    box: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m24 6 16 8v20l-16 8-16-8V14l16-8Z" stroke-linejoin="round"/><path d="M8 14l16 8 16-8M24 22v20"/></svg>',
    alert: '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="24" cy="24" r="17"/><path d="M24 15v12M24 32v1.5" stroke-linecap="round"/></svg>'
  };

  /* ---------- quick add ---------- */
  function quickAdd(slug) {
    var p = St.product(slug); if (!p) return;
    var body =
      '<div style="display:flex;gap:14px;margin-bottom:18px">' +
        '<img src="' + St.thumb(p, 0) + '" alt="' + esc(p.name) + '" width="86" height="108" style="width:86px;height:108px;object-fit:cover;border-radius:6px" loading="lazy">' +
        '<div><h3 class="h-sm">' + esc(p.name) + '</h3>' +
        '<p class="small dim" style="margin-top:3px">' + esc(fitLabel(p.fit)) + ' · ' + esc(washLabel(p.wash)) + '</p>' +
        '<div class="card__price" style="margin-top:7px"><b>' + St.pkr(St.priceOf(p)) + '</b>' +
        (p.salePrice ? '<s>' + St.pkr(p.price) + '</s>' : '') + '</div></div>' +
      '</div>' +
      '<div class="block__lbl"><h3>Select size</h3><button data-sizeguide="' + esc(p.slug) + '">Size guide</button></div>' +
      '<div class="sizes" role="radiogroup" aria-label="Size">' + S.KID_SIZES.map(function (s) {
        var st = +p.stock[s] || 0;
        return '<button class="sizeopt' + (st === 0 ? ' is-out' : st <= 3 ? ' is-low' : '') + '" role="radio" aria-checked="false"' +
          (st === 0 ? ' aria-disabled="true" tabindex="-1"' : '') + ' data-size="' + s + '">' + s + '</button>';
      }).join('') + '</div>' +
      '<p class="small dim" style="margin-top:10px" data-qa-hint>Sizes run true to age. Between sizes? Take the larger.</p>';
    var foot = '<button class="btn btn--block" data-qa-add disabled>Select a size</button>';
    var el = sheet('Quick add', body, foot);
    var chosen = null;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-size]');
      if (b) {
        $$('.sizeopt', el).forEach(function (n) { n.classList.remove('is-on'); n.setAttribute('aria-checked', 'false'); });
        b.classList.add('is-on'); b.setAttribute('aria-checked', 'true'); chosen = b.dataset.size;
        var add = $('[data-qa-add]', el);
        add.disabled = false; add.textContent = 'Add ' + chosen + ' — ' + St.pkr(St.priceOf(p));
        var left = +p.stock[chosen] || 0;
        $('[data-qa-hint]', el).textContent = left <= 3 ? 'Only ' + left + ' left in ' + chosen + '.' : 'In stock · ships in 1–2 days.';
      }
      if (e.target.closest('[data-qa-add]') && chosen) {
        var r = St.addToCart(p, chosen, null, 1);
        if (r.ok) { rivetBurst(e.target.closest('[data-qa-add]')); closeOverlay(); toast('Added <b>' + esc(p.name) + '</b> · ' + chosen); setTimeout(openCart, 420); }
        else toast(r.msg, 'err');
      }
    });
  }

  /* ---------- size guide ---------- */
  function sizeGuide(slug, current) {
    var rows = S.SIZE_GUIDE.map(function (r) {
      return '<tr class="' + (r.size === current ? 'is-on' : '') + '"><td>' + r.size + '</td><td>' + r.age + '</td><td>' +
        r.height + '</td><td>' + r.waist + '</td><td>' + r.inseam + '</td></tr>';
    }).join('');
    sheet('Size guide', 
      '<p class="small dim" style="margin-bottom:14px">Measurements in centimetres. Measure a pair that already fits and match the waist first.</p>' +
      '<div style="overflow-x:auto"><table class="sgtable"><thead><tr><th>Size</th><th>Age</th><th>Height</th><th>Waist</th><th>Inseam</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="acc" style="margin-top:22px"><details open><summary>Between two sizes?</summary><div class="acc__body">Take the larger. Every pair has an internal adjustable waist tab from 5Y up, so a size up still fits now.</div></details>' +
      '<details><summary>Adult sizing</summary><div class="acc__body">Men\'s waist 28–38 and women\'s 24–32 are in development for the next drop. The kids block scales to them directly.</div></details></div>');
  }

  /* ---------- cart drawer ---------- */
  var couponCode = '';
  function cartHTML() {
    var lines = St.db.cart, t = St.totals(couponCode);
    if (!lines.length) {
      return { body: emptyState(ICONS.bag, 'Your cart is empty', 'Nothing here yet. Start with the fits that keep selling out.', 'Shop best sellers', '/collections/best-sellers'), foot: '' };
    }
    var body = '';
    var pct = Math.min(100, Math.round((t.sub / St.content.freeShipOver) * 100));
    if (t.toFree > 0) {
      body += '<div class="shipbar"><p>Rs ' + t.toFree.toLocaleString('en-PK') + ' away from <b>free delivery</b></p>' +
        '<div><i style="width:0" data-w="' + pct + '"></i></div></div>';
    } else {
      body += '<div class="shipbar is-done"><p><b>Free delivery</b> unlocked on this order</p><div><i style="width:0" data-w="100"></i></div></div>';
    }
    if (St.content.bundleActive && t.bundleShort > 0) {
      body += '<a class="nudge" href="/shop" data-link>' +
        '<b>Add ' + t.bundleShort + ' more</b> for the ' + St.pkr(St.content.bundlePrice) + ' two-pair bundle' +
        '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></a>';
    }
    body += lines.map(function (l) {
      var p = St.productById(l.id);
      var left = p ? (+p.stock[l.size] || 0) : 0;
      return '<div class="line" data-key="' + esc(l.key) + '">' +
        '<a href="/product/' + esc(l.slug) + '" data-link aria-label="' + esc(l.name) + '"><img src="' + (p ? St.thumb(p, 0, l.color) : '') + '" alt="' + esc(l.name) + '" loading="lazy"></a>' +
        '<div><a href="/product/' + esc(l.slug) + '" data-link><p class="line__nm">' + esc(l.name) + '</p></a>' +
        '<p class="line__va">' + esc(l.size) + ' · ' + esc(washLabel(l.color)) + (left <= 3 && left > 0 ? ' · <span style="color:var(--warn)">only ' + left + ' left</span>' : '') + '</p>' +
        '<div class="line__bot"><div class="qty">' +
          '<button data-qty="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">' + l.qty + '</span>' +
          '<button data-qty="1" aria-label="Increase quantity">+</button></div>' +
        '<span class="line__pr">' + St.pkr(l.price * l.qty) + '</span></div>' +
        '<button class="line__rm" data-rm style="margin-top:8px">Remove</button></div></div>';
    }).join('');

    var foot = (t.coupon
      ? '<div class="applied">' + esc(t.coupon.code) + ' applied · ' + esc(t.coupon.note) + '<button data-uncoupon aria-label="Remove coupon">' + iconX() + '</button></div>'
      : '<form class="coupon" data-coupon><input name="code" placeholder="Discount code" aria-label="Discount code" value="' + esc(couponCode) + '"><button class="btn btn--ghost btn--sm" type="submit">Apply</button></form>') +
      (t.err ? '<p class="small" style="color:var(--err);margin:-6px 0 12px">' + esc(t.err) + '</p>' : '') +
      '<div class="sums">' +
        '<div><span>Subtotal</span><span>' + St.pkr(t.sub) + '</span></div>' +
        (t.bundle ? '<div class="disc"><span>' + esc(St.content.bundleTitle) + '</span><span>−' + St.pkr(t.bundle) + '</span></div>' : '') +
        (t.discount - t.bundle > 0 ? '<div class="disc"><span>Discount</span><span>−' + St.pkr(t.discount - t.bundle) + '</span></div>' : '') +
        '<div><span>Delivery</span><span>' + (t.shipping ? St.pkr(t.shipping) : 'Free') + '</span></div>' +
        '<div class="tot"><span>Total</span><span>' + St.pkr(t.total) + '</span></div>' +
      '</div>' +
      '<a class="btn btn--block" href="/checkout" data-link data-checkout>Checkout · ' + St.pkr(t.total) + '</a>' +
      '<p class="small dim" style="text-align:center;margin-top:10px">Cash on delivery available nationwide</p>';
    return { body: body, foot: foot };
  }

  function growBars(scope) {
    requestAnimationFrame(function () {
      $$('.shipbar i[data-w]', scope).forEach(function (n) { n.style.width = n.dataset.w + '%'; });
    });
  }

  function renderCart() {
    var el = $('#cart-drawer');
    if (el.hidden) return;
    var c = cartHTML();
    $('.ov__body', el).innerHTML = c.body;
    var f = $('.ov__foot', el);
    if (c.foot) { f.hidden = false; f.innerHTML = c.foot; } else { f.hidden = true; f.innerHTML = ''; }
    $('#cart-title', el).textContent = 'Cart (' + St.cartCount() + ')';
    growBars(el);
  }

  function openCart() {
    var el = $('#cart-drawer'), c = cartHTML();
    el.innerHTML = '<div class="ov__head"><h2 id="cart-title">Cart (' + St.cartCount() + ')</h2>' +
      '<button class="x" data-close aria-label="Close cart">' + iconX() + '</button></div>' +
      '<div class="ov__body">' + c.body + '</div>' +
      '<div class="ov__foot"' + (c.foot ? '' : ' hidden') + '>' + c.foot + '</div>';
    openOverlay(el);
    growBars(el);
    el.onclick = function (e) {
      var line = e.target.closest('.line'), key = line && line.dataset.key;
      var q = e.target.closest('[data-qty]');
      if (q && key) {
        var l = St.db.cart.filter(function (x) { return x.key === key; })[0];
        if (l) St.setQty(key, l.qty + (+q.dataset.qty));
        renderCart(); return;
      }
      if (e.target.closest('[data-rm]') && key) { St.removeLine(key); renderCart(); toast('Removed from cart'); return; }
      if (e.target.closest('[data-uncoupon]')) { couponCode = ''; renderCart(); return; }
      if (e.target.closest('[data-checkout]')) { closeOverlay(); }
    };
    el.onsubmit = function (e) {
      if (!e.target.closest('[data-coupon]')) return;
      e.preventDefault();
      var code = e.target.code.value.trim();
      couponCode = code;
      var t = St.totals(code);
      if (t.coupon) toast('<b>' + esc(t.coupon.code) + '</b> applied'); else if (t.err) toast(t.err, 'err');
      renderCart();
    };
  }
  function currentCoupon() { return couponCode; }
  function setCoupon(c) { couponCode = c; }

  /* ---------- nav drawer ---------- */
  function openNav() {
    var el = $('#navdrawer');
    var colls = S.COLLECTIONS.map(function (c) {
      return '<a href="/collections/' + c.slug + '" data-link>' + esc(c.title) + '</a>';
    }).join('');
    el.innerHTML = '<div class="ov__head" style="border-color:rgba(246,243,237,.14)">' +
        '<h2 style="color:var(--blue-300)">Menu</h2><button class="x" data-close aria-label="Close menu" style="color:var(--paper)">' + iconX() + '</button></div>' +
      '<div class="navd">' +
        '<a href="/shop" data-link><span>All denim</span></a>' +
        '<a href="/collections/new-arrivals" data-link><span>New arrivals</span></a>' +
        '<a href="/fit-finder" data-link><span>Fit finder</span><small>New</small></a>' +
        '<h4>Collections</h4><div class="sub">' + colls + '</div>' +
        '<h4>Coming soon</h4>' +
        '<a href="/shop?gender=men" data-link><span>Men</span><small>Soon</small></a>' +
        '<a href="/shop?gender=women" data-link><span>Women</span><small>Soon</small></a>' +
        '<h4>Help</h4><div class="sub">' +
          '<a href="/size-guide" data-link>Size guide</a>' +
          '<a href="/shipping-returns" data-link>Delivery &amp; returns</a>' +
          '<a href="/about" data-link>About Rivet &amp; Co.</a>' +
          '<a href="/account" data-link>Account &amp; orders</a>' +
        '</div>' +
        '<p style="margin-top:30px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--blue-400)">4–14Y now · Adult fits coming soon</p>' +
      '</div>';
    openOverlay(el);
  }

  /* ---------- search layer ---------- */
  var searchTimer = null;
  function openSearch() {
    var el = $('#searchlayer');
    el.innerHTML =
      '<div class="searchtop">' +
        '<label class="vh" for="q">Search products</label>' +
        '<input id="q" type="search" placeholder="Search jeans, joggers, washes…" autocomplete="off" enterkeyhint="search">' +
        '<button class="x" data-close aria-label="Close search">' + iconX() + '</button>' +
      '</div><div class="searchres" id="searchres"></div>';
    el.hidden = false; lockScroll(true); openEl = el; showScrim(false);
    requestAnimationFrame(function () { el.classList.add('is-open'); $('#q', el).focus(); });
    renderSearch('');
    var input = $('#q', el);
    input.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var v = input.value;
      $('#searchres').innerHTML = '<p class="small dim">Searching…</p>';
      searchTimer = setTimeout(function () { renderSearch(v); }, 180);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim()) {
        St.addRecent(input.value.trim());
        closeOverlay();
        root.Router.go('/shop?q=' + encodeURIComponent(input.value.trim()));
      }
    });
    el.addEventListener('click', function (e) {
      var s = e.target.closest('[data-term]');
      if (s) { input.value = s.dataset.term; renderSearch(s.dataset.term); input.focus(); }
      if (e.target.closest('a[data-link]')) { closeOverlay(); }
    });
  }
  function renderSearch(term) {
    var box = $('#searchres'); if (!box) return;
    term = (term || '').trim();
    if (!term) {
      var recent = St.db.recent;
      box.innerHTML =
        (recent.length ? '<h4 class="eyebrow">Recent</h4><div class="sugg">' + recent.map(function (t) {
          return '<button data-term="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' : '') +
        '<h4 class="eyebrow" style="margin-top:' + (recent.length ? '22px' : '0') + '">Popular</h4>' +
        '<div class="sugg">' + ['Joggers','Slim fit','Acid wash','Dark wash','9-10Y','Under Rs 3,500'].map(function (t) {
          return '<button data-term="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
        '<h4 class="eyebrow" style="margin-top:26px">Best sellers</h4>' +
        St.query({ collection: 'best-sellers', sort: 'best' }).slice(0, 4).map(resultRow).join('');
      return;
    }
    var res = St.query({ q: term });
    if (!term.match(/[a-z]/i)) res = res;
    if (!res.length) {
      box.innerHTML = emptyState(ICONS.search, 'No matches for “' + esc(term) + '”',
        'Try a fit (slim, straight, jogger), a wash, or an age like 9-10Y.', 'Browse everything', '/shop');
      return;
    }
    box.innerHTML = '<p class="small dim" style="margin-bottom:8px">' + res.length + ' result' + (res.length > 1 ? 's' : '') + '</p>' +
      res.slice(0, 12).map(resultRow).join('') +
      (res.length > 12 ? '<a class="btn btn--ghost btn--block" style="margin-top:16px" href="/shop?q=' + encodeURIComponent(term) + '" data-link>See all ' + res.length + '</a>' : '');
  }
  function resultRow(p) {
    return '<a class="sres" href="/product/' + esc(p.slug) + '" data-link>' +
      '<img src="' + St.thumb(p, 0) + '" alt="' + esc(p.name) + '" loading="lazy">' +
      '<span><b>' + esc(p.name) + '</b><span>' + esc(fitLabel(p.fit)) + ' · ' + esc(washLabel(p.wash)) + ' · ' + St.pkr(St.priceOf(p)) + '</span></span></a>';
  }

  /* ---------- reveal on scroll ---------- */
  var io = null;
  function observeReveals(scope) {
    if (!('IntersectionObserver' in root)) { $$('.rv', scope).forEach(function (n) { n.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '140px 0px -4% 0px', threshold: .01 });
    $$('.rv:not(.in)', scope || doc).forEach(function (n) { io.observe(n); });
  }

  /* ---------- footer ---------- */
  function renderFooter() {
    var c = St.content;
    $('#ftr').innerHTML = '<div class="wrap"><div class="ftr__top">' +
      '<div><p class="ftr__word">RIVET <em>&amp;</em> CO.</p>' +
      '<p class="small" style="margin-top:14px;max-width:34ch">Everyday denim, cut and finished in Pakistan. Kids 4–14 now, adult fits next.</p>' +
      '<form class="ftr__news" data-news><label class="vh" for="nl">Email address</label>' +
      '<input id="nl" type="email" name="email" placeholder="Email address" required><button class="btn btn--brass btn--sm" type="submit">Join</button></form>' +
      '<p class="tiny" style="margin-top:9px;color:var(--blue-400)">First to know about drops. No noise.</p></div>' +
      '<div class="ftr__cols">' +
        '<div><h4>Shop</h4><ul>' + S.COLLECTIONS.slice(0, 5).map(function (x) {
          return '<li><a href="/collections/' + x.slug + '" data-link>' + esc(x.title) + '</a></li>'; }).join('') + '</ul></div>' +
        '<div><h4>Coming soon</h4><ul><li><a href="/shop?gender=men" data-link>Men</a></li><li><a href="/shop?gender=women" data-link>Women</a></li></ul></div>' +
        '<div><h4>Help</h4><ul>' +
          '<li><a href="/fit-finder" data-link>Fit finder</a></li>' +
          '<li><a href="/size-guide" data-link>Size guide</a></li>' +
          '<li><a href="/shipping-returns" data-link>Delivery &amp; returns</a></li>' +
          '<li><a href="https://wa.me/' + esc(c.whatsapp) + '" target="_blank" rel="noopener">WhatsApp us</a></li>' +
          '<li><a href="/account" data-link>Track an order</a></li></ul></div>' +
        '<div><h4>Brand</h4><ul><li><a href="/about" data-link>Our denim</a></li>' +
          '<li><a href="/shop" data-link>All products</a></li></ul></div>' +
      '</div></div>' +
      '<div class="ftr__bot"><span>© ' + new Date().getFullYear() + ' Rivet &amp; Co. · Made in Pakistan</span>' +
      '<span>Prices in PKR · COD nationwide</span></div></div>';
  }

  root.UI = {
    $: $, $$: $$, esc: esc, toast: toast, sheet: sheet, modal: modal, closeOverlay: closeOverlay,
    openOverlay: openOverlay, card: card, skeletonGrid: skeletonGrid, emptyState: emptyState, ICONS: ICONS,
    quickAdd: quickAdd, sizeGuide: sizeGuide, openCart: openCart, renderCart: renderCart, openNav: openNav,
    openSearch: openSearch, refreshCounts: refreshCounts, observeReveals: observeReveals,
    renderFooter: renderFooter, iconX: iconX, iconHeart: iconHeart, fitLabel: fitLabel, washLabel: washLabel,
    rivetBurst: rivetBurst, wireCardPeek: wireCardPeek, growBars: growBars,
    currentCoupon: currentCoupon, setCoupon: setCoupon
  };
})(window, document);
