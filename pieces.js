/* Original piece sets, all drawn in code as SVG (viewBox 0 0 100 100).
   Every set is a "recipe": a shape, a finish, a decoration, outline and glow.
   The same recipes power the "Make your own set" maker. */
(function (root) {
  'use strict';

  /* ---------- colour helpers ---------- */
  function hexToRgb(h) {
    h = String(h || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r) { return '#' + r.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { var x = hexToRgb(a), y = hexToRgb(b); return rgbToHex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function lum(h) { var c = hexToRgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function outlineFor(fill) { return lum(fill) > 0.5 ? mix(fill, '#000000', 0.82) : mix(fill, '#000000', 0.6); }
  function detailFor(fill) { return lum(fill) > 0.5 ? mix(fill, '#000000', 0.75) : mix(fill, '#ffffff', 0.7); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

  /* ---------- silhouettes ---------- */
  var BASE = 'M22 90 L78 90 Q80 90 80 87 L80 84 Q80 80 76 80 L24 80 Q20 80 20 84 L20 87 Q20 90 22 90 Z';
  var SIL = {
    p: { body: 'M35 80 Q37 64 44 57 L56 57 Q63 64 65 80 Z', extra: '<circle cx="50" cy="41" r="12.5"/><ellipse cx="50" cy="56" rx="12" ry="3.6"/>' },
    r: { body: 'M33 80 L36 47 L64 47 L67 80 Z', extra: '<path d="M29 47 L29 25 L37.5 25 L37.5 31 L45.5 31 L45.5 25 L54.5 25 L54.5 31 L62.5 31 L62.5 25 L71 25 L71 47 Z"/>',
         detail: '<path d="M33 47 L67 47" /><path d="M35 72 L65 72"/>' },
    n: { body: 'M30 80 C31 70 33 62 41 54 C43 52 44 50 43 48 L32 54 C26 57 21 52 23 46 C25 41 33 34 38 28 C40 21 45 15 51 13 L53 19 C64 21 72 32 72 48 C72 62 66 70 69 80 Z',
         extra: '', detail: '<circle cx="45" cy="29" r="2.6" class="d-fill"/><path d="M53 22 C61 27 65 36 64 48" /><path d="M27 48 L31 47"/>' },
    b: { body: 'M36 80 Q40 64 45 59 L55 59 Q60 64 64 80 Z', extra: '<path d="M50 19 C63 30 64 45 57 55 L43 55 C36 45 37 30 50 19 Z"/><circle cx="50" cy="15" r="4.5"/><ellipse cx="50" cy="57" rx="13" ry="3.6"/>',
         detail: '<path d="M56 30 L47 41"/>' },
    q: { body: 'M34 80 Q39 62 41 51 L59 51 Q61 62 66 80 Z', extra: '<path d="M27 30 L37 50 L63 50 L73 30 L61 41 L56 23 L50 38 L44 23 L39 41 Z"/><circle cx="27" cy="28" r="4"/><circle cx="44" cy="21" r="4"/><circle cx="56" cy="21" r="4"/><circle cx="73" cy="28" r="4"/><ellipse cx="50" cy="51" rx="13" ry="3.6"/>',
         detail: '<path d="M38 72 L62 72"/>' },
    k: { body: 'M34 80 Q39 62 41 51 L59 51 Q61 62 66 80 Z', extra: '<path d="M37 50 L33 33 Q50 25 67 33 L63 50 Z"/><rect x="47" y="7" width="6" height="22" rx="1"/><rect x="40.5" y="12" width="19" height="6" rx="1"/><ellipse cx="50" cy="51" rx="13" ry="3.6"/>',
         detail: '<path d="M38 72 L62 72"/><path d="M36 39 Q50 33 64 39"/>' }
  };
  var SCALE = { classic: [1, 1], chunky: [1.13, 0.97], slim: [0.84, 1.04] };

  function star(cx, cy, r) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      pts.push((cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  function pick(v, color) { return v && typeof v === 'object' ? v[color] : v; }

  /* ---------- the main sculpted renderer ---------- */
  function sculpted(type, fill, color, spec) {
    var s = SIL[type];
    var uid = 'pc' + hash(type + fill + color + JSON.stringify(spec));
    var finish = spec.finish || 'solid', deco = spec.deco || 'none';
    var sw = spec.stroke === undefined ? 2.6 : +spec.stroke;
    var outline = pick(spec.outline, color);
    var line = outline === 'tone' ? mix(fill, '#000000', 0.45) : outline || outlineFor(fill);
    var det = detailFor(fill);
    var shapes = '<path d="' + BASE + '"/><path d="' + s.body + '"/>' + s.extra;
    var defs = '<clipPath id="' + uid + 'c">' + shapes + '</clipPath>';
    var fillAttr = fill, fillOp = 1, over = '', strokeFilter = '';
    var dark = lum(fill) < 0.5;

    if (finish === 'shiny' || finish === 'glass') {
      defs += '<linearGradient id="' + uid + 'g" x1="0" x2="1" y1="0" y2="0.35"><stop offset="0" stop-color="' + mix(fill, '#ffffff', dark ? 0.35 : 0.5) + '"/><stop offset="0.5" stop-color="' + fill + '"/><stop offset="1" stop-color="' + mix(fill, '#000000', 0.3) + '"/></linearGradient>';
      fillAttr = 'url(#' + uid + 'g)';
      if (finish === 'glass') { fillOp = 0.62; if (!outline) line = dark ? mix(fill, '#ffffff', 0.55) : mix(fill, '#0a3a4a', 0.55); }
    } else if (finish === 'flame') {
      defs += '<linearGradient id="' + uid + 'g" x1="0" x2="0" y1="1" y2="0">' +
        (dark
          ? '<stop offset="0" stop-color="' + mix(fill, '#ff3b0a', 0.7) + '"/><stop offset="0.45" stop-color="' + fill + '"/><stop offset="1" stop-color="' + mix(fill, '#000000', 0.2) + '"/>'
          : '<stop offset="0" stop-color="#e8340c"/><stop offset="0.45" stop-color="#ff8a1f"/><stop offset="1" stop-color="' + fill + '"/>') +
        '</linearGradient>';
      fillAttr = 'url(#' + uid + 'g)';
      if (!outline) line = dark ? '#ff7a1a' : '#7a1e05';
    } else if (finish === 'marble') {
      defs += '<filter id="' + uid + 'f" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency="0.03 0.06" numOctaves="4" seed="' + (type.charCodeAt(0) % 9) + '"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 ' + (dark ? '0.85 0 0 0 0 0.85 0 0 0 0 0.88' : '0.25 0 0 0 0 0.25 0 0 0 0 0.3') + ' -4.2 0 0 0 1.05"/></filter>';
      over += '<g clip-path="url(#' + uid + 'c)"><rect width="100" height="100" filter="url(#' + uid + 'f)" opacity="0.75"/></g>';
    } else if (finish === 'wood') {
      defs += '<filter id="' + uid + 'f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.22 0.012" numOctaves="2" seed="4"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 ' + (dark ? '0.12 0 0 0 0 0.06 0 0 0 0 0.02' : '0.45 0 0 0 0 0.26 0 0 0 0 0.1') + ' 3.2 0 0 0 -1.25"/></filter>';
      over += '<g clip-path="url(#' + uid + 'c)"><rect width="100" height="100" filter="url(#' + uid + 'f)" opacity="0.55"/></g>';
    } else if (finish === 'sketch') {
      defs += '<filter id="' + uid + 'r" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>' +
        '<pattern id="' + uid + 'h" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="4.5" stroke="' + det + '" stroke-width="1"/></pattern>';
      over += '<g clip-path="url(#' + uid + 'c)"><rect x="56" y="0" width="44" height="100" fill="url(#' + uid + 'h)" opacity="0.55"/></g>';
      strokeFilter = ' filter="url(#' + uid + 'r)"';
      if (sw < 2.2) sw = 2.2;
    } else if (finish === 'neon') {
      fillOp = 0.12; line = fill; if (sw < 3) sw = 3.2;
    }

    // decorations, clipped to the piece
    if (deco === 'gloss') {
      over += '<g clip-path="url(#' + uid + 'c)"><ellipse cx="38" cy="38" rx="9" ry="26" transform="rotate(-18 38 38)" fill="#ffffff" opacity="0.38"/><ellipse cx="34" cy="83" rx="8" ry="2" fill="#ffffff" opacity="0.35"/></g>';
    } else if (deco === 'stars') {
      var sc = dark ? '#fff6c8' : mix(fill, '#3a2a8a', 0.75);
      over += '<g clip-path="url(#' + uid + 'c)" fill="' + sc + '"><path d="' + star(50, 70, 5) + '"/><path d="' + star(40, 62, 2.4) + '" opacity="0.8"/><path d="' + star(60, 76, 2.2) + '" opacity="0.8"/><path d="' + star(55, 33, 2.6) + '" opacity="0.85"/><circle cx="44" cy="44" r="0.9"/><circle cx="62" cy="58" r="0.9"/><circle cx="36" cy="74" r="0.8"/></g>';
    } else if (deco === 'facets') {
      over += '<g clip-path="url(#' + uid + 'c)"><path d="M20 92 L50 38 L80 92 Z" fill="#ffffff" opacity="0.16"/><path d="M50 4 L82 50 L50 56 Z" fill="#ffffff" opacity="0.22"/><path d="M18 20 L50 56 L18 72 Z" fill="#000000" opacity="0.1"/><path d="M82 50 L50 56 L82 92 Z" fill="#000000" opacity="0.14"/>' +
        '<path d="M50 4 L50 92 M18 20 L82 92 M82 20 L18 92" stroke="#ffffff" stroke-width="0.8" opacity="0.35" fill="none"/></g>';
    }

    var dCol = finish === 'neon' ? fill : finish === 'sketch' ? line : det;
    var detail = s.detail ? '<g fill="none" stroke="' + dCol + '" stroke-width="2.2" stroke-linecap="round"' + strokeFilter + '>' + s.detail.replace('class="d-fill"', 'fill="' + dCol + '" stroke="none"') + '</g>' : '';
    var sc2 = SCALE[spec.shape] || SCALE.classic;
    var tf = sc2[0] === 1 && sc2[1] === 1 ? '' : ' transform="translate(50 90) scale(' + sc2[0] + ' ' + sc2[1] + ') translate(-50 -90)"';
    var body = '<g fill="' + fillAttr + '" fill-opacity="' + fillOp + '" stroke="' + (sw > 0 ? line : 'none') + '" stroke-width="' + sw + '" stroke-linejoin="round"' + strokeFilter + '>' + shapes + '</g>';
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"' + glowStyle(spec, color, fill) + '><defs>' + defs + '</defs><g' + tf + '>' + body + over + detail + '</g></svg>';
  }

  function glowStyle(spec, color, fill) {
    var g = pick(spec.glow, color);
    if (spec.finish === 'neon' && !g) g = fill;
    if (!g) return '';
    if (g === 'self') g = fill;
    return ' style="overflow:visible;filter:drop-shadow(0 0 2.5px ' + g + ') drop-shadow(0 0 7px ' + g + '99)"';
  }

  /* ---------- pixel art ---------- */
  var PIX = {
    p: ['..............', '..............', '..............', '......##......', '.....####.....', '.....####.....', '......##......', '.....####.....',
        '......##......', '......##......', '.....####.....', '....######....', '...########...', '..............'],
    r: ['..............', '..............', '...##.##.##...', '...########...', '....######....', '....#eeee#....', '....######....', '....######....',
        '....######....', '....######....', '...########...', '..##########..', '..##########..', '..............'],
    n: ['..............', '..............', '.......#.#....', '......#####...', '.....##e####..', '....########..', '...#########..', '..####.#####..',
        '..###..#####..', '......######..', '.....#######..', '....########..', '...#########..', '..............'],
    b: ['..............', '......##......', '.....####.....', '....###.##....', '....##.###....', '....######....', '.....####.....', '......##......',
        '.....####.....', '.....####.....', '....######....', '...########...', '..##########..', '..............'],
    q: ['..............', '..#..#..#..#..', '..#..#..#..#..', '..##.####.##..', '..##########..', '...########...', '....######....', '.....####.....',
        '.....####.....', '....######....', '...########...', '..##########..', '..##########..', '..............'],
    k: ['......##......', '.....####.....', '......##......', '....######....', '...########...', '...##eeee##...', '....######....', '.....####.....',
        '.....####.....', '....######....', '...########...', '..##########..', '..##########..', '..............']
  };
  function pixel(type, fill, color, spec) {
    var map = PIX[type], o = pick(spec.outline, color);
    var line = o === 'tone' ? mix(fill, '#000000', 0.45) : o || outlineFor(fill);
    var hi = mix(fill, '#ffffff', 0.35), sz = 100 / 14, out = '', H = map.length, W = 14;
    function filled(r, c) { return r >= 0 && r < H && c >= 0 && c < W && map[r][c] !== '.'; }
    for (var r = 0; r < H; r++) for (var c = 0; c < W; c++) {
      var ch = map[r][c], col = null;
      if (ch === '#') col = (!filled(r - 1, c) || !filled(r, c - 1)) ? hi : fill;
      else if (ch === 'e') col = line;
      else if (filled(r - 1, c) || filled(r + 1, c) || filled(r, c - 1) || filled(r, c + 1)) col = line;
      if (col) out += '<rect x="' + (c * sz).toFixed(2) + '" y="' + (r * sz).toFixed(2) + '" width="' + (sz + 0.3).toFixed(2) + '" height="' + (sz + 0.3).toFixed(2) + '" fill="' + col + '"/>';
    }
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"' + glowStyle(spec, color, fill) + '>' + out + '</svg>';
  }

  /* ---------- geometric tokens ---------- */
  function geo(type, fill, color, spec) {
    var o = pick(spec.outline, color);
    var line = o === 'tone' ? mix(fill, '#000000', 0.45) : o || outlineFor(fill), det = detailFor(fill), inner;
    switch (type) {
      case 'p': inner = '<circle cx="50" cy="50" r="11" fill="' + det + '"/>'; break;
      case 'r': inner = '<rect x="36" y="36" width="28" height="28" rx="3" fill="' + det + '"/>'; break;
      case 'b': inner = '<path d="M50 30 L68 50 L50 70 L32 50 Z" fill="' + det + '"/>'; break;
      case 'n': inner = '<path d="M38 30 L48 30 L48 58 L66 58 L66 68 L38 68 Z" fill="' + det + '"/>'; break;
      case 'q': inner = '<path d="' + star(50, 50, 21) + '" fill="' + det + '"/>'; break;
      case 'k': inner = '<path d="M45 28 H55 V45 H72 V55 H55 V72 H45 V55 H28 V45 H45 Z" fill="' + det + '"/>'; break;
    }
    var r = type === 'p' ? 30 : 39;
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"' + glowStyle(spec, color, fill) + '><circle cx="50" cy="52" r="' + r + '" fill="' + mix(fill, '#000', 0.35) + '"/>' +
      '<circle cx="50" cy="49" r="' + r + '" fill="' + fill + '" stroke="' + line + '" stroke-width="2.5"/>' + inner + '</svg>';
  }

  /* ---------- letter tokens ---------- */
  function letters(type, fill, color, spec) {
    var o = pick(spec.outline, color);
    var line = o === 'tone' ? mix(fill, '#000000', 0.45) : o || outlineFor(fill), det = detailFor(fill);
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"' + glowStyle(spec, color, fill) + '><rect x="14" y="14" width="72" height="72" rx="20" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
      '<text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="46" fill="' + det + '">' +
      ({ p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' })[type] + '</text></svg>';
  }

  function render(type, fill, color, spec) {
    var shape = spec.shape || 'classic';
    if (shape === 'pixel') return pixel(type, fill, color, spec);
    if (shape === 'geo') return geo(type, fill, color, spec);
    if (shape === 'letters') return letters(type, fill, color, spec);
    return sculpted(type, fill, color, spec);
  }

  /* ---------- the built-in sets ---------- */
  var SETS = [
    { id: 'royal', name: 'Royal', colors: { w: '#f6f1e7', b: '#2f2b28' }, spec: { finish: 'solid' } },
    { id: 'velvet', name: 'Velvet', colors: { w: '#ffe3c2', b: '#6b2a4a' }, spec: { finish: 'shiny', stroke: 1.6 } },
    { id: 'flat', name: 'Flat', colors: { w: '#ffffff', b: '#1f2430' }, spec: { finish: 'solid', stroke: 0 } },
    { id: 'neon', name: 'Neon', colors: { w: '#4df3ff', b: '#ff4fd8' }, spec: { finish: 'neon' } },
    { id: 'ember', name: 'Ember', colors: { w: '#ffe08a', b: '#2a0f0a' }, spec: { finish: 'flame', stroke: 2, glow: { w: '#ff8a1f', b: '#ff5a1a' } } },
    { id: 'celestial', name: 'Celestial', colors: { w: '#f4f1ff', b: '#1a1f4a' }, spec: { finish: 'shiny', deco: 'stars', stroke: 1.8, glow: { w: '#ffffff', b: '#7aa2ff' } } },
    { id: 'glass', name: 'Glass', colors: { w: '#e9fbff', b: '#0d6f8f' }, spec: { finish: 'glass', deco: 'gloss', stroke: 2 } },
    { id: 'wood', name: 'Wood', colors: { w: '#e8c89a', b: '#6b4426' }, spec: { finish: 'wood', stroke: 2.2 } },
    { id: 'crystal', name: 'Crystal', colors: { w: '#f2fbff', b: '#4f6fa8' }, spec: { finish: 'shiny', deco: 'facets', outline: 'tone', stroke: 1.6 } },
    { id: 'gummy', name: 'Gummy', colors: { w: '#ffd23f', b: '#b04aff' }, spec: { shape: 'chunky', finish: 'shiny', deco: 'gloss', outline: 'tone', stroke: 4.5 } },
    { id: 'marble', name: 'Marble', colors: { w: '#f3f1ec', b: '#3a3f4a' }, spec: { finish: 'marble', stroke: 2 } },
    { id: 'sketch', name: 'Sketch', colors: { w: '#fbf8f0', b: '#5a5a5a' }, spec: { finish: 'sketch' } },
    { id: 'slim', name: 'Slim', colors: { w: '#fafafa', b: '#2b2b33' }, spec: { shape: 'slim', finish: 'shiny', stroke: 1.8 } },
    { id: 'pixel', name: 'Pixel', colors: { w: '#f2f2f2', b: '#3a3f58' }, spec: { shape: 'pixel' } },
    { id: 'geo', name: 'Geo', colors: { w: '#f4efe6', b: '#2b3a55' }, spec: { shape: 'geo' } },
    { id: 'letters', name: 'Letters', colors: { w: '#fbfbfb', b: '#262626' }, spec: { shape: 'letters' } }
  ];
  var PHOTOS = { id: 'custom', name: 'Photos', colors: { w: '#f6f1e7', b: '#2f2b28' }, spec: { finish: 'solid' }, photos: true };
  var customSets = [];

  function allSets() { return SETS.concat(customSets, [PHOTOS]); }
  function findSet(id) {
    var all = allSets();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return SETS[0];
  }

  var cache = {};
  /* piece: 'P','n'... setId, colors {w,b} (optional override), photos {wp: dataURL ...} */
  function pieceHTML(piece, setId, colors, photos) {
    var color = piece === piece.toUpperCase() ? 'w' : 'b', type = piece.toLowerCase();
    var set = findSet(setId);
    if (set.photos && photos && photos[color + type]) return '<img alt="" draggable="false" src="' + photos[color + type] + '">';
    var fill = (colors && colors[color]) || set.colors[color];
    var key = set.id + '|' + type + '|' + fill + '|' + JSON.stringify(set.spec);
    if (!cache[key]) cache[key] = render(type, fill, color, set.spec);
    return cache[key];
  }

  /* draw with a recipe that isn't saved yet (used by the maker's live preview) */
  function preview(piece, spec, colors) {
    var color = piece === piece.toUpperCase() ? 'w' : 'b';
    return render(piece.toLowerCase(), colors[color], color, spec);
  }

  root.Pieces = {
    SETS: SETS,
    allSets: allSets,
    find: findSet,
    setCustom: function (list) { customSets = (list || []).filter(function (s) { return s && s.id && s.spec && s.colors; }); },
    html: pieceHTML,
    preview: preview,
    mix: mix,
    lum: lum,
    SHAPES: [['classic', 'Classic'], ['chunky', 'Chunky'], ['slim', 'Slim'], ['pixel', 'Pixel'], ['geo', 'Tokens'], ['letters', 'Letters']],
    FINISHES: [['solid', 'Solid'], ['shiny', 'Shiny'], ['glass', 'Glass'], ['marble', 'Marble'], ['wood', 'Wood'], ['flame', 'Fire'], ['neon', 'Neon'], ['sketch', 'Sketch']],
    DECOS: [['none', 'None'], ['gloss', 'Shine'], ['stars', 'Stars'], ['facets', 'Gem cuts']]
  };
})(this);
