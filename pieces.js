/* Original piece sets, all drawn in code as SVG. Each set returns an SVG string (viewBox 0 0 100 100). */
(function (root) {
  'use strict';

  /* ---- colour helpers ---- */
  function hexToRgb(h) {
    h = (h || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r) { return '#' + r.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { var x = hexToRgb(a), y = hexToRgb(b); return rgbToHex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function lum(h) { var c = hexToRgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function outlineFor(fill) { return lum(fill) > 0.5 ? mix(fill, '#000000', 0.82) : mix(fill, '#000000', 0.6); }
  function detailFor(fill) { return lum(fill) > 0.5 ? mix(fill, '#000000', 0.75) : mix(fill, '#ffffff', 0.7); }

  /* ---- shared silhouettes for the sculpted sets ---- */
  var BASE = 'M22 90 L78 90 Q80 90 80 87 L80 84 Q80 80 76 80 L24 80 Q20 80 20 84 L20 87 Q20 90 22 90 Z';
  var SHAPES = {
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

  function sculpted(type, fill, opts) {
    var s = SHAPES[type], line = outlineFor(fill), det = detailFor(fill);
    var sw = opts.stroke || 2.6;
    var defs = '', fillAttr = fill;
    if (opts.shade) {
      var id = 'g' + type + fill.replace('#', '');
      defs = '<defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2="0.3"><stop offset="0" stop-color="' + mix(fill, '#ffffff', 0.28) + '"/><stop offset="0.55" stop-color="' + fill + '"/><stop offset="1" stop-color="' + mix(fill, '#000000', 0.28) + '"/></linearGradient></defs>';
      fillAttr = 'url(#' + id + ')';
    }
    var g = '<g fill="' + fillAttr + '" stroke="' + (opts.noStroke ? 'none' : line) + '" stroke-width="' + sw + '" stroke-linejoin="round">' +
      '<path d="' + BASE + '"/><path d="' + s.body + '"/>' + s.extra + '</g>';
    var d = s.detail ? '<g fill="none" stroke="' + (opts.noStroke ? mix(fill, lum(fill) > 0.5 ? '#000' : '#fff', 0.35) : det) + '" stroke-width="2.2" stroke-linecap="round">' + s.detail.replace('class="d-fill"', 'fill="' + det + '" stroke="none"') + '</g>' : '';
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + defs + g + d + '</svg>';
  }

  function neon(type, fill) {
    var s = SHAPES[type];
    var g = '<g fill="' + fill + '" fill-opacity="0.12" stroke="' + fill + '" stroke-width="3.2" stroke-linejoin="round">' +
      '<path d="' + BASE + '"/><path d="' + s.body + '"/>' + s.extra + '</g>';
    var d = s.detail ? '<g fill="none" stroke="' + fill + '" stroke-width="2.4" stroke-linecap="round">' + s.detail.replace('class="d-fill"', 'fill="' + fill + '" stroke="none"') + '</g>' : '';
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 3px ' + fill + ') drop-shadow(0 0 7px ' + fill + '88)">' + g + d + '</svg>';
  }

  /* ---- pixel art: '#' = body, 'e' = detail; the outline is worked out automatically ---- */
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
  function pixel(type, fill) {
    var map = PIX[type], line = outlineFor(fill), hi = mix(fill, '#ffffff', 0.35), sz = 100 / 14, out = '';
    var H = map.length, W = 14;
    function filled(r, c) { return r >= 0 && r < H && c >= 0 && c < W && map[r][c] !== '.'; }
    for (var r = 0; r < H; r++) for (var c = 0; c < W; c++) {
      var ch = map[r][c], col = null;
      if (ch === '#') col = (filled(r, c) && !filled(r - 1, c) || !filled(r, c - 1)) ? hi : fill;
      else if (ch === 'e') col = line;
      else if (filled(r - 1, c) || filled(r + 1, c) || filled(r, c - 1) || filled(r, c + 1)) col = line;
      if (col) out += '<rect x="' + (c * sz).toFixed(2) + '" y="' + (r * sz).toFixed(2) + '" width="' + (sz + 0.3).toFixed(2) + '" height="' + (sz + 0.3).toFixed(2) + '" fill="' + col + '"/>';
    }
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">' + out + '</svg>';
  }

  /* ---- geometric tokens ---- */
  function geo(type, fill) {
    var line = outlineFor(fill), det = detailFor(fill), inner;
    switch (type) {
      case 'p': inner = '<circle cx="50" cy="50" r="11" fill="' + det + '"/>'; break;
      case 'r': inner = '<rect x="36" y="36" width="28" height="28" rx="3" fill="' + det + '"/>'; break;
      case 'b': inner = '<path d="M50 30 L68 50 L50 70 L32 50 Z" fill="' + det + '"/>'; break;
      case 'n': inner = '<path d="M38 30 L48 30 L48 58 L66 58 L66 68 L38 68 Z" fill="' + det + '"/>'; break;
      case 'q': inner = '<path d="M50 28 L55 43 L71 43 L58 52 L63 68 L50 58 L37 68 L42 52 L29 43 L45 43 Z" fill="' + det + '"/>'; break;
      case 'k': inner = '<path d="M45 28 H55 V45 H72 V55 H55 V72 H45 V55 H28 V45 H45 Z" fill="' + det + '"/>'; break;
    }
    var r = type === 'p' ? 30 : 39;
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="52" r="' + r + '" fill="' + mix(fill, '#000', 0.35) + '"/>' +
      '<circle cx="50" cy="49" r="' + r + '" fill="' + fill + '" stroke="' + line + '" stroke-width="2.5"/>' + inner + '</svg>';
  }

  /* ---- letter tokens ---- */
  function letters(type, fill) {
    var line = outlineFor(fill), det = detailFor(fill);
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="14" width="72" height="72" rx="20" fill="' + fill + '" stroke="' + line + '" stroke-width="3"/>' +
      '<text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="46" fill="' + det + '">' +
      ({ p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' })[type] + '</text></svg>';
  }

  var SETS = [
    { id: 'royal', name: 'Royal', colors: { w: '#f6f1e7', b: '#2f2b28' }, draw: function (t, f) { return sculpted(t, f, {}); } },
    { id: 'velvet', name: 'Velvet', colors: { w: '#ffe3c2', b: '#6b2a4a' }, draw: function (t, f) { return sculpted(t, f, { shade: true, stroke: 1.6 }); } },
    { id: 'flat', name: 'Flat', colors: { w: '#ffffff', b: '#1f2430' }, draw: function (t, f) { return sculpted(t, f, { noStroke: true }); } },
    { id: 'neon', name: 'Neon', colors: { w: '#4df3ff', b: '#ff4fd8' }, draw: neon },
    { id: 'pixel', name: 'Pixel', colors: { w: '#f2f2f2', b: '#3a3f58' }, draw: pixel },
    { id: 'geo', name: 'Geo', colors: { w: '#f4efe6', b: '#2b3a55' }, draw: geo },
    { id: 'letters', name: 'Letters', colors: { w: '#fbfbfb', b: '#262626' }, draw: letters },
    { id: 'custom', name: 'Your own', colors: { w: '#f6f1e7', b: '#2f2b28' }, draw: function (t, f) { return sculpted(t, f, {}); } }
  ];

  var cache = {};
  /* piece: 'P','n' etc. setId, colors {w,b}, custom {wp: dataURL ...} */
  function pieceHTML(piece, setId, colors, custom) {
    var color = piece === piece.toUpperCase() ? 'w' : 'b', type = piece.toLowerCase();
    if (setId === 'custom' && custom && custom[color + type]) {
      return '<img alt="" draggable="false" src="' + custom[color + type] + '">';
    }
    var set = SETS.find(function (s) { return s.id === setId; }) || SETS[0];
    var fill = (colors && colors[color]) || set.colors[color];
    var key = set.id + type + fill;
    if (!cache[key]) cache[key] = set.draw(type, fill);
    return cache[key];
  }

  root.Pieces = { SETS: SETS, html: pieceHTML, mix: mix, lum: lum };
})(this);
