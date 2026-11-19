/* Pawn Stars – the website's front end. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ================= storage ================= */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('pawnstorm.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('pawnstorm.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  /* ================= settings ================= */
  var BOARD_THEMES = [
    { id: 'wood', name: 'Wood', light: '#f0d9b5', dark: '#b58863' },
    { id: 'grass', name: 'Grass', light: '#eeeed2', dark: '#769656' },
    { id: 'slate', name: 'Slate', light: '#dee3e6', dark: '#8ca2ad' },
    { id: 'ocean', name: 'Ocean', light: '#d9eef7', dark: '#3f7fa6' },
    { id: 'candy', name: 'Candy', light: '#fde4ee', dark: '#e3779f' },
    { id: 'grape', name: 'Grape', light: '#ebe2f7', dark: '#8a68c2' },
    { id: 'coral', name: 'Coral', light: '#f9e8d6', dark: '#d9705a' },
    { id: 'night', name: 'Night', light: '#6f7d96', dark: '#2f3a4f' },
    { id: 'sand', name: 'Sand', light: '#f4ead2', dark: '#c9a66b' },
    { id: 'ice', name: 'Ice', light: '#f1f8fc', dark: '#a7c8dc' },
    { id: 'lava', name: 'Lava', light: '#f6c177', dark: '#7a2e2e' },
    { id: 'mono', name: 'Mono', light: '#e6e6e6', dark: '#7d7d7d' }
  ];
  /* Website themes: site colours, board, matching pieces and an animated background. */
  var WORLDS = [
    { id: 'classic', name: 'Classic', fx: null, preview: 'linear-gradient(135deg,#1b2029,#12151c)',
      board: ['#f0d9b5', '#b58863'], hl: '#f5d742', set: 'royal', accent: null },
    { id: 'fire', name: 'Fire', fx: 'embers', preview: 'radial-gradient(circle at 50% 120%,#ff6a1a,#3a0d06 60%,#160806)',
      board: ['#f9c784', '#b8401f'], hl: '#ffd23f', set: 'ember', accent: '#ff7a1a',
      vars: { bg: '#160806', panel: 'rgba(40,14,9,0.82)', 'panel-2': '#3c1a11', ink: '#fff1e6', muted: '#dcab92', line: '#5e2b1b', glow: 'rgba(255,110,30,0.45)' } },
    { id: 'stars', name: 'Starry Night', fx: 'stars', preview: 'radial-gradient(circle at 70% 20%,#2c3a88,#0a0f2b 60%,#05081a)',
      board: ['#9db0e6', '#2c3a78'], hl: '#ffd45c', set: 'celestial', accent: '#ffd45c',
      vars: { bg: '#060a1d', panel: 'rgba(14,20,50,0.8)', 'panel-2': '#1b2452', ink: '#eef2ff', muted: '#a3afe0', line: '#2a3570', glow: 'rgba(120,150,255,0.45)' } },
    { id: 'water', name: 'Water', fx: 'bubbles', preview: 'linear-gradient(180deg,#1aa3b8,#06394a 70%,#04232e)',
      board: ['#c4f1f4', '#2b8fa8'], hl: '#7cf2e4', set: 'glass', accent: '#3fe0d0',
      vars: { bg: '#04232e', panel: 'rgba(6,50,64,0.78)', 'panel-2': '#0b4757', ink: '#e8fbff', muted: '#93cdd9', line: '#165c6d', glow: 'rgba(63,224,208,0.4)' } },
    { id: 'forest', name: 'Forest', fx: 'leaves', preview: 'linear-gradient(160deg,#3f6b34,#13261a 70%)',
      board: ['#e6dfb4', '#5f7f3e'], hl: '#d6e86a', set: 'wood', accent: '#9bdb4d',
      vars: { bg: '#0d1a10', panel: 'rgba(20,40,24,0.84)', 'panel-2': '#23412b', ink: '#eef7e9', muted: '#a8c3a1', line: '#2f5236', glow: 'rgba(155,219,77,0.3)' } },
    { id: 'snow', name: 'Snow', fx: 'snow', light: true, preview: 'linear-gradient(180deg,#ffffff,#cfe3f2)',
      board: ['#f4f9fd', '#9cc3e0'], hl: '#8fd3ff', set: 'crystal', accent: '#2b8fd6',
      vars: { bg: '#dfeaf4', panel: 'rgba(255,255,255,0.82)', 'panel-2': '#e3eef7', ink: '#13283a', muted: '#4f6a80', line: '#c2d6e6', glow: 'rgba(43,143,214,0.25)' } },
    { id: 'candy', name: 'Candy', fx: 'sprinkles', light: true, preview: 'linear-gradient(135deg,#ffd6e8,#fff3c9)',
      board: ['#fff3c9', '#ff9ec7'], hl: '#7cf29c', set: 'gummy', accent: '#ff4fa0',
      vars: { bg: '#ffe9f3', panel: 'rgba(255,255,255,0.85)', 'panel-2': '#ffe0ee', ink: '#4a1736', muted: '#9a5a7d', line: '#f6b8d3', glow: 'rgba(255,79,160,0.3)' } },
    { id: 'synth', name: 'Synthwave', fx: 'synth', preview: 'linear-gradient(180deg,#2e0b5c,#ff3ecf 140%)',
      board: ['#6c3fb0', '#241046'], hl: '#ff3ecf', set: 'neon', accent: '#ff3ecf',
      vars: { bg: '#12002b', panel: 'rgba(30,6,60,0.82)', 'panel-2': '#2e0b5c', ink: '#fbe9ff', muted: '#c8a2e9', line: '#4b1a85', glow: 'rgba(255,62,207,0.45)' } },
    { id: 'storm', name: 'Storm', fx: 'rain', preview: 'linear-gradient(180deg,#3a4452,#10141a)',
      board: ['#b9c3cf', '#56606e'], hl: '#8ecbff', set: 'marble', accent: '#8ecbff',
      vars: { bg: '#10141a', panel: 'rgba(28,34,44,0.86)', 'panel-2': '#2a3240', ink: '#e9eef5', muted: '#9aa7b8', line: '#36404f', glow: 'rgba(142,203,255,0.25)' } },
    { id: 'paper', name: 'Paper', fx: null, light: true, preview: 'repeating-linear-gradient(0deg,#f7f3e8 0 13px,#dcd3bd 13px 14px)',
      board: ['#f7f3e8', '#c9c1ad'], hl: '#f2d36b', set: 'sketch', accent: '#d9481c',
      vars: { bg: '#efe9da', panel: 'rgba(255,253,246,0.9)', 'panel-2': '#f3eddd', ink: '#2b2722', muted: '#6e6556', line: '#d6ccb5', glow: 'rgba(0,0,0,0.1)' } }
  ];
  function findWorld(id) { for (var i = 0; i < WORLDS.length; i++) if (WORLDS[i].id === id) return WORLDS[i]; return WORLDS[0]; }

  var ACCENTS = ['#f2b544', '#ff6b6b', '#4dabf7', '#51cf66', '#cc5de8', '#ff922b', '#22b8cf', '#f06595'];
  var DEFAULTS = {
    boardTheme: 'wood', light: '#f0d9b5', dark: '#b58863', hl: '#f5d742', sel: '#6fb1ff',
    pieceSet: 'royal', pieceColors: null, appTheme: 'dark', accent: null,
    coords: true, legal: true, sound: true, animate: true, autoQueen: false,
    world: 'classic', bgfx: true, customSets: []
  };
  var settings = Object.assign({}, DEFAULTS, LS.get('settings', {}));
  if (!Array.isArray(settings.customSets)) settings.customSets = [];
  Pieces.setCustom(settings.customSets);
  var customPieces = LS.get('customPieces', {});
  var prefs = Object.assign({ name: '', time: '10+0', color: 'random', isPublic: true, level: '2', aiColor: 'w' }, LS.get('prefs', {}));
  // Seats in games: this tab's own seats, plus ones saved from earlier visits.
  // Keeping them per tab means two tabs in one browser can be two different players.
  var SS = {
    get: function (k, d) { try { var v = sessionStorage.getItem('pawnstorm.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { sessionStorage.setItem('pawnstorm.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var tokens = SS.get('tokens', {});
  var savedTokens = LS.get('tokens', {});
  function rememberToken(code, t) {
    tokens[code] = t; SS.set('tokens', tokens);
    savedTokens[code] = t; LS.set('tokens', savedTokens);
  }

  function saveSettings() { LS.set('settings', settings); }
  function savePrefs() { LS.set('prefs', prefs); }

  function pieceColors() {
    if (settings.pieceColors) return settings.pieceColors;
    return Pieces.find(settings.pieceSet).colors;
  }
  function pieceHTML(p, setId) { return Pieces.html(p, setId || settings.pieceSet, setId && setId !== settings.pieceSet ? null : pieceColors(), customPieces); }

  var WORLD_VARS = ['bg', 'panel', 'panel-2', 'ink', 'muted', 'line', 'glow'];
  function applySettings() {
    var root = document.documentElement;
    var world = findWorld(settings.world);
    Pieces.setCustom(settings.customSets);
    if (world.vars) {
      root.setAttribute('data-theme', world.light ? 'light' : 'dark');
      root.setAttribute('data-world', world.id);
      WORLD_VARS.forEach(function (k) { root.style.setProperty('--' + k, world.vars[k]); });
    } else {
      root.removeAttribute('data-world');
      WORLD_VARS.forEach(function (k) { root.style.removeProperty('--' + k); });
      var theme = settings.appTheme;
      if (theme === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', theme);
    }
    if (window.Effects) Effects.set(settings.bgfx ? world.fx : null);
    root.style.setProperty('--sq-light', settings.light);
    root.style.setProperty('--sq-dark', settings.dark);
    root.style.setProperty('--hl', settings.hl);
    root.style.setProperty('--sel', settings.sel);
    if (settings.accent) {
      root.style.setProperty('--accent', settings.accent);
      root.style.setProperty('--accent-ink', Pieces.lum(settings.accent) > 0.55 ? '#1a1305' : '#ffffff');
    } else { root.style.removeProperty('--accent'); root.style.removeProperty('--accent-ink'); }
  }

  /* ================= sound ================= */
  var audio = null;
  function tone(freq, dur, type, vol, when) {
    if (!settings.sound) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var t = audio.currentTime + (when || 0), o = audio.createOscillator(), g = audio.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* no audio */ }
  }
  var sfx = {
    move: function () { tone(520, 0.07, 'triangle', 0.22); tone(260, 0.06, 'sine', 0.12); },
    capture: function () { tone(180, 0.14, 'square', 0.12); tone(360, 0.08, 'triangle', 0.18); },
    check: function () { tone(660, 0.1, 'triangle', 0.2); tone(880, 0.14, 'triangle', 0.2, 0.09); },
    end: function () { tone(523, 0.25, 'sine', 0.18); tone(659, 0.25, 'sine', 0.16, 0.12); tone(784, 0.4, 'sine', 0.16, 0.24); },
    start: function () { tone(440, 0.1, 'sine', 0.15); tone(660, 0.16, 'sine', 0.15, 0.1); }
  };
  function soundForSan(san) {
    if (!san) return;
    if (/[+#]/.test(san)) sfx.check(); else if (san.indexOf('x') >= 0) sfx.capture(); else sfx.move();
  }

  /* ================= toast & modal ================= */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function openModal(title, bodyEl) {
    $('#modalTitle').textContent = title;
    var b = $('#modalBody'); b.innerHTML = ''; b.appendChild(bodyEl);
    $('#modal').hidden = false;
    var f = b.querySelector('input, button'); if (f) setTimeout(function () { f.focus(); }, 30);
  }
  function closeModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal' && !modalLocked) closeModal(); });
  var modalLocked = false;

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  function askName() {
    return new Promise(function (resolve) {
      var input = el('input', { maxlength: '20', placeholder: 'Your name', autocomplete: 'nickname', id: 'nameAsk' });
      input.value = prefs.name || '';
      var form = el('form', { class: 'field' }, [
        el('label', { for: 'nameAsk', class: 'field-label', text: 'This is what your opponent sees.' }), input,
        el('button', { class: 'btn primary', type: 'submit', text: 'Continue' })
      ]);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var n = input.value.trim();
        if (!n) { input.focus(); return; }
        prefs.name = n.slice(0, 20); savePrefs(); $('#nameInput').value = prefs.name;
        modalLocked = false; closeModal(); resolve(prefs.name);
      });
      modalLocked = true;
      openModal("What's your name?", form);
    });
  }
  function ensureName() { return prefs.name ? Promise.resolve(prefs.name) : askName(); }

  /* ================= api ================= */
  function api(action, body) {
    return fetch('/api/' + action, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var err = new Error(j.error || 'Something went wrong. Try again.'); err.status = r.status; throw err; }
        return j;
      });
    }, function () { throw new Error("Can't reach the server. Check your internet connection."); });
  }

  /* ================= game state ================= */
  var mode = null;            // 'online' | 'ai' | 'local'
  var view = null;            // what the board and panels show
  var engine = new Chess();   // mirror of the live position (legal moves, history)
  var orientation = 'w';
  var viewIndex = null;       // null = live position, otherwise number of plies shown
  var selected = -1, targets = [];
  var renderedKey = '';       // to know when to animate
  var stream = null, online = { code: null, token: null, gameNo: 0 };
  var ai = { color: 'b', level: 2, thinking: false, worker: null, reqId: 0 };
  var resignArmed = false, resignTimer = null;

  function myColor() {
    if (!view) return null;
    if (mode === 'online') return view.you === 'w' || view.you === 'b' ? view.you : null;
    if (mode === 'ai') return ai.color === 'w' ? 'w' : 'b';
    return view.turn;
  }
  function canMove() {
    return view && view.status === 'playing' && viewIndex === null && !ai.thinking && myColor() === view.turn;
  }

  function localView() {
    var out = engine.outcome();
    var v = {
      fen: engine.fen(), turn: engine.turn, inCheck: engine.inCheck(), moves: localMoves.slice(), sans: localSans.slice(),
      lastMove: localMoves.length ? { from: localMoves[localMoves.length - 1].slice(0, 2), to: localMoves[localMoves.length - 1].slice(2, 4) } : null,
      status: localResult ? 'over' : out ? 'over' : 'playing',
      result: localResult ? localResult.result : out ? out.result : null,
      reason: localResult ? localResult.reason : out ? out.reason : null,
      players: mode === 'ai'
        ? { w: { name: ai.color === 'w' ? (prefs.name || 'You') : 'Computer · ' + levelName(ai.level), connected: true }, b: { name: ai.color === 'b' ? (prefs.name || 'You') : 'Computer · ' + levelName(ai.level), connected: true } }
        : { w: { name: 'White', connected: true }, b: { name: 'Black', connected: true } },
      clocks: null, you: mode === 'ai' ? ai.color : 'both'
    };
    return v;
  }
  var localMoves = [], localSans = [], localResult = null;
  function levelName(l) { return { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert' }[l] || 'Medium'; }

  /* ================= views ================= */
  function showView(name) {
    $('#homeView').hidden = name !== 'home';
    $('#gameView').hidden = name !== 'game';
    if (name === 'home') startLobbyPolling(); else stopLobbyPolling();
  }

  function goHome(push) {
    closeStream();
    delete $('#boardOverlay').dataset.gone; $('#boardOverlay').hidden = true; overlayKey = '';
    mode = null; view = null; online = { code: null, token: null, gameNo: 0 };
    stopAI();
    if (push !== false && location.pathname !== '/') history.pushState({}, '', '/');
    document.title = 'Pawn Stars Chess';
    showView('home');
  }

  /* ================= board building ================= */
  var squaresEl = $('#squares'), piecesEl = $('#piecesLayer'), boardEl = $('#board');
  var sqEls = [];
  (function buildSquares() {
    for (var i = 0; i < 64; i++) {
      var d = document.createElement('div');
      d.className = 'sq';
      squaresEl.appendChild(d);
      sqEls.push(d);
    }
  })();

  function displayIndex(sq) { return orientation === 'w' ? sq : 63 - sq; }
  function sqFromPoint(x, y) {
    var r = boardEl.getBoundingClientRect();
    var c = Math.floor((x - r.left) / r.width * 8), rr = Math.floor((y - r.top) / r.height * 8);
    if (c < 0 || c > 7 || rr < 0 || rr > 7) return -1;
    var i = rr * 8 + c;
    return orientation === 'w' ? i : 63 - i;
  }

  function shownPosition() {
    if (viewIndex === null) return { board: engine.board, lastMove: view && view.lastMove, check: engine.inCheck(), turn: engine.turn };
    var g = new Chess(), mv = null;
    for (var i = 0; i < viewIndex; i++) mv = g.move(view.moves[i]);
    return { board: g.board, lastMove: mv ? { from: mv.fromName, to: mv.toName } : null, check: g.inCheck(), turn: g.turn };
  }

  function renderBoard(animateMove) {
    if (!view) return;
    var pos = shownPosition();
    var lastFrom = pos.lastMove ? Chess.sqIndex(pos.lastMove.from) : -1, lastTo = pos.lastMove ? Chess.sqIndex(pos.lastMove.to) : -1;
    var kingSq = -1;
    if (pos.check) { var kc = pos.turn === 'w' ? 'K' : 'k'; kingSq = pos.board.indexOf(kc); }
    var targetSet = {};
    if (settings.legal) targets.forEach(function (m) { targetSet[m.to] = m.captured ? 'capture' : 'move'; });

    for (var d = 0; d < 64; d++) {
      var sq = orientation === 'w' ? d : 63 - d, r = sq >> 3, c = sq & 7;
      var cls = 'sq ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      if (sq === lastFrom || sq === lastTo) cls += ' last';
      if (sq === selected) cls += ' sel';
      if (sq === kingSq) cls += ' check';
      if (targetSet[sq]) cls += ' target' + (targetSet[sq] === 'capture' ? ' capture' : '');
      var e = sqEls[d];
      if (e.className !== cls) e.className = cls;
      var coords = '';
      if (settings.coords) {
        if (d >= 56) coords += '<span class="coord file">' + 'abcdefgh'[c] + '</span>';
        if (d % 8 === 0) coords += '<span class="coord rank">' + (8 - r) + '</span>';
      }
      if (e.innerHTML !== coords) e.innerHTML = coords;
    }

    var html = '';
    for (var s = 0; s < 64; s++) {
      var p = pos.board[s];
      if (!p) continue;
      var di = displayIndex(s);
      html += '<div class="piece" data-sq="' + s + '" style="transform:translate(' + ((di & 7) * 100) + '%,' + ((di >> 3) * 100) + '%)">' + pieceHTML(p) + '</div>';
    }
    piecesEl.innerHTML = html;

    if (animateMove && settings.animate && viewIndex === null && pos.lastMove) {
      var moved = piecesEl.querySelector('.piece[data-sq="' + lastTo + '"]');
      if (moved) {
        var fd = displayIndex(lastFrom), td = displayIndex(lastTo);
        moved.style.transform = 'translate(' + ((fd & 7) * 100) + '%,' + ((fd >> 3) * 100) + '%)';
        moved.getBoundingClientRect();
        moved.classList.add('anim');
        moved.style.transform = 'translate(' + ((td & 7) * 100) + '%,' + ((td >> 3) * 100) + '%)';
      }
    }
  }

  /* ================= input ================= */
  var drag = null;
  boardEl.addEventListener('pointerdown', function (e) {
    if (!view || e.button > 0) return;
    var sq = sqFromPoint(e.clientX, e.clientY);
    if (sq < 0) return;
    var p = engine.board[sq];
    var mine = canMove() && p && (p === p.toUpperCase() ? 'w' : 'b') === myColor();
    if (selected >= 0 && targets.some(function (m) { return m.to === sq; }) && !mine) {
      tryMove(selected, sq); return;
    }
    if (mine) {
      var wasSelected = selected === sq;
      select(sq);
      var pieceEl = piecesEl.querySelector('.piece[data-sq="' + sq + '"]');
      drag = { sq: sq, x: e.clientX, y: e.clientY, el: pieceEl, moved: false, wasSelected: wasSelected };
      try { boardEl.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    } else {
      if (viewIndex !== null && p) toast('You are looking at an earlier move. Press ⏭ to go back to the game.');
      clearSelection();
    }
  });
  var hoverEl = null;
  boardEl.addEventListener('pointermove', function (e) {
    if (!drag || !drag.el) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return;
    drag.moved = true;
    var r = boardEl.getBoundingClientRect(), size = r.width / 8;
    drag.el.classList.add('dragging');
    drag.el.style.transform = 'translate(' + (e.clientX - r.left - size / 2) + 'px,' + (e.clientY - r.top - size / 2) + 'px)';
    var over = sqFromPoint(e.clientX, e.clientY);
    var oe = over >= 0 ? sqEls[displayIndex(over)] : null;
    if (hoverEl !== oe) { if (hoverEl) hoverEl.classList.remove('hover'); hoverEl = oe; if (oe && targets.some(function (m) { return m.to === over; })) oe.classList.add('hover'); else hoverEl = null; }
  });
  function endDrag(e) {
    if (!drag) return;
    if (hoverEl) { hoverEl.classList.remove('hover'); hoverEl = null; }
    var d = drag; drag = null;
    if (d.moved) {
      var to = e ? sqFromPoint(e.clientX, e.clientY) : -1;
      if (to >= 0 && to !== d.sq && targets.some(function (m) { return m.to === to; })) { tryMove(d.sq, to, true); return; }
      renderBoard(false);
    } else if (d.wasSelected) clearSelection();
  }
  boardEl.addEventListener('pointerup', endDrag);
  boardEl.addEventListener('pointercancel', function () { endDrag(null); });

  function select(sq) {
    selected = sq;
    targets = engine.moves({ square: sq, raw: true });
    renderBoard(false);
  }
  function clearSelection() { selected = -1; targets = []; renderBoard(false); }

  function tryMove(from, to, dropped) {
    var cands = targets.filter(function (m) { return m.from === from && m.to === to; });
    if (!cands.length) return;
    if (cands[0].promotion && !settings.autoQueen) {
      choosePromotion(engine.turn).then(function (pp) {
        if (pp) commitMove({ from: from, to: to, promotion: pp }, dropped);
        else { clearSelection(); }
      });
      return;
    }
    commitMove({ from: from, to: to, promotion: cands[0].promotion ? 'q' : undefined }, dropped);
  }

  function choosePromotion(color) {
    return new Promise(function (resolve) {
      var row = el('div', { class: 'promo-row' });
      ['q', 'r', 'b', 'n'].forEach(function (t) {
        var b = el('button', { type: 'button', 'aria-label': { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' }[t], html: pieceHTML(color === 'w' ? t.toUpperCase() : t) });
        b.addEventListener('click', function () { closeModal(); resolve(t); });
        row.appendChild(b);
      });
      var cancel = el('button', { class: 'btn small', type: 'button', text: 'Cancel' });
      cancel.addEventListener('click', function () { closeModal(); resolve(null); });
      openModal('Promote your pawn to…', el('div', { class: 'field' }, [row, cancel]));
    });
  }

  function commitMove(mv, dropped) {
    var m = engine.move(mv);
    if (!m) { clearSelection(); return; }
    selected = -1; targets = [];
    soundForSan(m.san);
    if (mode === 'online') {
      // show it straight away, the server confirms a moment later
      if (view.clocks && view.clockRunning) {
        var left = currentClock(m.color), other = m.color === 'w' ? 'b' : 'w';
        view.clocks = { w: view.clocks.w, b: view.clocks.b };
        view.clocks[m.color] = left;
        view.receivedAt = Date.now();
        view.clocks[other] = view.clocks[other];
      }
      view.moves = view.moves.concat([m.uci]); view.sans = view.sans.concat([m.san]);
      view.lastMove = { from: m.fromName, to: m.toName }; view.turn = engine.turn;
      view.clockRunning = view.clockRunning || view.moves.length >= 2;
      renderedKey = view.moves.join(' ');
      renderAll(!dropped);
      api('move', { code: online.code, token: online.token, move: { from: m.fromName, to: m.toName, promotion: m.promotion } })
        .catch(function (err) { toast(err.message); resync(); });
    } else {
      localMoves.push(m.uci); localSans.push(m.san);
      view = localView();
      renderAll(!dropped);
      if (view.status === 'over') sfx.end();
      else if (mode === 'ai' && engine.turn !== ai.color) aiMove();
    }
  }

  /* ================= computer ================= */
  function getWorker() {
    if (ai.worker === null) {
      try { ai.worker = new Worker('/ai-worker.js'); } catch (e) { ai.worker = false; }
    }
    return ai.worker;
  }
  function aiMove() {
    ai.thinking = true; renderPanels();
    var id = ++ai.reqId, fen = engine.fen(), started = Date.now();
    function apply(mv) {
      if (id !== ai.reqId || mode !== 'ai') return;
      var wait = Math.max(0, 350 - (Date.now() - started));
      setTimeout(function () {
        if (id !== ai.reqId || mode !== 'ai') return;
        ai.thinking = false;
        if (!mv) { renderAll(false); return; }
        var m = engine.move(mv);
        localMoves.push(m.uci); localSans.push(m.san);
        view = localView();
        soundForSan(m.san);
        renderAll(true);
        if (view.status === 'over') sfx.end();
      }, wait);
    }
    var w = getWorker();
    if (w) {
      w.onmessage = function (e) { apply(e.data.move); };
      w.onerror = function () { ai.worker = false; apply(ChessAI.bestMove(fen, ai.level)); };
      w.postMessage({ id: id, fen: fen, level: ai.level });
    } else setTimeout(function () { apply(ChessAI.bestMove(fen, ai.level)); }, 30);
  }
  function stopAI() { ai.reqId++; ai.thinking = false; }

  function startLocal(kind) {
    closeStream();
    delete $('#boardOverlay').dataset.gone; overlayKey = '';
    mode = kind;
    engine = new Chess(); localMoves = []; localSans = []; localResult = null;
    viewIndex = null; selected = -1; targets = [];
    if (kind === 'ai') {
      ai.level = parseInt(prefs.level, 10) || 2;
      ai.color = prefs.aiColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : prefs.aiColor;
      orientation = ai.color;
    } else orientation = 'w';
    view = localView();
    if (location.pathname !== '/') history.pushState({}, '', '/');
    document.title = (kind === 'ai' ? 'Vs computer' : 'Pass and play') + ' · Pawn Stars';
    showView('game');
    renderAll(false);
    sfx.start();
    if (kind === 'ai' && ai.color === 'b') aiMove();
  }

  /* ================= online ================= */
  function closeStream() { if (stream) { stream.close(); stream = null; } }

  function createOnline() {
    ensureName().then(function (name) {
      var btn = $('#createBtn'); btn.disabled = true;
      api('create', { name: name, time: prefs.time, color: prefs.color, isPublic: prefs.isPublic })
        .then(function (res) {
          rememberToken(res.code, res.token);
          history.pushState({}, '', '/g/' + res.code);
          connect(res.code, res.token);
        })
        .catch(function (err) { toast(err.message); })
        .then(function () { btn.disabled = false; });
    });
  }

  function joinOnline(code) {
    code = String(code || '').trim().toUpperCase();
    code = code.replace(/\s+/g, '');
    if (!/^[A-Z0-9]{4,8}$/.test(code)) { toast('Game codes are 4 numbers, like 4821.'); return; }
    ensureName().then(function (name) {
      api('join', { code: code, name: name, token: tokens[code], savedToken: savedTokens[code] })
        .then(function (res) {
          rememberToken(code, res.token);
          if (location.pathname !== '/g/' + code) history.pushState({}, '', '/g/' + code);
          if (res.color === 'spectator') toast('This game already has two players. You are watching.');
          connect(code, res.token);
        })
        .catch(function (err) {
          toast(err.message);
          if (err.status === 404) goHome();
        });
    });
  }

  function connect(code, token) {
    closeStream(); stopAI();
    delete $('#boardOverlay').dataset.gone; overlayKey = '';
    mode = 'online'; online = { code: code, token: token, gameNo: 0 };
    engine = new Chess(); view = null; viewIndex = null; selected = -1; targets = []; renderedKey = '';
    showView('game');
    $('#statusLine').textContent = 'Connecting…';
    document.title = 'Game ' + code + ' · Pawn Stars';
    var es = new EventSource('/api/stream?code=' + encodeURIComponent(code) + '&token=' + encodeURIComponent(token));
    stream = es;
    var lostTimer = null;
    es.onmessage = function (e) {
      clearTimeout(lostTimer); online.lost = false;
      try { onState(JSON.parse(e.data)); } catch (err) { console.error(err); }
    };
    es.onerror = function () {
      if (stream !== es) return;
      online.lost = true; renderPanels();
      if (es.readyState === 2) {
        // the server said no: the game is gone (often the server restarted)
        stream = null;
        showGoneOverlay();
      }
    };
  }

  function resync() {
    if (mode === 'online' && online.code) connect(online.code, online.token);
  }

  function onState(s) {
    var prevMoves = view ? view.moves.length : 0, prevStatus = view ? view.status : null, firstForGame = s.gameNo !== online.gameNo;
    s.receivedAt = Date.now();
    var key = s.moves.join(' ');
    var needRebuild = key !== engine.history.map(function (u) { return u.move.uci || (Chess.sqName(u.move.from) + Chess.sqName(u.move.to) + (u.move.promotion || '')); }).join(' ');
    if (needRebuild) {
      engine = new Chess();
      s.moves.forEach(function (u) { engine.move(u); });
      selected = -1; targets = [];
    }
    var animate = key !== renderedKey && s.moves.length === prevMoves + 1 && !firstForGame;
    if (animate && s.moves.length > prevMoves) soundForSan(s.sans[s.sans.length - 1]);
    view = s;
    if (firstForGame) {
      online.gameNo = s.gameNo;
      orientation = s.you === 'b' ? 'b' : 'w';
      viewIndex = null;
      if (s.gameNo > 1 || (prevStatus === 'waiting' && s.status === 'playing')) sfx.start();
    } else if (prevStatus === 'waiting' && s.status === 'playing') sfx.start();
    if (prevStatus === 'playing' && s.status === 'over') sfx.end();
    renderedKey = key;
    if (selected >= 0) targets = canMove() ? engine.moves({ square: selected, raw: true }) : [];
    renderAll(animate);
  }

  /* ================= panels ================= */
  function renderAll(animate) {
    renderBoard(animate);
    renderPanels();
  }

  function currentClock(color) {
    if (!view || !view.clocks) return null;
    var ms = view.clocks[color];
    if (view.clockRunning && view.status === 'playing' && view.turn === color) ms -= Date.now() - view.receivedAt;
    return Math.max(0, ms);
  }
  function fmtClock(ms) {
    if (ms === null) return '';
    var s = ms / 1000;
    if (s < 20) return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2) + '.' + Math.floor((s * 10) % 10);
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + ('0' + sec).slice(-2);
  }

  function material(board) {
    var start = { p: 8, n: 2, b: 2, r: 2, q: 1 }, val = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    var have = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
    board.forEach(function (p) { if (!p || /k/i.test(p)) return; have[p === p.toUpperCase() ? 'w' : 'b'][p.toLowerCase()]++; });
    var score = { w: 0, b: 0 };
    ['w', 'b'].forEach(function (c) { Object.keys(val).forEach(function (t) { score[c] += have[c][t] * val[t]; }); });
    // pieces each side has taken = what the other side is missing
    var took = { w: [], b: [] };
    ['q', 'r', 'b', 'n', 'p'].forEach(function (t) {
      for (var i = have.b[t]; i < start[t]; i++) took.w.push(t);
      for (var j = have.w[t]; j < start[t]; j++) took.b.push(t.toUpperCase());
    });
    return { took: took, diff: score.w - score.b };
  }

  function renderPlayerBar(barEl, color) {
    var p = view.players && view.players[color];
    var mat = material(shownPosition().board);
    var took = mat.took[color].slice(0, 15);
    var adv = color === 'w' ? mat.diff : -mat.diff;
    var isYou = mode === 'online' ? view.you === color : mode === 'ai' ? ai.color === color : false;
    var name = p ? p.name + (isYou && mode === 'online' ? ' (you)' : '') : 'Waiting for a player…';
    var presence = '';
    if (mode === 'online' && p) presence = '<span class="presence' + (p.connected ? ' on' : '') + '">' + (p.connected ? 'online' : 'away') + '</span>';
    var thinking = mode === 'ai' && ai.thinking && !isYou && view.turn === color ? '<span class="thinking"><span class="spinner"></span> thinking</span>' : '';
    var clockMs = currentClock(color);
    var clockCls = 'clock' + (clockMs === null ? ' hidden' : '') + (view.status === 'playing' && view.turn === color && view.clockRunning ? ' active' : '') + (clockMs !== null && clockMs < 20000 && view.status === 'playing' ? ' low' : '');
    barEl.innerHTML =
      '<span class="dot ' + color + '"></span>' +
      '<div class="who"><span class="pname"></span>' +
      '<span class="captured">' + took.map(function (t) { return '<span class="cp">' + pieceHTML(color === 'w' ? t : t) + '</span>'; }).join('') +
      (adv > 0 ? '<span class="adv">+' + adv + '</span>' : '') + '</span></div>' +
      presence + thinking +
      '<div class="' + clockCls + '" data-clock="' + color + '">' + fmtClock(clockMs) + '</div>';
    barEl.querySelector('.pname').textContent = name;
  }

  function resultText() {
    var r = view.result, reason = view.reason || '';
    if (r === '*') return { title: reason === 'aborted' ? 'Game aborted' : 'Game cancelled', sub: 'No result.' };
    if (r === '1/2-1/2') return { title: 'Draw', sub: 'By ' + reason + '.' };
    var winner = r === '1-0' ? 'w' : 'b';
    var wname = view.players && view.players[winner] ? view.players[winner].name : (winner === 'w' ? 'White' : 'Black');
    var why = { checkmate: 'by checkmate', resignation: 'by resignation', time: 'on time' }[reason] || reason;
    var title;
    if (mode === 'local') title = (winner === 'w' ? 'White' : 'Black') + ' wins';
    else if (myColor() === winner) title = 'You win!';
    else if (myColor()) title = wname + ' wins';
    else title = wname + ' wins';
    return { title: title, sub: (winner === 'w' ? 'White' : 'Black') + ' won ' + why + '.' };
  }

  function renderPanels() {
    if (!view) return;
    var top = orientation === 'w' ? 'b' : 'w', bottom = orientation;
    renderPlayerBar($('#topBar'), top);
    renderPlayerBar($('#bottomBar'), bottom);

    // status
    var st = $('#statusLine'), sub = '';
    var line;
    if (view.status === 'waiting') { line = 'Waiting for your friend'; sub = 'Send them the link.'; }
    else if (view.status === 'over') { var rt = resultText(); line = rt.title; sub = rt.sub; }
    else {
      var me = myColor();
      if (mode === 'local') line = (view.turn === 'w' ? 'White' : 'Black') + ' to move';
      else if (me === view.turn) line = 'Your move';
      else if (mode === 'ai') line = 'Computer is thinking';
      else if (me) line = 'Their move';
      else line = (view.turn === 'w' ? 'White' : 'Black') + ' to move';
      if (view.inCheck || engine.inCheck()) sub = 'Check!';
      else if (mode === 'online' && view.timeControl && !view.clockRunning) sub = 'Clocks start after both players have moved.';
      if (mode === 'online' && view.you === 'spectator') sub = 'You are watching' + (sub ? ' · ' + sub : '.');
    }
    if (mode === 'online') {
      if (online.lost) sub = 'Reconnecting to the server…';
      else if (view.spectators) sub += (sub ? ' ' : '') + view.spectators + ' watching.';
      if (view.timeControl) line += ' · ' + view.timeControl;
    }
    st.innerHTML = '';
    st.appendChild(document.createTextNode(line));
    if (sub) st.appendChild(el('span', { class: 'sub', text: sub }));

    renderOffer();
    renderActions();
    renderMoves();
    renderChat();
    renderOverlay();
  }

  function renderOffer() {
    var b = $('#offerBanner'); b.innerHTML = '';
    if (mode !== 'online' || !view) { b.hidden = true; return; }
    var me = view.you, opp = me === 'w' ? 'b' : 'w';
    if (view.status === 'playing' && view.drawOffer && (me === 'w' || me === 'b')) {
      if (view.drawOffer === opp) {
        b.appendChild(el('span', { class: 'grow', text: 'Your opponent offers a draw.' }));
        b.appendChild(el('button', { class: 'btn small primary', type: 'button', text: 'Accept draw', onclick: function () { api('draw', { code: online.code, token: online.token, op: 'accept' }).catch(function (e) { toast(e.message); }); } }));
        b.appendChild(el('button', { class: 'btn small', type: 'button', text: 'Decline', onclick: function () { api('draw', { code: online.code, token: online.token, op: 'decline' }).catch(function (e) { toast(e.message); }); } }));
      } else {
        b.appendChild(el('span', { class: 'grow', text: 'You offered a draw.' }));
        b.appendChild(el('button', { class: 'btn small', type: 'button', text: 'Take it back', onclick: function () { api('draw', { code: online.code, token: online.token, op: 'cancel' }).catch(function (e) { toast(e.message); }); } }));
      }
      b.hidden = false; return;
    }
    if (view.status === 'over' && view.rematch && (me === 'w' || me === 'b') && view.rematch[opp] && !view.rematch[me]) {
      b.appendChild(el('span', { class: 'grow', text: 'Your opponent wants a rematch.' }));
      b.appendChild(el('button', { class: 'btn small primary', type: 'button', text: 'Play again', onclick: function () { api('rematch', { code: online.code, token: online.token }).catch(function (e) { toast(e.message); }); } }));
      b.hidden = false; return;
    }
    b.hidden = true;
  }

  function actionBtn(text, cls, fn) { return el('button', { class: 'btn small ' + (cls || ''), type: 'button', text: text, onclick: fn }); }

  function renderActions() {
    var a = $('#actions'); a.innerHTML = '';
    a.appendChild(actionBtn('Flip board', '', function () { orientation = orientation === 'w' ? 'b' : 'w'; renderAll(false); }));
    if (mode === 'online') {
      var seated = view.you === 'w' || view.you === 'b';
      if (view.status === 'waiting') {
        a.appendChild(actionBtn('Copy invite link', 'primary', copyLink));
        if (seated) a.appendChild(actionBtn('Cancel game', 'danger', function () { api('cancel', { code: online.code, token: online.token }).then(function () { goHome(); }); }));
      } else if (view.status === 'playing' && seated) {
        if (view.drawOffer !== view.you && view.moves.length >= 2) a.appendChild(actionBtn('Offer draw', '', function () { api('draw', { code: online.code, token: online.token, op: 'offer' }).then(function () { toast('Draw offered.'); }).catch(function (e) { toast(e.message); }); }));
        var label = view.moves.length < 2 ? 'Abort game' : 'Resign';
        a.appendChild(actionBtn(resignArmed ? 'Sure? Click again' : label, 'danger', function () {
          if (!resignArmed) { resignArmed = true; renderActions(); clearTimeout(resignTimer); resignTimer = setTimeout(function () { resignArmed = false; renderActions(); }, 3000); return; }
          resignArmed = false; api('resign', { code: online.code, token: online.token }).catch(function (e) { toast(e.message); });
        }));
      } else if (view.status === 'over') {
        if (seated && view.players.w && view.players.b) {
          var asked = view.rematch && view.rematch[view.you];
          a.appendChild(actionBtn(asked ? 'Cancel rematch' : 'Rematch', asked ? '' : 'primary', function () {
            api('rematch', { code: online.code, token: online.token, op: asked ? 'cancel' : 'ask' }).catch(function (e) { toast(e.message); });
          }));
        }
        a.appendChild(actionBtn('New game', '', function () { goHome(); }));
      }
      if (view.status !== 'waiting') a.appendChild(actionBtn('Copy link', '', copyLink));
    } else {
      if (view.status === 'playing') {
        a.appendChild(actionBtn('Take back', '', takeBack));
        a.appendChild(actionBtn(resignArmed ? 'Sure? Click again' : 'Resign', 'danger', function () {
          if (!resignArmed) { resignArmed = true; renderActions(); clearTimeout(resignTimer); resignTimer = setTimeout(function () { resignArmed = false; renderActions(); }, 3000); return; }
          resignArmed = false; stopAI();
          var loser = mode === 'ai' ? ai.color : engine.turn;
          localResult = { result: loser === 'w' ? '0-1' : '1-0', reason: 'resignation' };
          view = localView(); renderAll(false); sfx.end();
        }));
      }
      a.appendChild(actionBtn('Restart', view.status === 'over' ? 'primary' : '', function () { startLocal(mode); }));
      a.appendChild(actionBtn('Home', '', function () { goHome(); }));
    }
  }

  function takeBack() {
    stopAI();
    var n = mode === 'ai' ? (engine.turn === ai.color ? 2 : 1) : 1;
    for (var i = 0; i < n && localMoves.length; i++) { engine.undo(); localMoves.pop(); localSans.pop(); }
    localResult = null; selected = -1; targets = []; viewIndex = null;
    view = localView(); renderAll(false);
    if (mode === 'ai' && engine.turn !== ai.color && view.status === 'playing') aiMove();
  }

  function renderMoves() {
    var list = $('#moveList'); list.innerHTML = '';
    var sans = view.sans || [];
    if (!sans.length) { list.appendChild(el('li', { class: 'empty', text: 'No moves yet.' })); return; }
    var cur = viewIndex === null ? sans.length : viewIndex;
    for (var i = 0; i < sans.length; i += 2) {
      list.appendChild(el('li', { class: 'num', text: (i / 2 + 1) + '.' }));
      [i, i + 1].forEach(function (k) {
        if (k >= sans.length) { list.appendChild(el('li')); return; }
        var li = el('li', { class: 'mv' + (k + 1 === cur ? ' cur' : ''), text: sans[k] });
        li.addEventListener('click', function () { goTo(k + 1); });
        list.appendChild(li);
      });
    }
    var c = list.querySelector('.cur');
    if (c && viewIndex === null) list.scrollTop = list.scrollHeight;
    else if (c) c.scrollIntoView({ block: 'nearest' });
  }

  function goTo(n) {
    if (!view) return;
    var total = (view.moves || []).length;
    n = Math.max(0, Math.min(total, n));
    viewIndex = n === total ? null : n;
    selected = -1; targets = [];
    renderAll(false);
  }
  $('#navFirst').addEventListener('click', function () { goTo(0); });
  $('#navPrev').addEventListener('click', function () { goTo((viewIndex === null ? view.moves.length : viewIndex) - 1); });
  $('#navNext').addEventListener('click', function () { goTo((viewIndex === null ? view.moves.length : viewIndex) + 1); });
  $('#navLast').addEventListener('click', function () { goTo(Infinity); });
  document.addEventListener('keydown', function (e) {
    if (!view || $('#gameView').hidden || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft') { goTo((viewIndex === null ? view.moves.length : viewIndex) - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { goTo((viewIndex === null ? view.moves.length : viewIndex) + 1); e.preventDefault(); }
    if (e.key === 'Escape') { clearSelection(); }
  });

  var lastChatLen = 0;
  function renderChat() {
    var card = $('#chatCard');
    if (mode !== 'online') { card.hidden = true; return; }
    card.hidden = false;
    var list = $('#chatList');
    var msgs = view.chat || [];
    var stick = list.scrollTop + list.clientHeight >= list.scrollHeight - 10;
    list.innerHTML = '';
    if (!msgs.length) list.appendChild(el('li', { class: 'sys', text: 'Messages show up here.' }));
    msgs.forEach(function (m) {
      if (m.from === 'system') { list.appendChild(el('li', { class: 'sys', text: m.text })); return; }
      list.appendChild(el('li', {}, [el('b', { text: m.name + ':' }), m.text]));
    });
    if (stick || msgs.length !== lastChatLen) list.scrollTop = list.scrollHeight;
    lastChatLen = msgs.length;
  }
  $('#chatForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#chatInput'), text = inp.value.trim();
    if (!text || mode !== 'online') return;
    inp.value = '';
    api('chat', { code: online.code, token: online.token, text: text, name: prefs.name }).catch(function (err) { toast(err.message); inp.value = text; });
  });

  function inviteLink() { return location.origin + '/g/' + online.code; }
  function copyLink() {
    var link = inviteLink();
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject())
      .then(function () { toast('Link copied. Paste it to your friend.'); })
      .catch(function () {
        var inp = $('#inviteInput'); if (inp) { inp.select(); }
        toast('Copy the link from the box: ' + link);
      });
  }

  var overlayKey = '';
  function renderOverlay() {
    var o = $('#boardOverlay');
    var key = mode + '|' + (view && view.status) + '|' + (view && view.result) + '|' + (view && view.gameNo) + '|' + (online.code || '');
    if (mode === 'online' && view && view.status === 'waiting') {
      if (overlayKey === key) return;
      overlayKey = key;
      var seated = view.you === 'w' || view.you === 'b';
      var inp = el('input', { id: 'inviteInput', readonly: 'readonly', 'aria-label': 'Invite link' });
      inp.value = inviteLink();
      inp.addEventListener('focus', function () { inp.select(); });
      var card = el('div', { class: 'overlay-card' }, [
        el('h2', { text: seated ? 'Invite a friend' : 'Waiting for players' }),
        el('div', { class: 'muted', text: 'Send them this link, or tell them the code to type in on the home page:' }),
        el('div', { class: 'code-big', text: online.code }),
        el('div', { class: 'link-box' }, [inp, el('button', { class: 'btn primary', type: 'button', text: 'Copy', onclick: copyLink })]),
        el('div', { class: 'muted small-text', html: '<span class="spinner"></span>&nbsp; The game starts when they open it.' })
      ]);
      o.innerHTML = ''; o.appendChild(card); o.hidden = false;
      return;
    }
    if (view && view.status === 'over' && viewIndex === null) {
      if (overlayKey === key) return;
      overlayKey = key;
      var rt = resultText();
      var btns = el('div', { class: 'btn-row', style: 'justify-content:center' });
      if (mode === 'online') {
        var seatedO = view.you === 'w' || view.you === 'b';
        if (seatedO && view.players.w && view.players.b) btns.appendChild(el('button', { class: 'btn primary', type: 'button', text: 'Rematch', onclick: function () { api('rematch', { code: online.code, token: online.token }).then(function () { o.hidden = true; }).catch(function (e) { toast(e.message); }); } }));
      } else btns.appendChild(el('button', { class: 'btn primary', type: 'button', text: 'Play again', onclick: function () { startLocal(mode); } }));
      btns.appendChild(el('button', { class: 'btn', type: 'button', text: 'Look at the board', onclick: function () { o.hidden = true; } }));
      var c2 = el('div', { class: 'overlay-card' }, [el('h2', { text: rt.title }), el('div', { class: 'muted', text: rt.sub }), btns]);
      o.innerHTML = ''; o.appendChild(c2); o.hidden = false;
      return;
    }
    if (o.dataset.gone) return;
    overlayKey = key;
    o.hidden = true;
  }

  function showGoneOverlay() {
    var o = $('#boardOverlay');
    o.dataset.gone = '1';
    var card = el('div', { class: 'overlay-card' }, [
      el('h2', { text: 'This game is no longer available' }),
      el('div', { class: 'muted', text: 'The game may have been cancelled, or the server restarted (it does that after a while with nobody on it). Start a new game from the home page.' }),
      el('button', { class: 'btn primary', type: 'button', text: 'Go to home page', onclick: function () { delete o.dataset.gone; goHome(); } })
    ]);
    o.innerHTML = ''; o.appendChild(card); o.hidden = false;
  }

  /* clocks tick locally between server updates */
  setInterval(function () {
    if (!view || !view.clocks || mode !== 'online') return;
    $$('[data-clock]').forEach(function (c) {
      var col = c.getAttribute('data-clock'), ms = currentClock(col);
      c.textContent = fmtClock(ms);
      c.classList.toggle('low', ms < 20000 && view.status === 'playing');
    });
  }, 100);

  /* ================= home ================= */
  function setupChips(id, key, onChange) {
    var group = $(id);
    function paint() {
      $$('.chip', group).forEach(function (c) {
        c.setAttribute('role', 'radio');
        c.setAttribute('aria-checked', String(c.getAttribute('data-v') === String(key.get())));
      });
    }
    group.addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (!c) return;
      key.set(c.getAttribute('data-v')); paint(); if (onChange) onChange();
    });
    paint();
    return paint;
  }
  function prefKey(k) { return { get: function () { return prefs[k]; }, set: function (v) { prefs[k] = v; savePrefs(); } }; }

  setupChips('#timeChips', prefKey('time'));
  setupChips('#colorChips', prefKey('color'));
  setupChips('#levelChips', prefKey('level'));
  setupChips('#aiColorChips', prefKey('aiColor'));
  $('#publicCheck').checked = prefs.isPublic !== false;
  $('#publicCheck').addEventListener('change', function (e) { prefs.isPublic = e.target.checked; savePrefs(); });
  $('#nameInput').value = prefs.name || '';
  $('#nameInput').addEventListener('input', function (e) { prefs.name = e.target.value.trim().slice(0, 20); savePrefs(); });
  $('#createBtn').addEventListener('click', createOnline);
  $('#joinForm').addEventListener('submit', function (e) { e.preventDefault(); joinOnline($('#codeInput').value); });
  $('#aiBtn').addEventListener('click', function () { startLocal('ai'); });
  $('#localBtn').addEventListener('click', function () { startLocal('local'); });
  $('#homeBtn').addEventListener('click', function () { goHome(); });
  $('#brandLink').addEventListener('click', function (e) { e.preventDefault(); goHome(); });

  var lobbyTimer = null;
  function loadLobby() {
    fetch('/api/lobby').then(function (r) { return r.json(); }).then(function (data) {
      var list = $('#lobbyList'); list.innerHTML = '';
      $('#playingCount').textContent = data.playing ? data.playing + (data.playing === 1 ? ' game' : ' games') + ' being played' : '';
      if (!data.games.length) { list.appendChild(el('li', { class: 'muted', text: 'No open games right now. Create one and it will show up here for your friends.' })); return; }
      data.games.forEach(function (g) {
        var youGet = g.hostColor === 'w' ? 'Black' : 'White';
        var mine = !!(tokens[g.code] || savedTokens[g.code]);
        list.appendChild(el('li', { class: 'lobby-item' }, [
          el('div', { class: 'who' }, [el('b', { text: g.host }), el('span', { text: (g.time ? g.time + ' clock' : 'No clock') + ' · you play ' + youGet })]),
          el('button', { class: 'btn small ' + (mine ? '' : 'primary'), type: 'button', text: mine ? 'Open' : 'Join', onclick: function () { joinOnline(g.code); } })
        ]));
      });
    }).catch(function () {
      $('#lobbyList').innerHTML = '';
      $('#lobbyList').appendChild(el('li', { class: 'muted', text: "Can't reach the server right now. It may be waking up; give it a minute." }));
    });
  }
  function startLobbyPolling() { stopLobbyPolling(); loadLobby(); lobbyTimer = setInterval(loadLobby, 4000); }
  function stopLobbyPolling() { clearInterval(lobbyTimer); lobbyTimer = null; }

  /* ================= customise drawer ================= */
  function openDrawer() {
    $('#drawer').hidden = false; $('#drawerBackdrop').hidden = false;
    renderDrawer();
    $('#drawerClose').focus();
  }
  function closeDrawer() { $('#drawer').hidden = true; $('#drawerBackdrop').hidden = true; }
  $('#customiseBtn').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#drawerBackdrop').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });

  var activeTab = 'world';
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () { maker = null; activeTab = t.getAttribute('data-tab'); renderDrawer(); });
  });
  function renderTabs() {
    $$('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === (activeTab === 'maker' ? 'pieces' : activeTab))); });
    $$('.tab-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== activeTab; });
  }

  function changed() {
    saveSettings(); applySettings(); renderHomeThemes();
    if (activeTab !== 'maker') renderDrawer();
    if (view) renderAll(false);
  }

  function renderDrawer() {
    renderTabs();
    // preview strip
    $('#previewStrip').innerHTML = ['K', 'q', 'N', 'b', 'R', 'p'].map(function (p) { return '<div>' + pieceHTML(p) + '</div>'; }).join('');

    // board swatches
    var bs = $('#boardSwatches'); bs.innerHTML = '';
    BOARD_THEMES.forEach(function (t) {
      var on = settings.boardTheme === t.id;
      var sw = el('button', { class: 'swatch', type: 'button', role: 'radio', 'aria-checked': String(on), 'aria-label': t.name + ' board' });
      sw.innerHTML = '<span class="mini"><span style="background:' + t.light + '"></span><span style="background:' + t.dark + '"></span><span style="background:' + t.dark + '"></span><span style="background:' + t.light + '"></span></span>';
      sw.appendChild(el('span', { text: t.name }));
      sw.addEventListener('click', function () { settings.boardTheme = t.id; settings.light = t.light; settings.dark = t.dark; changed(); });
      bs.appendChild(sw);
    });
    $('#lightColor').value = settings.light; $('#darkColor').value = settings.dark;
    $('#hlColor').value = settings.hl; $('#selColor').value = settings.sel;
    $('#optCoords').checked = settings.coords; $('#optLegal').checked = settings.legal;

    // website themes
    var ws = $('#worldSwatches'); ws.innerHTML = '';
    WORLDS.forEach(function (w) {
      var on = settings.world === w.id;
      var b = el('button', { class: 'world', type: 'button', role: 'radio', 'aria-checked': String(on), 'aria-label': w.name + ' theme' });
      var ph = function (pc) { return Pieces.html(pc, w.set, null, customPieces); };
      b.innerHTML = '<span class="scene" style="background:' + w.preview + '"><span class="mb"><span style="background:' + w.board[0] + '">' + ph('K') + '</span><span style="background:' + w.board[1] + '">' + ph('q') + '</span><span style="background:' + w.board[0] + '">' + ph('N') + '</span></span></span>';
      b.appendChild(el('span', { class: 'nm', text: w.name }));
      b.addEventListener('click', function () { applyWorld(w.id); });
      ws.appendChild(b);
    });
    $('#optBgfx').checked = settings.bgfx;

    // piece sets
    var ss = $('#setSwatches'); ss.innerHTML = '';
    Pieces.allSets().forEach(function (s) {
      var on = settings.pieceSet === s.id;
      var sw = el('button', { class: 'swatch', type: 'button', role: 'radio', 'aria-checked': String(on), 'aria-label': s.name + ' pieces' });
      var cols = on ? pieceColors() : s.colors;
      var p = function (pc) { return Pieces.html(pc, s.id, cols, customPieces); };
      sw.innerHTML = '<span class="mini set"><span style="background:' + settings.light + '">' + p('K') + '</span><span style="background:' + settings.dark + '">' + p('n') + '</span>' +
        '<span style="background:' + settings.dark + '">' + p('q') + '</span><span style="background:' + settings.light + '">' + p('P') + '</span></span>';
      sw.appendChild(el('span', { text: s.name }));
      if (isMine(s.id)) sw.appendChild(el('span', { class: 'tag', text: on ? 'Yours · click to edit' : 'Yours' }));
      sw.addEventListener('click', function () {
        if (on && isMine(s.id)) { openMaker(s); return; }
        settings.pieceSet = s.id; settings.pieceColors = null; changed();
      });
      ss.appendChild(sw);
    });
    var pc = pieceColors();
    $('#wPieceColor').value = pc.w; $('#bPieceColor').value = pc.b;

    // uploads
    var ug = $('#uploadGrid'); ug.innerHTML = '';
    ['wk', 'wq', 'wr', 'wb', 'wn', 'wp', 'bk', 'bq', 'br', 'bb', 'bn', 'bp'].forEach(function (k) {
      var names = { k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn' };
      var label = (k[0] === 'w' ? 'White ' : 'Black ') + names[k[1]].toLowerCase();
      var slot = el('label', { class: 'upload-slot', title: 'Upload ' + label });
      if (customPieces[k]) slot.appendChild(el('img', { src: customPieces[k], alt: '' }));
      else slot.appendChild(el('span', { text: '+' }));
      slot.appendChild(el('span', { class: 'lbl', text: names[k[1]][0] === 'K' && k[1] === 'n' ? 'N' : k[1].toUpperCase() }));
      var inp = el('input', { type: 'file', accept: 'image/*', 'aria-label': 'Upload ' + label });
      inp.addEventListener('change', function () { if (inp.files[0]) loadPieceImage(k, inp.files[0]); });
      slot.appendChild(inp);
      ug.appendChild(slot);
    });

    // app
    $$('#appThemeChips .chip').forEach(function (c) { c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', String(c.getAttribute('data-v') === settings.appTheme)); });
    var ar = $('#accentRow'); ar.innerHTML = '';
    ACCENTS.forEach(function (a, i) {
      var on = (settings.accent || null) === (i === 0 ? null : a) || settings.accent === a;
      var d = el('button', { class: 'accent-dot', type: 'button', role: 'radio', 'aria-checked': String(on), 'aria-label': 'Accent colour ' + a, style: 'background:' + a });
      d.addEventListener('click', function () { settings.accent = i === 0 ? null : a; changed(); });
      ar.appendChild(d);
    });
    var pick = el('input', { type: 'color', 'aria-label': 'Pick any accent colour' });
    pick.value = settings.accent || '#f2b544';
    pick.addEventListener('input', function () { settings.accent = pick.value; saveSettings(); applySettings(); });
    pick.addEventListener('change', function () { changed(); });
    ar.appendChild(pick);
    $('#optSound').checked = settings.sound; $('#optAnim').checked = settings.animate; $('#optAutoQueen').checked = settings.autoQueen;
  }

  function isMine(id) { return /^my-/.test(id); }

  function applyWorld(id) {
    var w = findWorld(id);
    settings.world = w.id;
    settings.light = w.board[0]; settings.dark = w.board[1]; settings.boardTheme = 'world';
    settings.hl = w.hl; settings.pieceSet = w.set; settings.pieceColors = null; settings.accent = w.accent;
    changed();
  }

  function renderHomeThemes() {
    var box = $('#homeThemes'); if (!box) return;
    box.innerHTML = '';
    WORLDS.forEach(function (w) {
      var b = el('button', { class: 'theme-chip', type: 'button', role: 'radio', 'aria-checked': String(settings.world === w.id) });
      b.appendChild(el('span', { class: 'sw', style: 'background:' + w.preview }));
      b.appendChild(document.createTextNode(w.name));
      b.addEventListener('click', function () { applyWorld(w.id); });
      box.appendChild(b);
    });
  }

  /* ---------- make your own set ---------- */
  var maker = null;
  var SCULPT = { classic: 1, chunky: 1, slim: 1 };
  function openMaker(base) {
    base = base || Pieces.find(settings.pieceSet);
    if (base.photos) base = Pieces.find('royal');
    var spec = JSON.parse(JSON.stringify(base.spec || {}));
    var glow = spec.glow && typeof spec.glow === 'object' ? spec.glow.w : spec.glow;
    spec.glow = glow && glow !== 'self' ? glow : glow === 'self' ? '#ffffff' : null;
    var cols = isMine(base.id) ? base.colors : (base.id === settings.pieceSet ? pieceColors() : base.colors);
    maker = {
      editing: isMine(base.id) ? base.id : null,
      name: isMine(base.id) ? base.name : '',
      spec: spec, colors: { w: cols.w, b: cols.b },
      outlineColor: spec.outline && spec.outline !== 'tone' ? spec.outline : '#222222',
      glowColor: spec.glow || '#ffd45c'
    };
    if (spec.finish === 'neon') maker.spec.glow = null;
    activeTab = 'maker';
    renderTabs(); renderMaker();
    $('#drawer').scrollTop = 0;
  }
  function makerChips(id, list, key) {
    var box = $(id); box.innerHTML = '';
    list.forEach(function (it) {
      var cur = maker.spec[key] || list[0][0];
      var c = el('button', { class: 'chip', type: 'button', role: 'radio', 'aria-checked': String(cur === it[0]), text: it[1] });
      c.addEventListener('click', function () { maker.spec[key] = it[0]; renderMaker(); });
      box.appendChild(c);
    });
  }
  function renderMaker() {
    if (!maker) return;
    var sp = maker.spec;
    makerChips('#makerShape', Pieces.SHAPES, 'shape');
    makerChips('#makerFinish', Pieces.FINISHES, 'finish');
    makerChips('#makerDeco', Pieces.DECOS, 'deco');
    var sculpt = !!SCULPT[sp.shape || 'classic'];
    $('#makerSculpt').hidden = !sculpt;
    $('#makerStroke').disabled = !sculpt;
    $('#makerName').value = maker.name;
    $('#makerW').value = maker.colors.w; $('#makerB').value = maker.colors.b;
    var auto = !sp.outline || sp.outline === 'tone';
    $('#makerAutoOutline').checked = auto;
    $('#makerOutline').value = maker.outlineColor;
    $('#makerStroke').value = sp.stroke === undefined ? 2.6 : sp.stroke;
    $('#makerGlowOn').checked = !!sp.glow;
    $('#makerGlow').value = maker.glowColor;
    $('#makerDelete').hidden = !maker.editing;
    renderMakerPreview();
  }
  function renderMakerPreview() {
    var order = ['r', 'n', 'b', 'q', 'k', 'p', 'P', 'K', 'Q', 'B', 'N', 'R'];
    $('#makerPreview').innerHTML = order.map(function (p) { return '<span>' + Pieces.preview(p, maker.spec, maker.colors) + '</span>'; }).join('');
  }
  function makerInput(id, fn) { $(id).addEventListener('input', function (e) { if (!maker) return; fn(e.target); renderMakerPreview(); }); }
  makerInput('#makerName', function (t) { maker.name = t.value.slice(0, 18); });
  makerInput('#makerW', function (t) { maker.colors.w = t.value; });
  makerInput('#makerB', function (t) { maker.colors.b = t.value; });
  makerInput('#makerOutline', function (t) { maker.outlineColor = t.value; maker.spec.outline = t.value; $('#makerAutoOutline').checked = false; });
  makerInput('#makerAutoOutline', function (t) { maker.spec.outline = t.checked ? null : maker.outlineColor; });
  makerInput('#makerStroke', function (t) { maker.spec.stroke = parseFloat(t.value); });
  makerInput('#makerGlowOn', function (t) { maker.spec.glow = t.checked ? maker.glowColor : null; });
  makerInput('#makerGlow', function (t) { maker.glowColor = t.value; maker.spec.glow = t.value; $('#makerGlowOn').checked = true; });
  $('#makeSetBtn').addEventListener('click', function () { openMaker(); });
  $('#makerBack').addEventListener('click', function () { maker = null; activeTab = 'pieces'; renderDrawer(); });
  $('#makerSave').addEventListener('click', function () {
    var sp = JSON.parse(JSON.stringify(maker.spec));
    if (!sp.outline) delete sp.outline;
    if (!sp.glow) delete sp.glow;
    var mine = settings.customSets.filter(function (x) { return isMine(x.id); });
    var name = (maker.name || '').trim() || 'My set ' + (mine.length + 1);
    var set = { id: maker.editing || 'my-' + Date.now().toString(36), name: name, colors: { w: maker.colors.w, b: maker.colors.b }, spec: sp };
    var i = settings.customSets.findIndex(function (x) { return x.id === set.id; });
    if (i >= 0) settings.customSets[i] = set;
    else {
      if (settings.customSets.length >= 24) { toast('You can keep up to 24 sets. Delete one first.'); return; }
      settings.customSets.push(set);
    }
    settings.pieceSet = set.id; settings.pieceColors = null;
    maker = null; activeTab = 'pieces';
    changed();
    toast('Saved "' + name + '". You can find it under Piece style.');
  });
  $('#makerDelete').addEventListener('click', function () {
    if (!maker || !maker.editing) return;
    var b = $('#makerDelete');
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure? Click again'; setTimeout(function () { delete b.dataset.armed; b.textContent = 'Delete set'; }, 3000); return; }
    delete b.dataset.armed; b.textContent = 'Delete set';
    var id = maker.editing;
    settings.customSets = settings.customSets.filter(function (x) { return x.id !== id; });
    if (settings.pieceSet === id) { settings.pieceSet = 'royal'; settings.pieceColors = null; }
    maker = null; activeTab = 'pieces';
    changed();
    toast('Set deleted.');
  });

  function bindColor(id, fn) {
    var inp = $(id);
    inp.addEventListener('input', function () { fn(inp.value); saveSettings(); applySettings(); if (view) renderAll(false); });
    inp.addEventListener('change', function () { changed(); });
  }
  bindColor('#lightColor', function (v) { settings.light = v; settings.boardTheme = 'custom'; });
  bindColor('#darkColor', function (v) { settings.dark = v; settings.boardTheme = 'custom'; });
  bindColor('#hlColor', function (v) { settings.hl = v; });
  bindColor('#selColor', function (v) { settings.sel = v; });
  bindColor('#wPieceColor', function (v) { var c = pieceColors(); settings.pieceColors = { w: v, b: c.b }; });
  bindColor('#bPieceColor', function (v) { var c = pieceColors(); settings.pieceColors = { w: c.w, b: v }; });
  $('#resetPieceColors').addEventListener('click', function () { settings.pieceColors = null; changed(); });
  function bindCheck(id, key) { $(id).addEventListener('change', function (e) { settings[key] = e.target.checked; changed(); }); }
  bindCheck('#optCoords', 'coords'); bindCheck('#optLegal', 'legal'); bindCheck('#optSound', 'sound');
  bindCheck('#optAnim', 'animate'); bindCheck('#optAutoQueen', 'autoQueen'); bindCheck('#optBgfx', 'bgfx');
  $('#appThemeChips').addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c) return;
    settings.appTheme = c.getAttribute('data-v');
    if (settings.world !== 'classic') { settings.world = 'classic'; toast('Switched to the Classic theme so light or dark can apply.'); }
    changed();
  });
  $('#clearCustom').addEventListener('click', function () { customPieces = {}; LS.set('customPieces', customPieces); changed(); });
  $('#resetAll').addEventListener('click', function () {
    settings = Object.assign({}, DEFAULTS, { customSets: settings.customSets });
    changed(); toast('Back to the default look. Your own piece sets are still saved.');
  });

  function loadPieceImage(key, file) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var size = 160, cv = document.createElement('canvas'); cv.width = cv.height = size;
        var ctx = cv.getContext('2d'), s = Math.min(size / img.width, size / img.height);
        var w = img.width * s, h = img.height * s;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        customPieces[key] = cv.toDataURL('image/png');
        if (!LS.set('customPieces', customPieces)) toast("That image couldn't be saved. Try a smaller picture.");
        if (settings.pieceSet !== 'custom') { settings.pieceSet = 'custom'; settings.pieceColors = null; }
        changed();
      };
      img.onerror = function () { toast("That file isn't an image this browser can read."); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ================= routing ================= */
  function route() {
    var m = /^\/g\/([A-Za-z0-9]{4,8})\/?$/.exec(location.pathname);
    if (m) {
      var code = m[1].toUpperCase();
      if (mode === 'online' && online.code === code) return;
      showView('game');
      $('#statusLine').textContent = 'Joining game ' + code + '…';
      joinOnline(code);
    } else if (mode !== 'ai' && mode !== 'local') goHome(false);
  }
  window.addEventListener('popstate', route);

  $('#codeInput').addEventListener('input', function (e) {
    // keep only numbers; if someone pastes a whole link, use the code at the end of it
    var v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length > 4) v = v.slice(-4);
    if (v !== e.target.value) e.target.value = v;
  });

  applySettings();
  renderHomeThemes();
  route();
})();
