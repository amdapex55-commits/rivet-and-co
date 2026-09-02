/* ============================================================
   Seed data — catalog, collections, sizing, orders, settings.
   Everything here is the FACTORY default. Admin edits are
   layered on top in localStorage (see store.js).
   ============================================================ */
(function (root) {
  'use strict';

  var KID_SIZES = ['4Y','5Y','6Y','7-8Y','9-10Y','11-12Y','13-14Y'];
  var MEN_SIZES = ['28','30','32','34','36','38'];
  var WOMEN_SIZES = ['24','26','28','30','32'];

  var SIZE_GUIDE = [
    { size:'4Y',      age:'4 yrs',      height:'99–107',  waist:'52–54', inseam:'44' },
    { size:'5Y',      age:'5 yrs',      height:'107–114', waist:'54–56', inseam:'49' },
    { size:'6Y',      age:'6 yrs',      height:'114–120', waist:'56–58', inseam:'53' },
    { size:'7-8Y',    age:'7–8 yrs',    height:'120–132', waist:'58–61', inseam:'59' },
    { size:'9-10Y',   age:'9–10 yrs',   height:'132–142', waist:'61–65', inseam:'65' },
    { size:'11-12Y',  age:'11–12 yrs',  height:'142–152', waist:'65–69', inseam:'70' },
    { size:'13-14Y',  age:'13–14 yrs',  height:'152–162', waist:'69–74', inseam:'75' }
  ];

  var COLLECTIONS = [
    { slug:'kids-4-14',    title:'Kids 4–14',      tag:'The full Rivet Jr range, 4Y to 14Y' },
    { slug:'new-arrivals', title:'New Arrivals',   tag:'Just landed' },
    { slug:'denim-joggers',title:'Denim Joggers',  tag:'Elastic hem, real denim' },
    { slug:'skinny-fit',   title:'Skinny Fit',     tag:'Closest through the leg' },
    { slug:'slim-fit',     title:'Slim Fit',       tag:'Close, not tight' },
    { slug:'straight-fit', title:'Straight Fit',   tag:'The everyday leg' },
    { slug:'acid-wash',    title:'Acid Wash',      tag:'Hand-finished mottle, no two alike' },
    { slug:'dark-wash',    title:'Dark Wash',      tag:'Deep indigo and black, low fade' },
    { slug:'best-sellers', title:'Best Sellers',   tag:'What keeps selling out' }
  ];

  var COLOR_NAMES = {
    'dark-indigo':'Dark Indigo','mid-blue':'Mid Blue','stone-blue':'Stone Blue',
    'acid-wash':'Acid Wash','washed-black':'Washed Black','ecru':'Ecru','raw-indigo':'Raw Indigo',
    'ice-wash':'Ice Wash','slate-acid':'Slate Acid','deep-acid':'Deep Acid','charcoal':'Charcoal'
  };

  /* deterministic pseudo-random so seeded numbers never jump around */
  function rng(seed) { var s = seed; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

  function stockFor(seed, pattern) {
    var r = rng(seed), o = {};
    KID_SIZES.forEach(function (sz, i) {
      var v;
      if (pattern === 'low')      v = i === 2 || i === 4 ? 0 : Math.floor(r() * 4);
      else if (pattern === 'out') v = 0;
      else if (pattern === 'deep')v = 8 + Math.floor(r() * 22);
      else                        v = Math.floor(r() * 16);
      o[sz] = v;
    });
    return o;
  }

  /* The nine photographed Rivet Jr styles. `images` are real product shots;
     prices are placeholders in the agreed PKR band and are editable in the admin. */
  var RAW = [
    {
      slug:'ice-scrape-skinny-jean', name:'Ice Scrape Skinny Jean', fit:'skinny', wash:'ice-wash',
      price:3490, sale:null, stockPattern:'norm', featured:true,
      colls:['kids-4-14','skinny-fit','acid-wash','new-arrivals','best-sellers'],
      desc:'Ice-blue acid wash with hand-scraped rips at the thigh and knee. The lightest pair we make.',
      fabric:'10.5 oz cotton denim, 98% cotton / 2% elastane'
    },
    {
      slug:'shadow-denim-jogger', name:'Shadow Denim Jogger', fit:'jogger', wash:'washed-black',
      price:3690, sale:3190, stockPattern:'deep', featured:true,
      colls:['kids-4-14','denim-joggers','dark-wash','best-sellers'],
      desc:'Washed black denim on a jogger block. Drawcord waist, ribbed cuff, no zip to fight with.',
      fabric:'11 oz stretch denim, 97% cotton / 3% elastane'
    },
    {
      slug:'classic-indigo-slim-jean', name:'Classic Indigo Slim Jean', fit:'slim', wash:'dark-indigo',
      price:3890, sale:null, stockPattern:'deep', featured:true,
      colls:['kids-4-14','slim-fit','dark-wash','best-sellers'],
      desc:'The one every drawer needs. Deep indigo, clean whiskering, five-pocket construction.',
      fabric:'12 oz cotton denim, 99% cotton / 1% elastane'
    },
    {
      slug:'slate-acid-skinny-jean', name:'Slate Acid Skinny Jean', fit:'skinny', wash:'slate-acid',
      price:3690, sale:null, stockPattern:'norm', featured:false,
      colls:['kids-4-14','skinny-fit','acid-wash','new-arrivals'],
      desc:'Grey acid wash, marbled by hand in small lots. No two pairs come out the same.',
      fabric:'11 oz cotton denim, 98% cotton / 2% elastane'
    },
    {
      slug:'cloud-wash-slim-jean', name:'Cloud Wash Slim Jean', fit:'slim', wash:'ice-wash',
      price:3590, sale:2890, stockPattern:'norm', featured:false,
      colls:['kids-4-14','slim-fit'],
      desc:'Pale blue, softened before it ships, no distressing. The easy pair for hot months.',
      fabric:'10.5 oz cotton denim, 98% cotton / 2% elastane'
    },
    {
      slug:'black-fade-slim-jean', name:'Black Fade Slim Jean', fit:'slim', wash:'washed-black',
      price:3990, sale:null, stockPattern:'norm', featured:true,
      colls:['kids-4-14','slim-fit','dark-wash','best-sellers'],
      desc:'Black denim faded through the thigh with light abrasion. Reads smart, wears like a weekend.',
      fabric:'12 oz cotton denim, 99% cotton / 1% elastane'
    },
    {
      slug:'storm-rip-skinny-jean', name:'Storm Rip Skinny Jean', fit:'skinny', wash:'mid-blue',
      price:4190, sale:null, stockPattern:'low', featured:false,
      colls:['kids-4-14','skinny-fit','acid-wash','new-arrivals'],
      desc:'Mid-blue acid with open rips at both knees, backed with tape so they stay rips.',
      fabric:'11 oz stretch denim, 97% cotton / 3% elastane'
    },
    {
      slug:'charcoal-utility-straight-pant', name:'Charcoal Utility Straight Pant', fit:'straight', wash:'charcoal',
      price:4690, sale:null, stockPattern:'norm', featured:false,
      colls:['kids-4-14','straight-fit','dark-wash'],
      desc:'Charcoal utility pant with a hammer loop and a straight leg. The most hard-wearing thing we cut.',
      fabric:'13 oz rigid cotton twill, 100% cotton'
    },
    {
      slug:'deep-acid-straight-jean', name:'Deep Acid Straight Jean', fit:'straight', wash:'deep-acid',
      price:4290, sale:null, stockPattern:'norm', featured:false,
      colls:['kids-4-14','straight-fit','acid-wash','new-arrivals'],
      desc:'Deeper blue acid on a straight block. Room through the seat, clean at the hem.',
      fabric:'12 oz cotton denim, 100% cotton'
    }
  ];

  var PRODUCTS = RAW.map(function (r, i) {
    var seed = 100 + i * 37, rr = rng(seed);
    return {
      id: 'P' + (1001 + i),
      slug: r.slug,
      name: r.name,
      line: 'Rivet Jr',
      gender: 'kids',
      fit: r.fit,
      wash: r.wash,
      colors: [{ key: r.wash, name: COLOR_NAMES[r.wash] || r.wash, hex: root.Fabric ? root.Fabric.washColor(r.wash) : '#42688F' }],
      price: r.price,
      salePrice: r.sale,
      collections: r.colls,
      stock: stockFor(seed, r.stockPattern),
      featured: r.featured,
      description: r.desc,
      fabric: r.fabric,
      care: 'Machine wash cold, inside out. Wash with like colours. Tumble dry low. Do not bleach. Warm iron if needed.',
      ageRange: '4–14Y',
      seed: seed,
      rating: Math.round((4.2 + rr() * .75) * 10) / 10,
      reviews: 6 + Math.floor(rr() * 70),
      sold: 20 + Math.floor(rr() * 180),
      createdAt: Date.now() - (i * 4 + 2) * 86400000,
      active: true,
      sizeSet: 'kids',
      seoTitle: '', seoDesc: '',
      images: [
        'assets/img/products/' + r.slug + '-1.jpg',
        'assets/img/products/' + r.slug + '-2.jpg',
        'assets/img/products/' + r.slug + '-3.jpg'
      ]
    };
  });

  /* ---------- seeded orders + customers so the dashboard is real ---------- */
  var CITIES = ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Hyderabad','Sialkot','Quetta'];
  var FIRST = ['Ayesha','Bilal','Hina','Usman','Sana','Faisal','Maryam','Zain','Noor','Hamza','Rabia','Ahsan','Zoya','Taimur'];
  var LAST  = ['Khan','Ahmed','Malik','Sheikh','Qureshi','Butt','Raza','Iqbal','Siddiqui','Chaudhry'];
  var STATUSES = ['new','confirmed','packed','shipped','delivered','delivered','delivered','cancelled'];

  function seedCustomers() {
    var r = rng(9931), out = [];
    for (var i = 0; i < 24; i++) {
      var f = FIRST[Math.floor(r() * FIRST.length)], l = LAST[Math.floor(r() * LAST.length)];
      out.push({
        id: 'C' + (2001 + i),
        name: f + ' ' + l,
        phone: '03' + (Math.floor(r() * 89) + 10) + ' ' + (1000000 + Math.floor(r() * 8999999)),
        email: f.toLowerCase() + '.' + l.toLowerCase() + '@example.com',
        city: CITIES[Math.floor(r() * CITIES.length)],
        createdAt: Date.now() - Math.floor(r() * 120) * 86400000
      });
    }
    return out;
  }

  function seedOrders(customers, products) {
    var r = rng(4477), out = [];
    for (var i = 0; i < 38; i++) {
      var c = customers[Math.floor(r() * customers.length)];
      var nItems = 1 + Math.floor(r() * 2.6), items = [], sub = 0;
      for (var k = 0; k < nItems; k++) {
        var p = products[Math.floor(r() * products.length)];
        var sz = KID_SIZES[Math.floor(r() * KID_SIZES.length)];
        var q = 1 + Math.floor(r() * 1.7);
        var pr = p.salePrice || p.price;
        items.push({ id: p.id, slug: p.slug, name: p.name, size: sz, color: p.wash, qty: q, price: pr });
        sub += pr * q;
      }
      var ship = sub >= 4000 ? 0 : 250;
      var days = Math.floor(r() * 46);
      out.push({
        id: 'RC-' + (10240 + i),
        customerId: c.id, customer: c.name, phone: c.phone, city: c.city,
        address: (10 + Math.floor(r() * 400)) + ' Block ' + String.fromCharCode(65 + Math.floor(r() * 8)) + ', ' + c.city,
        items: items, subtotal: sub, shipping: ship, discount: 0, total: sub + ship,
        payment: r() > .22 ? 'COD' : 'Card',
        status: STATUSES[Math.floor(r() * STATUSES.length)],
        createdAt: Date.now() - days * 86400000
      });
    }
    return out.sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  var CUSTOMERS = seedCustomers();
  var ORDERS = seedOrders(CUSTOMERS, PRODUCTS);

  var COUPONS = [
    { code:'WELCOME10', type:'percent', value:10, min:0,    uses:47, limit:500, active:true,  note:'First order, 10% off' },
    { code:'RIVET500',  type:'fixed',   value:500, min:4000, uses:19, limit:200, active:true,  note:'Rs 500 off over Rs 4,000' },
    { code:'FREESHIP',  type:'shipping',value:0,   min:2500, uses:88, limit:0,   active:true,  note:'Free delivery over Rs 2,500' },
    { code:'EIDDROP',   type:'percent', value:15,  min:6000, uses:0,  limit:100, active:false, note:'Seasonal — off by default' }
  ];

  var CONTENT = {
    heroEyebrow: 'Rivet Jr · 4–14Y now · Adult fits coming soon',
    heroTitle: 'Built for <em>movement.</em>',
    heroSub: 'Everyday denim for kids 4–14, cut and finished in Pakistan. Made to be worn hard, not saved for occasions.',
    heroCta1: 'Shop Kids 4–14', heroCta1Href: '/collections/kids-4-14',
    heroCta2: 'New Arrivals',   heroCta2Href: '/collections/new-arrivals',
    heroWash: 'dark-indigo',
    quote: 'Denim that <em>keeps up.</em>',
    editorialTitle: 'Everyday jeans, better made.',
    editorialBody: 'One pattern block, tested on real kids, revised four times. Reinforced knees, bar-tacked stress points, and a waistband that still fits after a wash.',
    soonTitle: 'Men and Women. Next season.',
    soonBody: 'The same block, scaled up. Join the list and you will hear first.',
    freeShipOver: 4000,
    flatShipping: 250,
    whatsapp: '923001234567',
    announcements: ['Free delivery over Rs 4,000','Cash on delivery nationwide','7-day exchange','4–14Y now · Adult fits coming soon']
  };

  var SEO = {
    title: 'Rivet & Co. — Denim that keeps up | Kids Jeans 4–14Y',
    description: 'Rivet Jr by Rivet & Co. — everyday denim for kids 4–14Y. Skinny, slim, straight and jogger fits in ice, acid, indigo and black washes. Made in Pakistan, priced in PKR, delivered nationwide.',
    keywords: 'Rivet Jr, kids denim, kids jeans Pakistan, boys jeans, girls jeans, denim joggers, skinny fit jeans, acid wash jeans, utility pant kids',
    canonical: 'https://amdapex55-commits.github.io/rivet-and-co/',
    ogImage: 'https://amdapex55-commits.github.io/rivet-and-co/assets/img/og-image.jpg',
    themeColor: '#16223A',
    twitter: '@rivetandco'
  };

  root.SEED = {
    KID_SIZES: KID_SIZES, MEN_SIZES: MEN_SIZES, WOMEN_SIZES: WOMEN_SIZES,
    SIZE_GUIDE: SIZE_GUIDE, COLLECTIONS: COLLECTIONS, COLOR_NAMES: COLOR_NAMES,
    PRODUCTS: PRODUCTS, CUSTOMERS: CUSTOMERS, ORDERS: ORDERS, COUPONS: COUPONS,
    CONTENT: CONTENT, SEO: SEO,
    FIT_LABELS: { skinny:'Skinny', slim:'Slim', straight:'Straight', tapered:'Tapered', relaxed:'Relaxed', jogger:'Jogger', bootcut:'Bootcut' },
    LINE: 'Rivet Jr'
  };
})(typeof window !== 'undefined' ? window : this);
