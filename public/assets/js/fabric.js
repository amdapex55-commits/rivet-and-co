/* ============================================================
   Fabric — procedural denim imagery.
   Every product shot, texture and backdrop on this site is
   generated as an SVG here. No external image assets.
   ============================================================ */
(function (root) {
  'use strict';

  var WASHES = {
    'dark-indigo': { base:'#1D2B48', hi:'#38507A', lo:'#111C31', name:'Dark Indigo', tint:'#0E1729', fade:.10 },
    'mid-blue':    { base:'#42688F', hi:'#7699BE', lo:'#2C4767', name:'Mid Blue',    tint:'#20344B', fade:.22 },
    'stone-blue':  { base:'#7A9AB8', hi:'#B4C9DC', lo:'#5A7B9A', name:'Stone Blue',  tint:'#41607E', fade:.30 },
    'acid-wash':   { base:'#6F91B2', hi:'#DCE6EF', lo:'#3F5E80', name:'Acid Wash',   tint:'#2F4A66', fade:.14, acid:true },
    'washed-black':{ base:'#2C2E33', hi:'#4B4E56', lo:'#17181C', name:'Washed Black',tint:'#121316', fade:.16 },
    'ecru':        { base:'#C6BBA4', hi:'#E4DCCA', lo:'#A5977C', name:'Ecru',        tint:'#8A7C62', fade:.16 },
    'raw-indigo':  { base:'#22355C', hi:'#3F5C8E', lo:'#15233F', name:'Raw Indigo',  tint:'#101C33', fade:.05 },
    /* washes matched to the Rivet Jr photography */
    'ice-wash':    { base:'#B7CBDE', hi:'#E2EBF3', lo:'#8FA9C2', name:'Ice Wash',    tint:'#7793AE', fade:.30, acid:true },
    'slate-acid':  { base:'#8C8F95', hi:'#C6C8CC', lo:'#6A6D73', name:'Slate Acid',  tint:'#55585E', fade:.26, acid:true },
    'deep-acid':   { base:'#41618A', hi:'#7B99BC', lo:'#2C4463', name:'Deep Acid',   tint:'#22364E', fade:.20, acid:true },
    'charcoal':    { base:'#4A4E55', hi:'#767B84', lo:'#33363B', name:'Charcoal',    tint:'#26282C', fade:.14 }
  };

  var FITS = {
    slim:     { w:166, h:184, lc:92, kw:60, aw:44, label:'Slim' },
    straight: { w:172, h:190, lc:96, kw:74, aw:70, label:'Straight' },
    tapered:  { w:170, h:188, lc:94, kw:70, aw:52, label:'Tapered' },
    relaxed:  { w:180, h:200, lc:102,kw:88, aw:82, label:'Relaxed' },
    jogger:   { w:168, h:190, lc:95, kw:78, aw:54, label:'Jogger', cuff:true },
    skinny:   { w:162, h:178, lc:88, kw:52, aw:36, label:'Skinny' },
    bootcut:  { w:172, h:190, lc:96, kw:64, aw:78, label:'Bootcut' }
  };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function n(v){ return Math.round(v*100)/100; }

  /* ---------- shared defs: weave, twill, thread, sheen ---------- */
  function defs(id, wash, seed) {
    var s = seed % 90, W = WASHES[wash] || WASHES['mid-blue'];
    return '' +
    '<defs>' +
      '<filter id="nz'+id+'" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.92 0.016" numOctaves="4" seed="'+s+'" result="warp"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.014 0.86" numOctaves="3" seed="'+(s+9)+'" result="weft"/>' +
        '<feBlend in="warp" in2="weft" mode="multiply" result="cl"/>' +
        '<feColorMatrix in="cl" type="saturate" values="0" result="g"/>' +
        '<feComponentTransfer in="g" result="g2">' +
          '<feFuncR type="linear" slope="1.62" intercept="-0.31"/>' +
          '<feFuncG type="linear" slope="1.62" intercept="-0.31"/>' +
          '<feFuncB type="linear" slope="1.62" intercept="-0.31"/>' +
          '<feFuncA type="linear" slope="1" intercept="0"/>' +
        '</feComponentTransfer>' +
        '<feComposite in="g2" in2="SourceGraphic" operator="in"/>' +
      '</filter>' +
      '<filter id="sl'+id+'" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.36" numOctaves="4" seed="'+(s+21)+'" result="n"/>' +
        '<feColorMatrix in="n" type="saturate" values="0" result="g"/>' +
        '<feComponentTransfer in="g" result="g2">' +
          '<feFuncR type="linear" slope="1.5" intercept="-0.3"/>' +
          '<feFuncG type="linear" slope="1.5" intercept="-0.3"/>' +
          '<feFuncB type="linear" slope="1.5" intercept="-0.3"/>' +
        '</feComponentTransfer>' +
        '<feComposite in="g2" in2="SourceGraphic" operator="in"/>' +
      '</filter>' +
      '<filter id="gr'+id+'" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="'+(s+5)+'"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .16 0"/>' +
        '<feComposite in2="SourceGraphic" operator="atop"/>' +
      '</filter>' +
      '<filter id="bl'+id+'" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="30"/></filter>' +
      '<filter id="bm'+id+'" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>' +
      '<filter id="bs'+id+'" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<pattern id="tw'+id+'" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-63)">' +
        '<path d="M0 2h8" stroke="#ffffff" stroke-opacity=".5" stroke-width="1.7"/>' +
        '<path d="M0 6h8" stroke="#000000" stroke-opacity=".42" stroke-width="1.5"/>' +
      '</pattern>' +
      '<pattern id="wp'+id+'" width="3" height="3" patternUnits="userSpaceOnUse">' +
        '<path d="M1 0v3" stroke="#ffffff" stroke-opacity=".22" stroke-width="1"/>' +
      '</pattern>' +
      '<linearGradient id="sh'+id+'" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".17"/>' +
        '<stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".22"/>' +
      '</linearGradient>' +
      '<radialGradient id="vg'+id+'" cx="50%" cy="42%" r="72%">' +
        '<stop offset=".4" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".36"/>' +
      '</radialGradient>' +
      '<radialGradient id="bg'+id+'" cx="50%" cy="30%" r="82%">' +
        '<stop offset="0" stop-color="#FCFAF6"/>' +
        '<stop offset=".62" stop-color="#EFEADF"/>' +
        '<stop offset="1" stop-color="#DED7C9"/>' +
      '</radialGradient>' +
      '<radialGradient id="rv'+id+'" cx="34%" cy="28%">' +
        '<stop offset="0" stop-color="#F5D2A4"/><stop offset="52%" stop-color="#B87333"/><stop offset="100%" stop-color="#6E3D13"/>' +
      '</radialGradient>' +
    '</defs>';
  }

  /* denim fill for an arbitrary shape */
  function cloth(id, wash, shape, extra) {
    var W = WASHES[wash] || WASHES['mid-blue'];
    var t = shape.tag, a = shape.attrs;
    return '' +
      '<g style="isolation:isolate"'+(extra||'')+'>' +
        '<'+t+' '+a+' fill="'+W.base+'"/>' +
        '<'+t+' '+a+' fill="#808080" filter="url(#nz'+id+')" style="mix-blend-mode:overlay" opacity=".82"/>' +
        '<'+t+' '+a+' fill="url(#wp'+id+')" style="mix-blend-mode:soft-light" opacity=".5"/>' +
        '<'+t+' '+a+' fill="url(#tw'+id+')" style="mix-blend-mode:soft-light" opacity=".55"/>' +
        '<'+t+' '+a+' fill="#808080" filter="url(#sl'+id+')" style="mix-blend-mode:soft-light" opacity=".38"/>' +
      '</g>';
  }

  /* ---------- jeans geometry ---------- */
  function jeansPath(fit) {
    var f = FITS[fit] || FITS.straight;
    var cx = 450, y0 = 210, yC = y0 + 340, yK = y0 + 570, yB = 1088;
    var W = f.w, H = f.h, lc = f.lc, Ko = lc + f.kw, Ki = lc - f.kw, Ao = lc + f.aw, Ai = lc - f.aw;
    var p = 'M' + (cx - W) + ' ' + y0 +
      ' L' + (cx + W) + ' ' + y0 +
      ' C' + (cx + H) + ' ' + (y0 + 130) + ' ' + (cx + Ko + 14) + ' ' + (y0 + 400) + ' ' + (cx + Ko) + ' ' + yK +
      ' C' + (cx + Ko - 4) + ' ' + (yK + 170) + ' ' + (cx + Ao + 8) + ' ' + (yB - 70) + ' ' + (cx + Ao) + ' ' + yB +
      ' L' + (cx + Ai) + ' ' + yB +
      ' C' + (cx + Ki + 4) + ' ' + (yK + 150) + ' ' + (cx + 26) + ' ' + (yC + 130) + ' ' + (cx + 9) + ' ' + yC +
      ' C' + (cx - 26) + ' ' + (yC + 130) + ' ' + (cx - Ki - 4) + ' ' + (yK + 150) + ' ' + (cx - Ai) + ' ' + yB +
      ' L' + (cx - Ao) + ' ' + yB +
      ' C' + (cx - Ao - 8) + ' ' + (yB - 70) + ' ' + (cx - Ko + 4) + ' ' + (yK + 170) + ' ' + (cx - Ko) + ' ' + yK +
      ' C' + (cx - Ko - 14) + ' ' + (y0 + 400) + ' ' + (cx - H) + ' ' + (y0 + 130) + ' ' + (cx - W) + ' ' + y0 + ' Z';
    return { d:p, f:f, cx:cx, y0:y0, yC:yC, yK:yK, yB:yB, Ao:Ao, Ai:Ai, lc:lc };
  }

  function stitch(d, opts) {
    opts = opts || {};
    return '<path d="'+d+'" fill="none" stroke="'+(opts.c||'#D9A566')+'" stroke-width="'+(opts.w||3)+'" ' +
           'stroke-dasharray="'+(opts.dash||'11 8')+'" stroke-linecap="round" opacity="'+(opts.o||.85)+'"/>';
  }
  function rivet(x, y, id, r) {
    r = r || 9;
    return '<g><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="url(#rv'+id+')"/>' +
           '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="#5C3512" stroke-opacity=".55" stroke-width="1.2"/>' +
           '<circle cx="'+(x-r*.3)+'" cy="'+(y-r*.32)+'" r="'+(r*.3)+'" fill="#fff" fill-opacity=".4"/></g>';
  }

  /* wear / whiskering / acid blotches painted over the garment */
  function wear(id, wash, g) {
    var W = WASHES[wash] || WASHES['mid-blue'], o = [];
    var cx = g.cx, yK = g.yK, lc = g.lc, f = W.fade;
    o.push('<ellipse cx="'+(cx-lc)+'" cy="'+(g.y0+310)+'" rx="92" ry="132" fill="#fff" opacity="'+(f*1.05)+'" filter="url(#bl'+id+')"/>');
    o.push('<ellipse cx="'+(cx+lc)+'" cy="'+(g.y0+310)+'" rx="92" ry="132" fill="#fff" opacity="'+(f*1.05)+'" filter="url(#bl'+id+')"/>');
    o.push('<ellipse cx="'+(cx-lc)+'" cy="'+yK+'" rx="62" ry="56" fill="#fff" opacity="'+(f*.95)+'" filter="url(#bl'+id+')"/>');
    o.push('<ellipse cx="'+(cx+lc)+'" cy="'+yK+'" rx="62" ry="56" fill="#fff" opacity="'+(f*.95)+'" filter="url(#bl'+id+')"/>');
    o.push('<ellipse cx="'+cx+'" cy="'+(g.yC-30)+'" rx="120" ry="70" fill="#fff" opacity="'+(f*.75)+'" filter="url(#bl'+id+')"/>');
    o.push('<g filter="url(#bm'+id+')">');
    for (var i=0;i<4;i++){
      var yy = g.y0+336+i*22, sp = 56+i*14, dp = 12+i*5;
      o.push('<path d="M'+(cx-34)+' '+yy+' q-'+(sp*.55)+' '+dp+' -'+sp+' '+(dp*1.4)+'" fill="none" stroke="#fff" stroke-opacity="'+(f*1.25)+'" stroke-width="7"/>');
      o.push('<path d="M'+(cx+34)+' '+yy+' q'+(sp*.55)+' '+dp+' '+sp+' '+(dp*1.4)+'" fill="none" stroke="#fff" stroke-opacity="'+(f*1.25)+'" stroke-width="7"/>');
    }
    for (var k=0;k<3;k++){
      var ky = yK-26+k*24;
      o.push('<path d="M'+(cx-lc-46)+' '+ky+' q46 -'+(9+k*2)+' 92 0" fill="none" stroke="#fff" stroke-opacity="'+(f*1.1)+'" stroke-width="8"/>');
      o.push('<path d="M'+(cx+lc-46)+' '+ky+' q46 -'+(9+k*2)+' 92 0" fill="none" stroke="#fff" stroke-opacity="'+(f*1.1)+'" stroke-width="8"/>');
    }
    o.push('</g>');
    if (W.acid) {
      var blobs = [[300,430,130,158,1],[610,530,146,176,1],[372,830,118,138,1],[556,912,126,146,1],[450,296,158,116,1],[636,772,96,116,0],[262,668,104,124,0],[470,600,120,150,1],[340,1000,100,120,0]];
      for (var b=0;b<blobs.length;b++){
        var bb = blobs[b];
        o.push('<ellipse cx="'+bb[0]+'" cy="'+bb[1]+'" rx="'+bb[2]+'" ry="'+bb[3]+'" fill="'+(bb[4]?W.hi:W.tint)+'" opacity="'+(bb[4]?.72:.4)+'" filter="url(#bl'+id+')"/>');
      }
    }
    return o.join('');
  }

  /* ---------- front view ---------- */
  function front(id, wash, fit) {
    var g = jeansPath(fit), W = WASHES[wash] || WASHES['mid-blue'], cx = g.cx, y0 = g.y0, o = [];
    var wbH = 52;
    o.push('<ellipse cx="450" cy="1120" rx="300" ry="34" fill="#1a1a1a" opacity=".14" filter="url(#bs'+id+')"/>');
    o.push('<g>');
    o.push(cloth(id, wash, { tag:'path', attrs:'d="'+g.d+'"' }));
    o.push('<g clip-path="url(#cp'+id+')">'+wear(id, wash, g)+'</g>');
    o.push('<clipPath id="cp'+id+'"><path d="'+g.d+'"/></clipPath>');
    o.push('<path d="'+g.d+'" fill="url(#sh'+id+')"/>');
    // waistband
    var wbD = 'M'+(cx-g.f.w)+' '+y0+' L'+(cx+g.f.w)+' '+y0+' L'+(cx+g.f.w+3)+' '+(y0+wbH)+' L'+(cx-g.f.w-3)+' '+(y0+wbH)+' Z';
    o.push(cloth(id, wash, { tag:'path', attrs:'d="'+wbD+'"' }));
    o.push('<path d="'+wbD+'" fill="#000" opacity=".07"/>');
    o.push(stitch('M'+(cx-g.f.w+4)+' '+(y0+7)+' L'+(cx+g.f.w-4)+' '+(y0+7), {w:2.6}));
    o.push(stitch('M'+(cx-g.f.w+4)+' '+(y0+wbH-6)+' L'+(cx+g.f.w-4)+' '+(y0+wbH-6), {w:2.6}));
    // belt loops
    [-135,-70,0,70,135].forEach(function(dx){
      o.push('<rect x="'+(cx+dx-9)+'" y="'+(y0+1)+'" width="18" height="'+(wbH+10)+'" rx="2" fill="'+W.lo+'"/>');
      o.push('<rect x="'+(cx+dx-9)+'" y="'+(y0+1)+'" width="18" height="'+(wbH+10)+'" rx="2" fill="#808080" filter="url(#nz'+id+')" style="mix-blend-mode:overlay"/>'+'<rect x="'+(cx+dx-9)+'" y="'+(y0+wbH+7)+'" width="18" height="4" fill="#000" opacity=".18"/>');
    });
    // fly + J stitch
    o.push(stitch('M'+(cx+6)+' '+(y0+wbH)+' L'+(cx+6)+' '+(y0+186)+' q0 34 -34 34 L'+(cx-42)+' '+(y0+220), {w:3.2}));
    o.push(stitch('M'+(cx-3)+' '+(y0+wbH)+' L'+(cx-3)+' '+(y0+150), {w:2.4, o:.5}));
    // front pockets
    o.push('<path d="M'+(cx-g.f.w+6)+' '+(y0+wbH+10)+' q52 22 84 96" fill="none" stroke="'+W.lo+'" stroke-opacity=".6" stroke-width="7"/>');
    o.push('<path d="M'+(cx+g.f.w-6)+' '+(y0+wbH+10)+' q-52 22 -84 96" fill="none" stroke="'+W.lo+'" stroke-opacity=".6" stroke-width="7"/>');
    o.push(stitch('M'+(cx-g.f.w+6)+' '+(y0+wbH+10)+' q52 22 84 96', {w:3.4}));
    o.push(stitch('M'+(cx+g.f.w-6)+' '+(y0+wbH+10)+' q-52 22 -84 96', {w:3.4}));
    // coin pocket
    o.push(stitch('M'+(cx+62)+' '+(y0+72)+' l46 20 l-14 40', {w:2.4, dash:'8 6', o:.6}));
    o.push(rivet(cx-g.f.w+9, y0+wbH+13, id, 8));
    o.push(rivet(cx+g.f.w-9, y0+wbH+13, id, 8));
    o.push(rivet(cx-84, y0+152, id, 8));
    o.push(rivet(cx+84, y0+152, id, 8));
    // outseam + inseam stitching
    o.push(stitch('M'+(cx+g.f.h-6)+' '+(y0+130)+' C'+(cx+g.f.lc+g.f.kw+6)+' '+(y0+430)+' '+(cx+g.f.lc+g.f.kw-8)+' '+(g.yK+170)+' '+(cx+g.f.lc+g.f.aw-6)+' '+(g.yB-8), {w:2.6, o:.55}));
    o.push(stitch('M'+(cx-g.f.h+6)+' '+(y0+130)+' C'+(cx-g.f.lc-g.f.kw-6)+' '+(y0+430)+' '+(cx-g.f.lc-g.f.kw+8)+' '+(g.yK+170)+' '+(cx-g.f.lc-g.f.aw+6)+' '+(g.yB-8), {w:2.6, o:.55}));
    // hems / cuffs
    if (g.f.cuff) {
      [-1,1].forEach(function(s){
        var x = cx + s*g.lc;
        o.push('<rect x="'+(x-g.f.aw-4)+'" y="'+(g.yB-52)+'" width="'+((g.f.aw+4)*2)+'" height="52" rx="6" fill="'+W.lo+'"/>');
        o.push('<rect x="'+(x-g.f.aw-4)+'" y="'+(g.yB-52)+'" width="'+((g.f.aw+4)*2)+'" height="52" rx="6" fill="'+W.base+'" filter="url(#nz'+id+')" style="mix-blend-mode:overlay"/>');
        for (var r=0;r<7;r++){
          o.push('<path d="M'+(x-g.f.aw-2+r*((g.f.aw+2)*2/6))+' '+(g.yB-50)+' V'+(g.yB-2)+'" stroke="#000" stroke-opacity=".16" stroke-width="2"/>');
        }
      });
    } else {
      [-1,1].forEach(function(s){
        var x = cx + s*g.lc;
        o.push(stitch('M'+(x-g.f.aw+2)+' '+(g.yB-30)+' H'+(x+g.f.aw-2), {w:2.8}));
        o.push(stitch('M'+(x-g.f.aw+2)+' '+(g.yB-18)+' H'+(x+g.f.aw-2), {w:2.2, o:.5}));
      });
    }
    o.push('<path d="'+g.d+'" fill="none" stroke="'+W.lo+'" stroke-opacity=".5" stroke-width="2"/>');
    o.push('</g>');
    return o.join('');
  }

  /* ---------- back view ---------- */
  function back(id, wash, fit) {
    var g = jeansPath(fit), W = WASHES[wash] || WASHES['mid-blue'], cx = g.cx, y0 = g.y0, o = [];
    var wbH = 52;
    o.push('<ellipse cx="450" cy="1120" rx="300" ry="34" fill="#1a1a1a" opacity=".14" filter="url(#bs'+id+')"/>');
    o.push(cloth(id, wash, { tag:'path', attrs:'d="'+g.d+'"' }));
    o.push('<clipPath id="cp'+id+'"><path d="'+g.d+'"/></clipPath>');
    o.push('<g clip-path="url(#cp'+id+')">'+wear(id, wash, g)+'</g>');
    o.push('<path d="'+g.d+'" fill="url(#sh'+id+')"/>');
    var wbD = 'M'+(cx-g.f.w)+' '+y0+' L'+(cx+g.f.w)+' '+y0+' L'+(cx+g.f.w+3)+' '+(y0+wbH)+' L'+(cx-g.f.w-3)+' '+(y0+wbH)+' Z';
    o.push(cloth(id, wash, { tag:'path', attrs:'d="'+wbD+'"' }));
    o.push('<path d="'+wbD+'" fill="#000" opacity=".07"/>');
    o.push(stitch('M'+(cx-g.f.w+4)+' '+(y0+7)+' L'+(cx+g.f.w-4)+' '+(y0+7), {w:2.6}));
    o.push(stitch('M'+(cx-g.f.w+4)+' '+(y0+wbH-6)+' L'+(cx+g.f.w-4)+' '+(y0+wbH-6), {w:2.6}));
    // yoke
    o.push(stitch('M'+(cx-g.f.w-1)+' '+(y0+wbH+52)+' Q'+cx+' '+(y0+wbH+12)+' '+(cx+g.f.w+1)+' '+(y0+wbH+52), {w:3}));
    // back pockets
    [-1,1].forEach(function(s){
      var px = cx + s*88, py = y0+wbH+64, pw = 76, ph = 88;
      var pd = 'M'+(px-pw/2)+' '+py+' L'+(px+pw/2)+' '+py+' L'+(px+pw/2-4)+' '+(py+ph-26)+' L'+px+' '+(py+ph)+' L'+(px-pw/2+4)+' '+(py+ph-26)+' Z';
      o.push('<path d="'+pd+'" fill="'+W.lo+'" opacity=".55"/>');
      o.push('<path d="'+pd+'" fill="'+W.base+'" filter="url(#nz'+id+')" style="mix-blend-mode:overlay"/>');
      o.push(stitch(pd, {w:2.8}));
      o.push(stitch('M'+(px-pw/2+7)+' '+(py+16)+' Q'+px+' '+(py+52)+' '+(px+pw/2-7)+' '+(py+16), {w:3, dash:'10 7', c:'#E0AE6E'}));
      o.push(rivet(px-pw/2+5, py+4, id, 6));
      o.push(rivet(px+pw/2-5, py+4, id, 6));
    });
    // leather-look patch
    o.push('<g><rect x="'+(cx+g.f.w-96)+'" y="'+(y0+wbH+6)+'" width="86" height="44" rx="4" fill="#7A4A20"/>' +
      '<rect x="'+(cx+g.f.w-96)+'" y="'+(y0+wbH+6)+'" width="86" height="44" rx="4" fill="#8A5628" filter="url(#gr'+id+')"/>' +
      '<text x="'+(cx+g.f.w-53)+'" y="'+(y0+wbH+27)+'" text-anchor="middle" font-family="Archivo,Helvetica,Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1.6" fill="#F1E2CE">RIVET</text>' +
      '<text x="'+(cx+g.f.w-53)+'" y="'+(y0+wbH+42)+'" text-anchor="middle" font-family="Archivo,Helvetica,Arial,sans-serif" font-size="9" letter-spacing="2.4" fill="#D8BE9B">&amp; CO.</text></g>');
    o.push(stitch('M'+(cx)+' '+(y0+wbH+52)+' V'+(g.yC-10), {w:2.4, o:.45}));
    [-1,1].forEach(function(s){
      var x = cx + s*g.lc;
      if (!g.f.cuff) {
        o.push(stitch('M'+(x-g.f.aw+2)+' '+(g.yB-30)+' H'+(x+g.f.aw-2), {w:2.8}));
      } else {
        o.push('<rect x="'+(x-g.f.aw-4)+'" y="'+(g.yB-52)+'" width="'+((g.f.aw+4)*2)+'" height="52" rx="6" fill="'+W.lo+'"/>');
      }
    });
    o.push('<path d="'+g.d+'" fill="none" stroke="'+W.lo+'" stroke-opacity=".5" stroke-width="2"/>');
    return o.join('');
  }

  /* ---------- macro detail ---------- */
  function detail(id, wash) {
    var W = WASHES[wash] || WASHES['mid-blue'], o = [];
    o.push(cloth(id, wash, { tag:'rect', attrs:'x="0" y="0" width="900" height="1200"' }));
    o.push('<ellipse cx="300" cy="240" rx="480" ry="420" fill="#fff" opacity=".14" filter="url(#bl'+id+')"/>');
    o.push('<ellipse cx="760" cy="1080" rx="380" ry="330" fill="#000" opacity=".22" filter="url(#bl'+id+')"/>');
    // felled outseam running diagonally
    o.push('<g transform="rotate(-19 450 600)">');
    o.push('<rect x="-200" y="520" width="1300" height="8" fill="#000" opacity=".22" filter="url(#bs'+id+')"/>');
    o.push(cloth(id, wash, { tag:'rect', attrs:'x="-200" y="528" width="1300" height="118"' }));
    o.push('<rect x="-200" y="528" width="1300" height="118" fill="url(#sh'+id+')"/>');
    o.push('<rect x="-200" y="528" width="1300" height="5" fill="'+W.hi+'" opacity=".45"/>');
    o.push(stitch('M-200 566 H1100', {w:7, dash:'26 18'}));
    o.push(stitch('M-200 612 H1100', {w:7, dash:'26 18'}));
    o.push('</g>');
    // pocket corner + rivet
    o.push('<g transform="rotate(-19 450 600)">');
    o.push('<path d="M120 240 L560 240 L560 470 L120 470 Z" fill="'+W.lo+'" opacity=".28"/>');
    o.push(stitch('M120 250 L560 250', {w:6, dash:'22 15', o:.7}));
    o.push('</g>');
    o.push(rivet(268, 690, id, 42));
    o.push('<rect x="0" y="0" width="900" height="1200" fill="url(#vg'+id+')"/>');
    return o.join('');
  }

  /* ---------- folded stack ---------- */
  function stack(id, washes) {
    var o = [];
    o.push('<rect x="0" y="0" width="900" height="1200" fill="url(#bg'+id+')"/>');
    o.push('<ellipse cx="450" cy="972" rx="330" ry="42" fill="#20242c" opacity=".18" filter="url(#bs'+id+')"/>');
    for (var i = 0; i < washes.length; i++) {
      var h = 124, y = 950 - i * (h + 8), w = 566 - i * 18, x = 450 - w/2 + (i%2?12:-10);
      var W = WASHES[washes[i]] || WASHES['mid-blue'];
      o.push('<g transform="rotate('+((i%2?1:-1)*1.6)+' 450 '+y+')">');
      o.push('<rect x="'+x+'" y="'+(y-h+9)+'" width="'+w+'" height="'+h+'" rx="14" fill="#000" opacity=".2" filter="url(#bs'+id+')"/>');
      o.push(cloth(id, washes[i], { tag:'rect', attrs:'x="'+x+'" y="'+(y-h)+'" width="'+w+'" height="'+h+'" rx="14"' }));
      o.push('<rect x="'+x+'" y="'+(y-h)+'" width="'+w+'" height="'+h+'" rx="14" fill="url(#sh'+id+')"/>');
      // rolled fold on the left edge
      o.push('<path d="M'+(x+2)+' '+(y-h+12)+' q-14 '+(h/2-12)+' 0 '+(h-24)+'" fill="none" stroke="'+W.hi+'" stroke-opacity=".5" stroke-width="9"/>');
      o.push('<path d="M'+(x+16)+' '+(y-h+14)+' q-10 '+(h/2-14)+' 0 '+(h-28)+'" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="7"/>');
      // waistband edge + stitch on the right
      o.push('<path d="M'+(x+w-46)+' '+(y-h)+' v'+h+'" stroke="'+W.lo+'" stroke-opacity=".5" stroke-width="4"/>');
      o.push(stitch('M'+(x+w-38)+' '+(y-h+8)+' v'+(h-16), {w:3, o:.6}));
      o.push('<rect x="'+x+'" y="'+(y-h)+'" width="'+w+'" height="'+h+'" rx="14" fill="none" stroke="'+W.lo+'" stroke-opacity=".45" stroke-width="2"/>');
      o.push('</g>');
    }
    return o.join('');
  }

  /* ---------- full-bleed texture (hero / band) ---------- */
  function texture(id, wash, seam) {
    var W = WASHES[wash] || WASHES['mid-blue'], o = [];
    o.push(cloth(id, wash, { tag:'rect', attrs:'x="0" y="0" width="900" height="1200"' }));
    o.push('<ellipse cx="620" cy="230" rx="520" ry="440" fill="#fff" opacity=".13" filter="url(#bl'+id+')"/>');
    o.push('<ellipse cx="130" cy="1050" rx="420" ry="360" fill="#000" opacity=".2" filter="url(#bl'+id+')"/>');
    if (seam !== false) {
      o.push('<path d="M760 -40 L860 -40 L300 1240 L200 1240 Z" fill="'+W.lo+'" opacity=".38"/>');
      o.push(stitch('M792 -40 L236 1240', {w:5, dash:'18 14', o:.55}));
      o.push(stitch('M828 -40 L272 1240', {w:5, dash:'18 14', o:.55}));
      o.push(rivet(742, 214, id, 15));
    }
    o.push('<rect x="0" y="0" width="900" height="1200" fill="url(#vg'+id+')"/>');
    return o.join('');
  }

  /* ---------- render ---------- */
  var cache = {};

  function svg(opts) {
    var shot = opts.shot || 'flat',
        wash = opts.wash || 'mid-blue',
        fit  = opts.fit || 'straight',
        seed = opts.seed == null ? 7 : opts.seed,
        vw = opts.vw || 900, vh = opts.vh || 1200,
        id = 'a' + Math.abs(hash(shot + wash + fit + seed)) % 99999;
    var body = '', bg = '';
    var W = WASHES[wash] || WASHES['mid-blue'];

    if (shot === 'flat' || shot === 'back' || shot === 'crop') {
      bg = '<rect width="900" height="1200" fill="url(#bg'+id+')"/>';
      var inner = (shot === 'back') ? back(id, wash, fit) : front(id, wash, fit);
      if (shot === 'crop') {
        body = '<g transform="translate(-405,-198) scale(1.9) rotate(-7 450 420)">' + inner + '</g>';
      } else {
        body = inner;
      }
    } else if (shot === 'detail') {
      body = detail(id, wash);
    } else if (shot === 'stack') {
      body = stack(id, opts.washes || ['dark-indigo','mid-blue','acid-wash','washed-black']);
    } else if (shot === 'texture' || shot === 'hero') {
      body = texture(id, wash, opts.seam);
    } else if (shot === 'swatch') {
      body = cloth(id, wash, { tag:'rect', attrs:'x="0" y="0" width="900" height="1200"' }) +
             '<rect width="900" height="1200" fill="url(#vg'+id+')" opacity=".6"/>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="'+vw+'" height="'+vh+'" preserveAspectRatio="xMidYMid slice" role="img">' +
           defs(id, wash, seed + 3) + bg + body + '</svg>';
  }

  function hash(s) {
    var h = 5381, i = s.length;
    while (i) h = (h * 33) ^ s.charCodeAt(--i);
    return h >>> 0;
  }

  function url(opts) {
    var k = JSON.stringify(opts);
    if (cache[k]) return cache[k];
    var u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(opts));
    cache[k] = u;
    return u;
  }

  root.Fabric = {
    WASHES: WASHES, FITS: FITS,
    svg: svg, url: url, hash: hash,
    washName: function (k) { return (WASHES[k] || {}).name || k; },
    washColor: function (k) { return (WASHES[k] || {}).base || '#42688F'; }
  };
})(typeof window !== 'undefined' ? window : this);
