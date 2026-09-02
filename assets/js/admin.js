/* ============================================================
   Admin — hidden entry (triple-tap wordmark) + dashboard.
   The gesture only reveals the login; the password gates access.
   NOTE: this is a client-side store, so admin auth is a UI gate,
   not a server boundary. See README before going live.
   ============================================================ */
(function (root, doc) {
  'use strict';
  var St = root.Store, F = root.Fabric, S = root.SEED, U = root.UI;
  var $ = U.$, $$ = U.$$, esc = U.esc, pkr = function (n) { return St.pkr(n); };

  var TABS = [
    ['overview', 'Overview'], ['products', 'Products'], ['orders', 'Orders'],
    ['customers', 'Customers'], ['coupons', 'Coupons'], ['content', 'Homepage'],
    ['seo', 'SEO'], ['settings', 'Settings']
  ];
  var ORDER_STATUSES = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  /* ---------------- login ---------------- */
  function loginModal(next) {
    var body =
      '<div class="wordmark" style="text-align:center;display:block">RIVET <em>&amp;</em> CO.</div>' +
      '<p class="sub" style="text-align:center;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin:6px 0 20px">Staff access</p>' +
      '<form data-login novalidate>' +
        '<label class="field"><span>Password</span><input name="pw" type="password" autocomplete="current-password" required autofocus></label>' +
        '<p class="small" data-err style="color:var(--err);margin:-6px 0 12px" hidden></p>' +
        '<button class="btn btn--block" type="submit">Sign in</button>' +
        '<button class="btn btn--ghost btn--block" style="margin-top:9px" type="button" data-close>Cancel</button>' +
      '</form>';
    var el = U.modal(body);
    var form = $('[data-login]', el);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span>';
      St.login(form.pw.value).then(function (r) {
        btn.disabled = false; btn.textContent = 'Sign in';
        if (r.ok) { U.closeOverlay(); root.Router.go(next || '/admin'); }
        else { var p = $('[data-err]', el); p.hidden = false; p.textContent = r.msg; form.pw.select(); }
      });
    });
  }

  /* triple-tap the wordmark */
  function wireGesture() {
    var taps = [], wm = $('#wordmark');
    if (!wm) return;
    wm.addEventListener('click', function (e) {
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 700; });
      taps.push(now);
      wm.classList.remove('tapping'); void wm.offsetWidth; wm.classList.add('tapping');
      if (taps.length >= 3) {
        /* stop the global data-link handler from navigating home and
           closing the modal we are about to open */
        e.preventDefault(); e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        taps = [];
        if (St.isAdmin()) root.Router.go('/admin'); else loginModal('/admin');
      }
    });
  }

  /* ---------------- gate ---------------- */
  function gate() {
    return {
      title: 'Staff access | Rivet & Co.', desc: '', noindex: true,
      html: '<div class="loginwrap"><div class="logincard">' +
        '<div class="wordmark" style="text-align:center;display:block">RIVET <em>&amp;</em> CO.</div>' +
        '<p class="sub">Staff access</p>' +
        '<form data-login novalidate>' +
          '<label class="field"><span>Password</span><input name="pw" type="password" autocomplete="current-password" required></label>' +
          '<p class="small" data-err style="color:var(--err);margin:-6px 0 12px" hidden></p>' +
          '<button class="btn btn--block" type="submit">Sign in</button>' +
          '<a class="btn btn--ghost btn--block" style="margin-top:9px" href="/" data-link>Back to store</a>' +
        '</form></div></div>',
      admin: true,
      mount: function (main) {
        var form = $('[data-login]', main);
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var btn = form.querySelector('button[type=submit]');
          btn.disabled = true; btn.innerHTML = '<span class="spin"></span>';
          St.login(form.pw.value).then(function (r) {
            btn.disabled = false; btn.textContent = 'Sign in';
            if (r.ok) root.Router.refresh();
            else { var p = $('[data-err]', main); p.hidden = false; p.textContent = r.msg; form.pw.select(); }
          });
        });
      }
    };
  }

  /* ---------------- shell ---------------- */
  function admin(ctx) {
    if (!St.isAdmin()) return gate();
    St.touchAdmin();
    var tab = (ctx.params && ctx.params.tab) || ctx.query.tab || 'overview';
    if (!TABS.some(function (t) { return t[0] === tab; })) tab = 'overview';

    var html = '<div class="adm">' +
      '<div class="adm__top"><span class="wordmark">RIVET <em>&amp;</em> CO.</span>' +
        '<span class="badge">Admin</span>' +
        '<a class="out" href="/" data-link style="margin-left:auto">View store</a>' +
        '<button class="out" data-logout style="margin-left:8px">Sign out</button></div>' +
      '<div class="admtabs" role="tablist">' + TABS.map(function (t) {
        return '<button role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'is-on' : '') + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="adm__body" data-adm>' + view(tab) + '</div></div>';

    return {
      title: 'Admin · ' + tab + ' | Rivet & Co.', desc: '', noindex: true, admin: true, html: html,
      mount: function (main) { mountAdmin(main, tab); }
    };
  }

  function view(tab) {
    if (tab === 'products')  return productsView();
    if (tab === 'orders')    return ordersView();
    if (tab === 'customers') return customersView();
    if (tab === 'coupons')   return couponsView();
    if (tab === 'content')   return contentView();
    if (tab === 'seo')       return seoView();
    if (tab === 'settings')  return settingsView();
    return overviewView();
  }

  /* ---------------- overview ---------------- */
  function overviewView() {
    var s = St.stats();
    var max = Math.max.apply(null, s.series.concat([1]));
    var bars = s.series.map(function (v, i) {
      var d = new Date(Date.now() - (13 - i) * 86400000);
      return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;align-items:center" title="' +
        d.toDateString() + ': ' + pkr(v) + '">' +
        '<div style="width:100%;height:' + Math.max(2, Math.round(v / max * 96)) + 'px;background:' +
        (i === 13 ? 'var(--brass)' : 'var(--indigo-600)') + ';border-radius:2px"></div>' +
        '<span style="font-size:9px;color:var(--muted)">' + d.getDate() + '</span></div>';
    }).join('');

    return '<div class="kpis">' +
      kpi('Revenue · 30d', pkr(s.revenue), s.revenueDelta) +
      kpi('Orders · 30d', s.orders, s.ordersDelta) +
      kpi('Avg order value', pkr(s.aov)) +
      kpi('Awaiting action', s.pending) +
    '</div>' +
    '<div class="admcard"><h3>Revenue · last 14 days</h3><div class="admcard__b">' +
      '<div style="display:flex;gap:4px;height:130px;align-items:flex-end">' + bars + '</div></div></div>' +
    '<div class="admgrid2">' +
      '<div class="admcard"><h3>Best sellers</h3><div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl"><tbody>' +
        s.best.map(function (b) {
          return '<tr><td style="width:50px"><img src="' + St.thumb(b.p, 0) + '" alt="" loading="lazy"></td>' +
            '<td><div class="nm">' + esc(b.p.name) + '</div><div class="sub">' + esc(U.fitLabel(b.p.fit)) + ' · ' + pkr(St.priceOf(b.p)) + '</div></td>' +
            '<td style="text-align:right"><b>' + b.qty + '</b><div class="sub">sold</div></td></tr>';
        }).join('') + '</tbody></table></div></div></div>' +
      '<div class="admcard"><h3>Low stock</h3><div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl"><tbody>' +
        (s.low.length ? s.low.map(function (l) {
          return '<tr><td style="width:50px"><img src="' + St.thumb(l.p, 0) + '" alt="" loading="lazy"></td>' +
            '<td><div class="nm">' + esc(l.p.name) + '</div><div class="sub">' + l.zeros + ' size' + (l.zeros === 1 ? '' : 's') + ' out</div></td>' +
            '<td style="text-align:right;width:100px"><div class="bar"><i style="width:' + Math.min(100, l.total / 40 * 100) + '%;background:' + (l.total < 8 ? 'var(--err)' : 'var(--warn)') + '"></i></div>' +
            '<div class="sub">' + l.total + ' units</div></td>' +
            '<td style="width:44px"><div class="miniact"><button data-edit="' + esc(l.p.id) + '" aria-label="Edit ' + esc(l.p.name) + '">' + pencil() + '</button></div></td></tr>';
        }).join('') : '<tr><td class="sub">Nothing running low.</td></tr>') + '</tbody></table></div></div></div>' +
    '</div>' +
    '<div class="admcard"><h3>Recent orders <button class="btn btn--ghost btn--sm" data-tab="orders">All orders</button></h3>' +
      '<div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
      St.db.orders.slice(0, 6).map(function (o) {
        return '<tr><td><b>' + esc(o.id) + '</b><div class="sub">' + when(o.createdAt) + '</div></td>' +
          '<td>' + esc(o.customer) + '<div class="sub">' + esc(o.city) + '</div></td>' +
          '<td>' + o.items.reduce(function (a, i) { return a + i.qty; }, 0) + '</td>' +
          '<td><b>' + pkr(o.total) + '</b></td>' +
          '<td><span class="pill pill--' + esc(o.status) + '">' + esc(o.status) + '</span></td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  }
  function kpi(label, val, delta) {
    return '<div class="kpi"><span>' + esc(label) + '</span><b>' + val + '</b>' +
      (delta === undefined ? '' : '<i class="' + (delta < 0 ? 'dn' : '') + '">' + (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '% vs prev 30d</i>') + '</div>';
  }
  function when(ts) {
    var d = Math.floor((Date.now() - ts) / 86400000);
    return d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago';
  }
  function pencil() { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke-linejoin="round"/></svg>'; }
  function trash() { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke-linejoin="round"/></svg>'; }
  function copyIcon() { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>'; }

  /* ---------------- products ---------------- */
  var pFilter = { q: '', status: 'all' };
  function productsView() {
    var list = St.products({ all: true }).filter(function (p) {
      if (pFilter.status === 'active' && p.active === false) return false;
      if (pFilter.status === 'hidden' && p.active !== false) return false;
      if (pFilter.status === 'sale' && !p.salePrice) return false;
      if (pFilter.status === 'out' && St.totalStock(p) > 0) return false;
      if (pFilter.q && (p.name + ' ' + p.slug).toLowerCase().indexOf(pFilter.q.toLowerCase()) < 0) return false;
      return true;
    });
    return '<div class="admcard"><h3>Products (' + list.length + ')' +
        '<button class="btn btn--sm" data-newproduct>+ Add product</button></h3>' +
      '<div class="admcard__b" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
        '<input data-psearch placeholder="Search products" value="' + esc(pFilter.q) + '" aria-label="Search products" style="flex:1;min-width:180px;min-height:40px;border:1px solid var(--line);border-radius:6px;padding:0 12px">' +
        '<div class="seg">' + [['all', 'All'], ['active', 'Live'], ['hidden', 'Hidden'], ['sale', 'On sale'], ['out', 'Sold out']].map(function (o) {
          return '<button data-pstatus="' + o[0] + '" class="' + (pFilter.status === o[0] ? 'is-on' : '') + '">' + o[1] + '</button>';
        }).join('') + '</div></div>' +
      '<div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl">' +
        '<thead><tr><th></th><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>' +
        (list.length ? list.map(function (p) {
          var t = St.totalStock(p);
          return '<tr><td style="width:50px"><img src="' + St.thumb(p, 0) + '" alt="" loading="lazy"></td>' +
            '<td><div class="nm">' + esc(p.name) + '</div><div class="sub">' + esc(U.fitLabel(p.fit)) + ' · ' + esc(U.washLabel(p.wash)) + ' · /' + esc(p.slug) + '</div></td>' +
            '<td><b>' + pkr(St.priceOf(p)) + '</b>' + (p.salePrice ? '<div class="sub"><s>' + pkr(p.price) + '</s></div>' : '') + '</td>' +
            '<td><b>' + t + '</b><div class="sub">' + Object.keys(p.stock).filter(function (s) { return !p.stock[s]; }).length + ' out</div></td>' +
            '<td><span class="pill ' + (p.active === false ? '' : 'pill--paid') + '">' + (p.active === false ? 'Hidden' : 'Live') + '</span></td>' +
            '<td><div class="miniact">' +
              '<button data-edit="' + esc(p.id) + '" aria-label="Edit">' + pencil() + '</button>' +
              '<button data-dup="' + esc(p.id) + '" aria-label="Duplicate">' + copyIcon() + '</button>' +
              '<button class="del" data-del="' + esc(p.id) + '" aria-label="Delete">' + trash() + '</button>' +
            '</div></td></tr>';
        }).join('') : '<tr><td colspan="6" class="sub" style="padding:24px">No products match.</td></tr>') +
      '</tbody></table></div></div></div>';
  }

  function blankProduct() {
    return {
      id: 'P' + Date.now().toString().slice(-6), slug: '', name: '', gender: 'kids',
      fit: 'straight', wash: 'mid-blue', colors: [{ key: 'mid-blue', name: 'Mid Blue', hex: F.washColor('mid-blue') }],
      price: 3500, salePrice: null, collections: ['kids-4-14'],
      stock: S.KID_SIZES.reduce(function (a, s) { a[s] = 0; return a; }, {}),
      featured: false, description: '', fabric: '11 oz cotton denim, 98% cotton / 2% elastane',
      care: 'Machine wash cold, inside out. Tumble dry low.', ageRange: '4–14Y',
      seed: Math.floor(Math.random() * 900) + 100, rating: 4.5, reviews: 0, sold: 0,
      createdAt: Date.now(), active: true, seoTitle: '', seoDesc: '', images: null, sizeSet: 'kids'
    };
  }
  function sizesFor(p) {
    return p.sizeSet === 'men' ? S.MEN_SIZES : p.sizeSet === 'women' ? S.WOMEN_SIZES : S.KID_SIZES;
  }

  function productEditor(id) {
    var isNew = !id;
    var p = isNew ? blankProduct() : St.clone(St.productById(id));
    if (!p) return;
    var draft = p;

    function colorRows() {
      return (draft.colors || []).map(function (c, i) {
        return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">' +
          '<span class="swatch" style="width:38px;height:38px;flex:none"><i style="background:' + c.hex + '"></i></span>' +
          '<select data-colorkey="' + i + '" aria-label="Colour ' + (i + 1) + '" style="flex:1;min-height:40px;border:1px solid var(--line);border-radius:6px;padding:0 10px">' +
            Object.keys(F.WASHES).map(function (k) {
              return '<option value="' + k + '"' + (k === c.key ? ' selected' : '') + '>' + F.WASHES[k].name + '</option>'; }).join('') +
          '</select>' +
          ((draft.colors.length > 1) ? '<button class="miniact" data-rmcolor="' + i + '" aria-label="Remove colour"><span style="display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--line);border-radius:6px">' + trash() + '</span></button>' : '') +
          '</div>';
      }).join('') + '<button class="btn btn--ghost btn--sm" data-addcolor>+ Add colour</button>';
    }

    function invGrid() {
      var sizes = sizesFor(draft);
      var multi = (draft.colors || []).length > 1;
      if (!multi) {
        return '<div class="invgrid">' + sizes.map(function (s) {
          var v = +draft.stock[s] || 0;
          return '<div class="invcell' + (v === 0 ? ' is-zero' : '') + '"><span>' + s + '</span>' +
            '<input type="number" min="0" step="1" value="' + v + '" data-stock="' + s + '" aria-label="Stock for ' + s + '"></div>';
        }).join('') + '</div>';
      }
      draft.stockByColor = draft.stockByColor || {};
      return draft.colors.map(function (c, ci) {
        /* keep existing inventory on the primary colour; new colours start empty
           so adding a colour never silently reduces what is on the shelf */
        draft.stockByColor[c.key] = draft.stockByColor[c.key] || sizes.reduce(function (a, s) {
          a[s] = ci === 0 ? (+draft.stock[s] || 0) : 0; return a; }, {});
        return '<h4 style="font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin:14px 0 8px">' + esc(c.name) + '</h4>' +
          '<div class="invgrid">' + sizes.map(function (s) {
            var v = +draft.stockByColor[c.key][s] || 0;
            return '<div class="invcell' + (v === 0 ? ' is-zero' : '') + '"><span>' + s + '</span>' +
              '<input type="number" min="0" step="1" value="' + v + '" data-cstock="' + esc(c.key) + '|' + s + '" aria-label="Stock ' + esc(c.name) + ' ' + s + '"></div>';
          }).join('') + '</div>';
      }).join('');
    }

    function galleryHTML() {
      var custom = draft.images && draft.images.length;
      var imgs = custom ? draft.images : St.images(draft);
      return '<div class="imgman">' + imgs.map(function (src, i) {
        return '<figure><img src="' + src + '" alt="" loading="lazy">' +
          (i === 0 ? '<figcaption>Cover</figcaption>' : '') +
          (custom ? '<button data-rmimg="' + i + '" aria-label="Remove image ' + (i + 1) + '">×</button>' : '') +
          '</figure>';
      }).join('') + '</div>' +
      '<label class="drop" style="margin-top:10px">' +
        '<input type="file" accept="image/*" multiple data-upload hidden>' +
        (custom ? 'Add more images' : 'Upload photos to replace the generated shots') +
      '</label>' +
      (custom ? '<button class="btn btn--ghost btn--sm" style="margin-top:8px" data-usegenerated>Use generated denim shots instead</button>'
              : '<p class="small dim" style="margin-top:8px">Currently using generated denim shots for this wash and fit.</p>');
    }

    function body() {
      return '<div class="admgrid2">' +
        '<div>' +
          '<label class="field"><span>Product name</span><input data-f="name" value="' + esc(draft.name) + '" required></label>' +
          '<label class="field"><span>URL slug</span><input data-f="slug" value="' + esc(draft.slug) + '" placeholder="rivet-001-slim"></label>' +
          '<div class="field-row">' +
            '<label class="field"><span>Fit</span><select data-f="fit">' + Object.keys(S.FIT_LABELS).map(function (k) {
              return '<option value="' + k + '"' + (draft.fit === k ? ' selected' : '') + '>' + S.FIT_LABELS[k] + '</option>'; }).join('') + '</select></label>' +
            '<label class="field"><span>Primary wash</span><select data-f="wash">' + Object.keys(F.WASHES).map(function (k) {
              return '<option value="' + k + '"' + (draft.wash === k ? ' selected' : '') + '>' + F.WASHES[k].name + '</option>'; }).join('') + '</select></label>' +
          '</div>' +
          '<div class="field-row">' +
            '<label class="field"><span>Price (PKR)</span><input type="number" min="0" step="10" data-f="price" value="' + draft.price + '"></label>' +
            '<label class="field"><span>Sale price</span><input type="number" min="0" step="10" data-f="salePrice" value="' + (draft.salePrice || '') + '" placeholder="none"></label>' +
          '</div>' +
          '<label class="field"><span>Short description</span><textarea data-f="description">' + esc(draft.description) + '</textarea></label>' +
          '<label class="field"><span>Fabric</span><input data-f="fabric" value="' + esc(draft.fabric) + '"></label>' +
          '<label class="field"><span>Care</span><textarea data-f="care">' + esc(draft.care) + '</textarea></label>' +
          '<label class="check"><input type="checkbox" data-f="active"' + (draft.active !== false ? ' checked' : '') + '> Visible in store</label>' +
          '<label class="check"><input type="checkbox" data-f="featured"' + (draft.featured ? ' checked' : '') + '> Featured on homepage</label>' +
        '</div>' +
        '<div>' +
          '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Colours</h4>' +
          '<div data-colors>' + colorRows() + '</div>' +
          '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px">Size set</h4>' +
          '<div class="seg">' + [['kids', 'Kids 4–14Y'], ['men', 'Men 28–38'], ['women', 'Women 24–32']].map(function (o) {
            return '<button type="button" data-sizeset="' + o[0] + '" class="' + ((draft.sizeSet || 'kids') === o[0] ? 'is-on' : '') + '">' + o[1] + '</button>';
          }).join('') + '</div>' +
          '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px">Inventory</h4>' +
          '<div data-inv>' + invGrid() + '</div>' +
          '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px">Collections</h4>' +
          '<div class="fopts">' + S.COLLECTIONS.map(function (c) {
            var on = (draft.collections || []).indexOf(c.slug) > -1;
            return '<button type="button" class="fopt' + (on ? ' is-on' : '') + '" data-coll="' + c.slug + '" aria-pressed="' + on + '">' + esc(c.title) + '</button>';
          }).join('') + '</div>' +
          '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px">Images</h4>' +
          '<div data-gallery>' + galleryHTML() + '</div>' +
          '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px">SEO</h4>' +
          '<label class="field"><span>Meta title</span><input data-f="seoTitle" value="' + esc(draft.seoTitle || '') + '" placeholder="Auto from product name"></label>' +
          '<label class="field"><span>Meta description</span><textarea data-f="seoDesc" placeholder="Auto from description">' + esc(draft.seoDesc || '') + '</textarea></label>' +
        '</div>' +
      '</div>';
    }

    var el = U.sheet(isNew ? 'New product' : 'Edit product', body(),
      '<div style="display:flex;gap:9px"><button class="btn btn--ghost" data-close style="flex:1">Cancel</button>' +
      '<button class="btn" data-save style="flex:2">' + (isNew ? 'Create product' : 'Save changes') + '</button></div>');
    el.querySelector('.sheet__grip').insertAdjacentHTML('afterend', '');
    $('.sheet', doc) && ($('#sheet').style.maxHeight = '92vh');

    function rerenderInv() { $('[data-inv]', el).innerHTML = invGrid(); }
    function rerenderColors() { $('[data-colors]', el).innerHTML = colorRows(); }
    function rerenderGallery() { $('[data-gallery]', el).innerHTML = galleryHTML(); }

    el.addEventListener('input', function (e) {
      var f = e.target.closest('[data-f]');
      if (f) {
        var k = f.dataset.f;
        if (f.type === 'checkbox') draft[k] = f.checked;
        else if (k === 'price' || k === 'salePrice') draft[k] = f.value === '' ? (k === 'salePrice' ? null : 0) : +f.value;
        else draft[k] = f.value;
        if (k === 'wash' && draft.colors.length) { draft.colors[0] = { key: f.value, name: F.washName(f.value), hex: F.washColor(f.value) }; rerenderColors(); rerenderGallery(); }
        if (k === 'fit') rerenderGallery();
      }
      var st = e.target.closest('[data-stock]');
      if (st) { draft.stock[st.dataset.stock] = Math.max(0, +st.value || 0); st.closest('.invcell').classList.toggle('is-zero', !(+st.value)); }
      var cst = e.target.closest('[data-cstock]');
      if (cst) {
        var parts = cst.dataset.cstock.split('|');
        draft.stockByColor[parts[0]][parts[1]] = Math.max(0, +cst.value || 0);
        cst.closest('.invcell').classList.toggle('is-zero', !(+cst.value));
      }
    });
    el.addEventListener('change', function (e) {
      var ck = e.target.closest('[data-colorkey]');
      if (ck) {
        var i = +ck.dataset.colorkey, k = ck.value;
        draft.colors[i] = { key: k, name: F.washName(k), hex: F.washColor(k) };
        if (i === 0) draft.wash = k;
        rerenderColors(); rerenderInv(); rerenderGallery();
      }
      var up = e.target.closest('[data-upload]');
      if (up && up.files && up.files.length) handleUpload(up.files);
    });
    el.addEventListener('click', function (e) {
      if (e.target.closest('[data-addcolor]')) {
        var used = draft.colors.map(function (c) { return c.key; });
        var next = Object.keys(F.WASHES).filter(function (k) { return used.indexOf(k) < 0; })[0];
        if (!next) return U.toast('All washes already added', 'err');
        draft.colors.push({ key: next, name: F.washName(next), hex: F.washColor(next) });
        rerenderColors(); rerenderInv(); return;
      }
      var rc = e.target.closest('[data-rmcolor]');
      if (rc) { draft.colors.splice(+rc.dataset.rmcolor, 1); draft.wash = draft.colors[0].key; rerenderColors(); rerenderInv(); rerenderGallery(); return; }
      var ss = e.target.closest('[data-sizeset]');
      if (ss) {
        draft.sizeSet = ss.dataset.sizeset;
        var sizes = sizesFor(draft), ns = {};
        sizes.forEach(function (s) { ns[s] = +draft.stock[s] || 0; });
        draft.stock = ns; draft.stockByColor = null;
        draft.ageRange = draft.sizeSet === 'kids' ? '4–14Y' : draft.sizeSet === 'men' ? 'Men 28–38' : 'Women 24–32';
        $$('[data-sizeset]', el).forEach(function (b) { b.classList.toggle('is-on', b === ss); });
        rerenderInv(); return;
      }
      var cl = e.target.closest('[data-coll]');
      if (cl) {
        var slug = cl.dataset.coll, arr = draft.collections || (draft.collections = []);
        var i2 = arr.indexOf(slug);
        if (i2 > -1) arr.splice(i2, 1); else arr.push(slug);
        cl.classList.toggle('is-on'); cl.setAttribute('aria-pressed', i2 < 0); return;
      }
      var ri = e.target.closest('[data-rmimg]');
      if (ri) { draft.images.splice(+ri.dataset.rmimg, 1); if (!draft.images.length) draft.images = null; rerenderGallery(); return; }
      if (e.target.closest('[data-usegenerated]')) { draft.images = null; rerenderGallery(); return; }
      if (e.target.closest('[data-save]')) save();
    });

    function handleUpload(files) {
      var arr = Array.prototype.slice.call(files).slice(0, 6);
      var tooBig = arr.filter(function (f) { return f.size > 900 * 1024; });
      if (tooBig.length) U.toast('Images over 900 KB are skipped — resize first', 'err');
      var keep = arr.filter(function (f) { return f.size <= 900 * 1024; });
      if (!keep.length) return;
      var done = 0, out = draft.images ? draft.images.slice() : [];
      keep.forEach(function (file) {
        var r = new FileReader();
        r.onload = function () {
          out.push(r.result); done++;
          if (done === keep.length) { draft.images = out; rerenderGallery(); U.toast(keep.length + ' image' + (keep.length > 1 ? 's' : '') + ' added'); }
        };
        r.readAsDataURL(file);
      });
    }

    function save() {
      if (!draft.name.trim()) return U.toast('Product name is required', 'err');
      if (!draft.slug.trim()) draft.slug = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      var clash = St.products({ all: true }).filter(function (x) { return x.slug === draft.slug && x.id !== draft.id; });
      if (clash.length) return U.toast('That slug is already used', 'err');
      if (draft.salePrice && draft.salePrice >= draft.price) return U.toast('Sale price must be below the price', 'err');
      if (draft.stockByColor && draft.colors.length > 1) {
        sizesFor(draft).forEach(function (s) {
          draft.stock[s] = draft.colors.reduce(function (a, c) { return a + (+((draft.stockByColor[c.key] || {})[s]) || 0); }, 0);
        });
      }
      var list = St.db.products, i = -1;
      list.forEach(function (x, k) { if (x.id === draft.id) i = k; });
      if (i > -1) list[i] = draft; else list.unshift(draft);
      St.save('products');
      U.closeOverlay();
      U.toast(isNew ? 'Product created' : 'Saved <b>' + esc(draft.name) + '</b>');
      root.Router.refresh();
    }
  }

  /* ---------------- orders ---------------- */
  var oFilter = { status: 'all', q: '' };
  function ordersView() {
    var list = St.db.orders.filter(function (o) {
      if (oFilter.status !== 'all' && o.status !== oFilter.status) return false;
      if (oFilter.q && (o.id + ' ' + o.customer + ' ' + o.phone + ' ' + o.city).toLowerCase().indexOf(oFilter.q.toLowerCase()) < 0) return false;
      return true;
    });
    var rev = list.filter(function (o) { return o.status !== 'cancelled'; }).reduce(function (a, o) { return a + o.total; }, 0);
    return '<div class="admcard"><h3>Orders (' + list.length + ') · ' + pkr(rev) + '</h3>' +
      '<div class="admcard__b" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
        '<input data-osearch placeholder="Search order, name, phone" value="' + esc(oFilter.q) + '" aria-label="Search orders" style="flex:1;min-width:180px;min-height:40px;border:1px solid var(--line);border-radius:6px;padding:0 12px">' +
        '<div class="seg">' + [['all', 'All']].concat(ORDER_STATUSES.map(function (s) { return [s, s]; })).map(function (o) {
          return '<button data-ostatus="' + o[0] + '" class="' + (oFilter.status === o[0] ? 'is-on' : '') + '" style="text-transform:capitalize">' + o[1] + '</button>';
        }).join('') + '</div></div>' +
      '<div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl">' +
        '<thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>' +
        (list.length ? list.slice(0, 60).map(function (o) {
          return '<tr data-order="' + esc(o.id) + '" style="cursor:pointer">' +
            '<td><b>' + esc(o.id) + '</b><div class="sub">' + when(o.createdAt) + '</div></td>' +
            '<td>' + esc(o.customer) + '<div class="sub">' + esc(o.phone) + ' · ' + esc(o.city) + '</div></td>' +
            '<td>' + o.items.reduce(function (a, i) { return a + i.qty; }, 0) + '</td>' +
            '<td><b>' + pkr(o.total) + '</b></td>' +
            '<td class="sub">' + esc(o.payment) + '</td>' +
            '<td><select data-setstatus="' + esc(o.id) + '" aria-label="Status for ' + esc(o.id) + '" style="min-height:34px;border:1px solid var(--line);border-radius:6px;padding:0 8px;font-size:12px;text-transform:capitalize">' +
              ORDER_STATUSES.map(function (s) { return '<option' + (o.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
            '</select></td></tr>';
        }).join('') : '<tr><td colspan="6" class="sub" style="padding:24px">No orders match.</td></tr>') +
      '</tbody></table></div></div></div>';
  }
  function orderSheet(id) {
    var o = St.db.orders.filter(function (x) { return x.id === id; })[0];
    if (!o) return;
    U.sheet('Order ' + o.id,
      '<div class="panel"><h3>Customer</h3>' +
        '<div class="orow"><span class="dim">Name</span><span>' + esc(o.customer) + '</span></div>' +
        '<div class="orow"><span class="dim">Phone</span><span><a href="tel:' + esc(o.phone.replace(/\s/g, '')) + '">' + esc(o.phone) + '</a></span></div>' +
        '<div class="orow"><span class="dim">City</span><span>' + esc(o.city) + '</span></div>' +
        '<div class="orow"><span class="dim">Address</span><span style="text-align:right;max-width:60%">' + esc(o.address || '—') + '</span></div>' +
        (o.note ? '<div class="orow"><span class="dim">Note</span><span>' + esc(o.note) + '</span></div>' : '') +
      '</div>' +
      '<div class="panel"><h3>Items</h3>' + o.items.map(function (i) {
        return '<div class="orow"><span>' + esc(i.name) + '<div class="sub">' + esc(i.size) + ' · ' + esc(U.washLabel(i.color)) + ' × ' + i.qty + '</div></span><span>' + pkr(i.price * i.qty) + '</span></div>';
      }).join('') +
      '<div class="sums" style="margin-top:12px"><div><span>Subtotal</span><span>' + pkr(o.subtotal) + '</span></div>' +
      (o.discount ? '<div class="disc"><span>Discount' + (o.coupon ? ' (' + esc(o.coupon) + ')' : '') + '</span><span>−' + pkr(o.discount) + '</span></div>' : '') +
      '<div><span>Delivery</span><span>' + (o.shipping ? pkr(o.shipping) : 'Free') + '</span></div>' +
      '<div class="tot"><span>Total · ' + esc(o.payment) + '</span><span>' + pkr(o.total) + '</span></div></div></div>',
      '<div style="display:flex;gap:9px;align-items:center">' +
        '<select data-setstatus="' + esc(o.id) + '" style="flex:1;min-height:46px;border:1px solid var(--line);border-radius:6px;padding:0 12px;text-transform:capitalize">' +
          ORDER_STATUSES.map(function (s) { return '<option' + (o.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<a class="btn btn--brass" style="flex:1" target="_blank" rel="noopener" href="https://wa.me/' + esc(o.phone.replace(/\D/g, '').replace(/^0/, '92')) +
          '?text=' + encodeURIComponent('Rivet & Co. — order ' + o.id + ' update:') + '">WhatsApp</a>' +
      '</div>');
  }

  /* ---------------- customers ---------------- */
  function customersView() {
    var rows = St.db.customers.map(function (c) {
      var os = St.db.orders.filter(function (o) { return o.customerId === c.id && o.status !== 'cancelled'; });
      return { c: c, n: os.length, spend: os.reduce(function (a, o) { return a + o.total; }, 0), last: os.length ? Math.max.apply(null, os.map(function (o) { return o.createdAt; })) : c.createdAt };
    }).sort(function (a, b) { return b.spend - a.spend; });
    return '<div class="admcard"><h3>Customers (' + rows.length + ')</h3>' +
      '<div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl">' +
      '<thead><tr><th>Name</th><th>Phone</th><th>City</th><th>Orders</th><th>Spend</th><th>Last</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><div class="nm">' + esc(r.c.name) + '</div><div class="sub">' + esc(r.c.email || '') + '</div></td>' +
          '<td class="sub">' + esc(r.c.phone) + '</td><td class="sub">' + esc(r.c.city) + '</td>' +
          '<td><b>' + r.n + '</b></td><td><b>' + pkr(r.spend) + '</b></td>' +
          '<td class="sub">' + when(r.last) + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  }

  /* ---------------- coupons ---------------- */
  function couponsView() {
    return '<div class="admcard"><h3>Discount codes<button class="btn btn--sm" data-newcoupon>+ New code</button></h3>' +
      '<div class="admcard__b flush"><div class="tbl__scroll"><table class="tbl">' +
      '<thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min spend</th><th>Used</th><th>Status</th><th></th></tr></thead><tbody>' +
      St.db.coupons.map(function (c, i) {
        return '<tr><td><b>' + esc(c.code) + '</b><div class="sub">' + esc(c.note || '') + '</div></td>' +
          '<td class="sub" style="text-transform:capitalize">' + esc(c.type) + '</td>' +
          '<td>' + (c.type === 'percent' ? c.value + '%' : c.type === 'fixed' ? pkr(c.value) : 'Free ship') + '</td>' +
          '<td class="sub">' + (c.min ? pkr(c.min) : '—') + '</td>' +
          '<td>' + c.uses + (c.limit ? ' / ' + c.limit : '') + '</td>' +
          '<td><button class="pill ' + (c.active ? 'pill--paid' : '') + '" data-togglecoupon="' + i + '">' + (c.active ? 'Active' : 'Off') + '</button></td>' +
          '<td><div class="miniact"><button data-editcoupon="' + i + '" aria-label="Edit">' + pencil() + '</button>' +
          '<button class="del" data-delcoupon="' + i + '" aria-label="Delete">' + trash() + '</button></div></td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  }
  function couponEditor(i) {
    var isNew = i == null;
    var c = isNew ? { code: '', type: 'percent', value: 10, min: 0, uses: 0, limit: 0, active: true, note: '' } : St.clone(St.db.coupons[i]);
    var el = U.sheet(isNew ? 'New discount code' : 'Edit ' + c.code,
      '<label class="field"><span>Code</span><input data-c="code" value="' + esc(c.code) + '" style="text-transform:uppercase" placeholder="EID20"></label>' +
      '<label class="field"><span>Type</span><select data-c="type">' +
        ['percent', 'fixed', 'shipping'].map(function (t) { return '<option value="' + t + '"' + (c.type === t ? ' selected' : '') + '>' + (t === 'percent' ? 'Percent off' : t === 'fixed' ? 'Fixed amount off' : 'Free shipping') + '</option>'; }).join('') +
      '</select></label>' +
      '<div class="field-row">' +
        '<label class="field"><span>Value</span><input type="number" min="0" data-c="value" value="' + c.value + '"></label>' +
        '<label class="field"><span>Min spend (PKR)</span><input type="number" min="0" data-c="min" value="' + c.min + '"></label>' +
      '</div>' +
      '<label class="field"><span>Usage limit (0 = unlimited)</span><input type="number" min="0" data-c="limit" value="' + c.limit + '"></label>' +
      '<label class="field"><span>Note</span><input data-c="note" value="' + esc(c.note) + '"></label>' +
      '<label class="check"><input type="checkbox" data-c="active"' + (c.active ? ' checked' : '') + '> Active</label>',
      '<div style="display:flex;gap:9px"><button class="btn btn--ghost" data-close style="flex:1">Cancel</button>' +
      '<button class="btn" data-savecoupon style="flex:2">' + (isNew ? 'Create' : 'Save') + '</button></div>');
    el.addEventListener('input', function (e) {
      var f = e.target.closest('[data-c]'); if (!f) return;
      var k = f.dataset.c;
      c[k] = f.type === 'checkbox' ? f.checked : (['value', 'min', 'limit'].indexOf(k) > -1 ? +f.value || 0 : f.value);
    });
    el.addEventListener('change', function (e) { if (e.target.closest('[data-c="active"]')) c.active = e.target.checked; });
    el.addEventListener('click', function (e) {
      if (!e.target.closest('[data-savecoupon]')) return;
      c.code = (c.code || '').toUpperCase().trim();
      if (!c.code) return U.toast('Code is required', 'err');
      var clash = St.db.coupons.filter(function (x, k) { return x.code === c.code && k !== i; });
      if (clash.length) return U.toast('That code already exists', 'err');
      if (isNew) St.db.coupons.push(c); else St.db.coupons[i] = c;
      St.save('coupons'); U.closeOverlay(); U.toast('Saved <b>' + esc(c.code) + '</b>'); root.Router.refresh();
    });
  }

  /* ---------------- homepage content ---------------- */
  function contentView() {
    var c = St.content;
    return '<div class="admgrid2">' +
      '<div class="admcard"><h3>Hero</h3><div class="admcard__b">' +
        f('heroEyebrow', 'Eyebrow line', c.heroEyebrow) +
        f('heroTitle', 'Headline (HTML: use &lt;em&gt; for the serif accent)', c.heroTitle) +
        fArea('heroSub', 'Sub-line', c.heroSub) +
        '<div class="field-row">' + f('heroCta1', 'Button 1 label', c.heroCta1) + f('heroCta1Href', 'Button 1 link', c.heroCta1Href) + '</div>' +
        '<div class="field-row">' + f('heroCta2', 'Button 2 label', c.heroCta2) + f('heroCta2Href', 'Button 2 link', c.heroCta2Href) + '</div>' +
        '<label class="field"><span>Hero denim wash</span><select data-k="heroWash">' + Object.keys(F.WASHES).map(function (k) {
          return '<option value="' + k + '"' + (c.heroWash === k ? ' selected' : '') + '>' + F.WASHES[k].name + '</option>'; }).join('') + '</select></label>' +
      '</div></div>' +
      '<div class="admcard"><h3>Sections</h3><div class="admcard__b">' +
        f('quote', 'Pull quote (HTML)', c.quote) +
        f('editorialTitle', 'Editorial title', c.editorialTitle) +
        fArea('editorialBody', 'Editorial body', c.editorialBody) +
        f('soonTitle', 'Coming-soon title', c.soonTitle) +
        fArea('soonBody', 'Coming-soon body', c.soonBody) +
      '</div></div>' +
      '<div class="admcard"><h3>Store rules</h3><div class="admcard__b">' +
        '<div class="field-row">' +
          '<label class="field"><span>Free delivery over (PKR)</span><input type="number" data-k="freeShipOver" value="' + c.freeShipOver + '"></label>' +
          '<label class="field"><span>Flat delivery (PKR)</span><input type="number" data-k="flatShipping" value="' + c.flatShipping + '"></label>' +
        '</div>' +
        f('whatsapp', 'WhatsApp number (with country code)', c.whatsapp) +
      '</div></div>' +
      '<div class="admcard"><h3>Announcement ticker</h3><div class="admcard__b">' +
        fArea('announcements', 'One line per message', (c.announcements || []).join('\n')) +
      '</div></div>' +
    '</div>' +
    '<button class="btn" data-savecontent>Save homepage</button>' +
    '<button class="btn btn--ghost" style="margin-left:9px" data-preview>Preview store</button>';
  }
  function f(k, label, v) {
    return '<label class="field"><span>' + label + '</span><input data-k="' + k + '" value="' + esc(v) + '"></label>';
  }
  function fArea(k, label, v) {
    return '<label class="field"><span>' + label + '</span><textarea data-k="' + k + '">' + esc(v) + '</textarea></label>';
  }

  /* ---------------- SEO ---------------- */
  function seoView() {
    var s = St.seo;
    return '<div class="admgrid2">' +
      '<div class="admcard"><h3>Search</h3><div class="admcard__b">' +
        f2('title', 'Title tag', s.title, 60) +
        fArea2('description', 'Meta description', s.description, 160) +
        fArea2('keywords', 'Keywords', s.keywords) +
        f2('canonical', 'Canonical URL', s.canonical) +
      '</div></div>' +
      '<div class="admcard"><h3>Social &amp; browser</h3><div class="admcard__b">' +
        f2('twitter', 'Twitter handle', s.twitter) +
        '<label class="field"><span>Theme colour</span><input type="color" data-s="themeColor" value="' + esc(s.themeColor) + '" style="height:48px;padding:4px"></label>' +
        '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:6px 0 10px">Open Graph image</h4>' +
        '<div class="imgman"><figure><img src="' + esc(s.ogImage) + '" alt="Open Graph preview" style="aspect-ratio:1200/630"></figure></div>' +
        '<label class="drop" style="margin-top:10px"><input type="file" accept="image/*" hidden data-ogupload>Upload a 1200×630 image</label>' +
      '</div></div>' +
    '</div>' +
    '<div class="admcard"><h3>Google preview</h3><div class="admcard__b">' +
      '<div style="max-width:600px"><p style="color:#1a0dab;font-size:19px;line-height:1.3" data-gt>' + esc(s.title) + '</p>' +
      '<p style="color:#006621;font-size:13px;margin:2px 0 4px" data-gu>' + esc(s.canonical) + '</p>' +
      '<p style="color:#545454;font-size:13.5px" data-gd>' + esc(s.description) + '</p></div>' +
    '</div></div>' +
    '<button class="btn" data-saveseo>Save SEO</button>';
  }
  function f2(k, label, v, max) {
    return '<label class="field"><span>' + label + (max ? ' <b style="float:right;font-weight:600;color:var(--muted)">' + String(v).length + '/' + max + '</b>' : '') +
      '</span><input data-s="' + k + '" value="' + esc(v) + '"></label>';
  }
  function fArea2(k, label, v, max) {
    return '<label class="field"><span>' + label + (max ? ' <b style="float:right;font-weight:600;color:var(--muted)">' + String(v).length + '/' + max + '</b>' : '') +
      '</span><textarea data-s="' + k + '">' + esc(v) + '</textarea></label>';
  }

  /* ---------------- settings ---------------- */
  function settingsView() {
    var b = St.db.brand;
    return '<div class="admgrid2">' +
      '<div class="admcard"><h3>Brand assets</h3><div class="admcard__b">' +
        '<label class="field"><span>Wordmark text</span><input data-b="logoText" value="' + esc(b.logoText) + '"></label>' +
        '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:6px 0 10px">Favicon</h4>' +
        '<div style="display:flex;gap:12px;align-items:center">' +
          '<img src="' + (b.favicon || '/assets/img/favicon.svg') + '" alt="Favicon" width="44" height="44" style="width:44px;height:44px;border:1px solid var(--line);border-radius:6px;object-fit:contain;background:#fff">' +
          '<label class="drop" style="flex:1;margin:0"><input type="file" accept="image/*" hidden data-favupload>Upload favicon (square, 512px)</label>' +
        '</div>' +
        '<h4 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:18px 0 10px">Logo image (optional)</h4>' +
        '<div style="display:flex;gap:12px;align-items:center">' +
          (b.logo ? '<img src="' + b.logo + '" alt="Logo" style="height:44px;border:1px solid var(--line);border-radius:6px;background:#fff">' : '<span class="wordmark">' + esc(b.logoText) + '</span>') +
          '<label class="drop" style="flex:1;margin:0"><input type="file" accept="image/*" hidden data-logoupload>Upload logo</label>' +
        '</div>' +
        (b.logo ? '<button class="btn btn--ghost btn--sm" style="margin-top:10px" data-rmlogo>Remove logo, use wordmark</button>' : '') +
        '<button class="btn" style="margin-top:16px" data-savebrand>Save brand</button>' +
      '</div></div>' +
      '<div class="admcard"><h3>Security</h3><div class="admcard__b">' +
        '<form data-pwform>' +
        '<label class="field"><span>Current password</span><input type="password" name="old" autocomplete="current-password"></label>' +
        '<label class="field"><span>New password</span><input type="password" name="new1" autocomplete="new-password"></label>' +
        '<label class="field"><span>Confirm new password</span><input type="password" name="new2" autocomplete="new-password"></label>' +
        '<button class="btn" type="submit">Change password</button></form>' +
        '<div class="errbox" style="margin-top:16px">' +
          '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" style="flex:none;margin-top:1px"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5" stroke-linecap="round"/></svg>' +
          '<span>This build stores everything in the browser, so admin auth is a UI gate — not a server boundary. Put the dashboard behind real server auth before taking payments.</span></div>' +
      '</div></div>' +
      '<div class="admcard"><h3>Data</h3><div class="admcard__b">' +
        '<p class="small dim" style="margin-bottom:14px">Products, orders, customers, coupons and content live in this browser. Export before clearing site data.</p>' +
        '<div style="display:flex;gap:9px;flex-wrap:wrap">' +
          '<button class="btn btn--ghost btn--sm" data-export>Export JSON</button>' +
          '<label class="btn btn--ghost btn--sm" style="cursor:pointer"><input type="file" accept="application/json" hidden data-import>Import JSON</label>' +
          '<button class="btn btn--ghost btn--sm" style="color:var(--err);border-color:rgba(179,64,47,.4)" data-factory>Reset to factory data</button>' +
        '</div>' +
      '</div></div>' +
      '<div class="admcard"><h3>Store totals</h3><div class="admcard__b">' +
        '<div class="orow"><span class="dim">Products</span><span>' + St.products({ all: true }).length + '</span></div>' +
        '<div class="orow"><span class="dim">Orders</span><span>' + St.db.orders.length + '</span></div>' +
        '<div class="orow"><span class="dim">Customers</span><span>' + St.db.customers.length + '</span></div>' +
        '<div class="orow"><span class="dim">Units sold</span><span>' + St.stats().unitsSold + '</span></div>' +
      '</div></div>' +
    '</div>';
  }

  /* ---------------- mount ---------------- */
  function mountAdmin(main, tab) {
    var body = $('[data-adm]', main);

    main.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tab]');
      if (t) { root.Router.go('/admin/' + t.dataset.tab); return; }
      if (e.target.closest('[data-logout]')) { St.logout(); U.toast('Signed out'); root.Router.go('/'); return; }
      if (e.target.closest('[data-preview]')) { root.Router.go('/'); return; }

      var ed = e.target.closest('[data-edit]');
      if (ed) { productEditor(ed.dataset.edit); return; }
      if (e.target.closest('[data-newproduct]')) { productEditor(null); return; }
      var dup = e.target.closest('[data-dup]');
      if (dup) {
        var src = St.clone(St.productById(dup.dataset.dup));
        src.id = 'P' + Date.now().toString().slice(-6);
        src.slug = src.slug + '-copy'; src.name = src.name + ' (copy)'; src.active = false; src.createdAt = Date.now();
        St.db.products.unshift(src); St.save('products'); U.toast('Duplicated — saved as hidden'); root.Router.refresh(); return;
      }
      var del = e.target.closest('[data-del]');
      if (del) {
        var p = St.productById(del.dataset.del);
        confirmBox('Delete “' + esc(p.name) + '”?', 'This removes it from the store and the catalogue. Orders already placed keep their record.', 'Delete', function () {
          St.db.products = St.db.products.filter(function (x) { return x.id !== p.id; });
          St.save('products'); U.toast('Deleted ' + esc(p.name)); root.Router.refresh();
        });
        return;
      }
      var ps = e.target.closest('[data-pstatus]');
      if (ps) { pFilter.status = ps.dataset.pstatus; body.innerHTML = productsView(); return; }
      var os = e.target.closest('[data-ostatus]');
      if (os) { oFilter.status = os.dataset.ostatus; body.innerHTML = ordersView(); return; }

      var row = e.target.closest('[data-order]');
      if (row && !e.target.closest('select')) { orderSheet(row.dataset.order); return; }

      if (e.target.closest('[data-newcoupon]')) { couponEditor(null); return; }
      var ec = e.target.closest('[data-editcoupon]');
      if (ec) { couponEditor(+ec.dataset.editcoupon); return; }
      var tc = e.target.closest('[data-togglecoupon]');
      if (tc) { var c = St.db.coupons[+tc.dataset.togglecoupon]; c.active = !c.active; St.save('coupons'); body.innerHTML = couponsView(); return; }
      var dc = e.target.closest('[data-delcoupon]');
      if (dc) {
        var idx = +dc.dataset.delcoupon, code = St.db.coupons[idx].code;
        confirmBox('Delete ' + esc(code) + '?', 'Customers using this code at checkout will see it fail.', 'Delete', function () {
          St.db.coupons.splice(idx, 1); St.save('coupons'); U.toast('Deleted ' + esc(code)); root.Router.refresh();
        });
        return;
      }

      if (e.target.closest('[data-savecontent]')) {
        $$('[data-k]', main).forEach(function (n) {
          var k = n.dataset.k, v = n.value;
          if (k === 'announcements') St.db.content[k] = v.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
          else if (k === 'freeShipOver' || k === 'flatShipping') St.db.content[k] = +v || 0;
          else St.db.content[k] = v;
        });
        St.save('content'); U.toast('Homepage saved'); root.App.paintChrome(); return;
      }
      if (e.target.closest('[data-saveseo]')) {
        $$('[data-s]', main).forEach(function (n) { St.db.seo[n.dataset.s] = n.value; });
        St.save('seo'); U.toast('SEO saved'); root.App.applySEO(); return;
      }
      if (e.target.closest('[data-savebrand]')) {
        var lt = $('[data-b="logoText"]', main);
        if (lt) St.db.brand.logoText = lt.value;
        St.save('brand'); U.toast('Brand saved'); root.App.paintChrome(); return;
      }
      if (e.target.closest('[data-rmlogo]')) { St.db.brand.logo = null; St.save('brand'); root.App.paintChrome(); root.Router.refresh(); return; }

      if (e.target.closest('[data-export]')) {
        var dump = { v: 3, exportedAt: new Date().toISOString() };
        ['products', 'orders', 'customers', 'coupons', 'content', 'seo', 'brand'].forEach(function (k) { dump[k] = St.db[k]; });
        var blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
        var a = doc.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rivet-and-co-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        U.toast('Exported'); return;
      }
      if (e.target.closest('[data-factory]')) {
        confirmBox('Reset everything to factory data?', 'All products, orders, customers, coupons and content edits in this browser are replaced by the seed catalogue.', 'Reset', function () {
          St.hardReset(); U.toast('Reset to factory data'); root.Router.refresh();
        });
        return;
      }
    });

    /* live inputs */
    main.addEventListener('input', function (e) {
      var s = e.target.closest('[data-s]');
      if (s) {
        var k = s.dataset.s;
        if (k === 'title') { var gt = $('[data-gt]', main); if (gt) gt.textContent = s.value; }
        if (k === 'description') { var gd = $('[data-gd]', main); if (gd) gd.textContent = s.value; }
        if (k === 'canonical') { var gu = $('[data-gu]', main); if (gu) gu.textContent = s.value; }
      }
      var q = e.target.closest('[data-psearch]');
      if (q) { pFilter.q = q.value; var sel = doc.activeElement === q; body.innerHTML = productsView(); if (sel) { var n = $('[data-psearch]', main); n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }
      var oq = e.target.closest('[data-osearch]');
      if (oq) { oFilter.q = oq.value; body.innerHTML = ordersView(); var n2 = $('[data-osearch]', main); n2.focus(); n2.setSelectionRange(n2.value.length, n2.value.length); }
    });

    main.addEventListener('change', function (e) {
      var ss = e.target.closest('[data-setstatus]');
      if (ss) {
        var o = St.db.orders.filter(function (x) { return x.id === ss.dataset.setstatus; })[0];
        if (o) { o.status = ss.value; St.save('orders'); U.toast(o.id + ' → <b>' + esc(o.status) + '</b>'); }
        return;
      }
      var og = e.target.closest('[data-ogupload]');
      if (og && og.files[0]) return readImage(og.files[0], 900, function (d) { St.db.seo.ogImage = d; St.save('seo'); U.toast('OG image set'); root.Router.refresh(); });
      var fv = e.target.closest('[data-favupload]');
      if (fv && fv.files[0]) return readImage(fv.files[0], 300, function (d) { St.db.brand.favicon = d; St.save('brand'); root.App.paintChrome(); U.toast('Favicon updated'); root.Router.refresh(); });
      var lg = e.target.closest('[data-logoupload]');
      if (lg && lg.files[0]) return readImage(lg.files[0], 400, function (d) { St.db.brand.logo = d; St.save('brand'); root.App.paintChrome(); U.toast('Logo updated'); root.Router.refresh(); });
      var im = e.target.closest('[data-import]');
      if (im && im.files[0]) {
        var r = new FileReader();
        r.onload = function () {
          try {
            var j = JSON.parse(r.result);
            ['products', 'orders', 'customers', 'coupons', 'content', 'seo', 'brand'].forEach(function (k) {
              if (j[k]) { St.db[k] = j[k]; St.save(k); }
            });
            U.toast('Imported'); root.App.paintChrome(); root.Router.refresh();
          } catch (err) { U.toast('That file is not a valid export', 'err'); }
        };
        r.readAsDataURL ? r.readAsText(im.files[0]) : null;
      }
    });

    main.addEventListener('submit', function (e) {
      var f2 = e.target.closest('[data-pwform]');
      if (!f2) return;
      e.preventDefault();
      if (f2.new1.value.length < 8) return U.toast('Use at least 8 characters', 'err');
      if (f2.new1.value !== f2.new2.value) return U.toast('New passwords do not match', 'err');
      St.changePw(f2.old.value, f2.new1.value).then(function (r) {
        if (r.ok) { U.toast('Password changed'); f2.reset(); }
        else U.toast(r.msg || 'Current password is wrong', 'err');
      });
    });
  }

  function readImage(file, maxKB, cb) {
    if (file.size > maxKB * 1024) return U.toast('File is over ' + maxKB + ' KB — resize it first', 'err');
    var r = new FileReader();
    r.onload = function () { cb(r.result); };
    r.readAsDataURL(file);
  }

  function confirmBox(title, msg, label, onYes) {
    var el = U.modal('<h3 class="h-sm">' + title + '</h3><p class="small dim" style="margin:10px 0 20px">' + msg + '</p>' +
      '<div style="display:flex;gap:9px"><button class="btn btn--ghost" data-close style="flex:1">Cancel</button>' +
      '<button class="btn" style="flex:1;background:var(--err)" data-yes>' + label + '</button></div>', { nofocus: true });
    el.addEventListener('click', function (e) {
      if (e.target.closest('[data-yes]')) { U.closeOverlay(); onYes(); }
    });
  }

  root.Admin = { admin: admin, wireGesture: wireGesture, loginModal: loginModal };
})(window, document);
