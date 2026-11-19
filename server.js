/* Chess website server – no extra packages needed, just Node 18+.
   Run with:  node server.js   (then open http://localhost:3000) */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
// The site files can live in a "public" folder or loose next to this file; both work.
const PUBLIC = fs.existsSync(path.join(__dirname, 'public', 'index.html')) ? path.join(__dirname, 'public') : __dirname;
const Chess = require(path.join(PUBLIC, 'chess-engine.js'));
const games = new Map();

/* ---------- helpers ---------- */
/* Game codes are 4 numbers (1000-9999) so they're easy to say out loud. */
function newCode() {
  let c, tries = 0;
  do {
    c = String(crypto.randomInt(1000, 10000));
    tries++;
  } while (games.has(c) && tries < 20000);
  return c;
}
const newToken = () => crypto.randomBytes(16).toString('hex');
function cleanName(n) {
  n = String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20);
  return n || 'Player';
}
function parseTime(t) {
  const m = /^(\d{1,3})\+(\d{1,2})$/.exec(String(t || ''));
  if (!m) return null;
  const base = parseInt(m[1], 10), inc = parseInt(m[2], 10);
  if (base < 1 || base > 180) return null;
  return { base: base * 60000, inc: inc * 1000, label: base + '+' + inc };
}
function other(c) { return c === 'w' ? 'b' : 'w'; }

/* ---------- game logic ---------- */
function createGame(opts) {
  const code = newCode();
  const tc = parseTime(opts.time);
  const g = {
    code,
    created: Date.now(),
    lastActive: Date.now(),
    isPublic: opts.isPublic !== false,
    tc,
    players: { w: null, b: null },
    chess: new Chess(),
    moves: [],
    sans: [],
    lastMove: null,
    clocks: tc ? { w: tc.base, b: tc.base } : null,
    turnStartedAt: null,
    status: 'waiting',
    result: null,
    reason: null,
    drawOffer: null,
    rematch: { w: false, b: false },
    chat: [],
    clients: new Set(),
    gameNo: 1,
  };
  games.set(code, g);
  return g;
}

function seatOf(g, token) {
  if (!token) return null;
  if (g.players.w && g.players.w.token === token) return 'w';
  if (g.players.b && g.players.b.token === token) return 'b';
  return null;
}

function clockRunning(g) {
  return !!(g.tc && g.status === 'playing' && g.moves.length >= 2);
}

function liveClocks(g) {
  if (!g.clocks) return null;
  const c = { w: g.clocks.w, b: g.clocks.b };
  if (clockRunning(g)) c[g.chess.turn] = Math.max(0, c[g.chess.turn] - (Date.now() - g.turnStartedAt));
  return c;
}

function endGame(g, result, reason) {
  if (g.clocks && clockRunning(g)) {
    const t = g.chess.turn;
    g.clocks[t] = Math.max(0, g.clocks[t] - (Date.now() - g.turnStartedAt));
  }
  g.status = 'over';
  g.result = result;
  g.reason = reason;
  g.drawOffer = null;
  g.rematch = { w: false, b: false };
}

function isConnected(g, color) {
  const p = g.players[color];
  if (!p) return false;
  for (const c of g.clients) if (c.token === p.token) return true;
  return false;
}

function stateFor(g, token) {
  const you = seatOf(g, token) || 'spectator';
  let spectators = 0;
  for (const c of g.clients) if (!seatOf(g, c.token)) spectators++;
  const pl = (c) => g.players[c] ? { name: g.players[c].name, connected: isConnected(g, c) } : null;
  return {
    type: 'state',
    code: g.code,
    gameNo: g.gameNo,
    status: g.status,
    result: g.result,
    reason: g.reason,
    fen: g.chess.fen(),
    moves: g.moves,
    sans: g.sans,
    lastMove: g.lastMove,
    turn: g.chess.turn,
    inCheck: g.chess.inCheck(),
    players: { w: pl('w'), b: pl('b') },
    clocks: liveClocks(g),
    clockRunning: clockRunning(g),
    timeControl: g.tc ? g.tc.label : null,
    drawOffer: g.drawOffer,
    rematch: g.rematch,
    chat: g.chat.slice(-60),
    isPublic: g.isPublic,
    you,
    spectators,
    serverTime: Date.now(),
  };
}

function broadcast(g) {
  g.lastActive = Date.now();
  for (const c of g.clients) {
    try { c.res.write('data: ' + JSON.stringify(stateFor(g, c.token)) + '\n\n'); } catch (e) { /* closed */ }
  }
}

function doMove(g, color, mv) {
  if (g.status !== 'playing') return 'The game is not in progress.';
  if (g.chess.turn !== color) return "It's not your turn.";
  const now = Date.now();
  // clocks start once both sides have made their first move
  const running = clockRunning(g);
  const used = running ? now - g.turnStartedAt : 0;
  if (running && g.clocks[color] - used <= 0) {
    flag(g, color);
    return 'Your time ran out.';
  }
  const m = g.chess.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
  if (!m) return 'That move is not allowed.';
  if (running) g.clocks[color] = g.clocks[color] - used + g.tc.inc;
  g.moves.push(m.uci);
  g.sans.push(m.san);
  g.lastMove = { from: m.fromName, to: m.toName };
  g.turnStartedAt = now;
  if (g.drawOffer && g.drawOffer !== color) g.drawOffer = null; // moving declines a draw offer
  const out = g.chess.outcome();
  if (out) endGame(g, out.result, out.reason);
  return null;
}

function flag(g, color) {
  const opp = other(color);
  // if the opponent can't possibly checkmate, a timeout is a draw
  if (g.chess.insufficient(opp)) endGame(g, '1/2-1/2', 'timeout vs insufficient material');
  else endGame(g, opp === 'w' ? '1-0' : '0-1', 'time');
  g.clocks[color] = 0;
}

function startRematch(g) {
  const w = g.players.w, b = g.players.b;
  g.players = { w: b, b: w };
  g.chess = new Chess();
  g.moves = [];
  g.sans = [];
  g.lastMove = null;
  g.clocks = g.tc ? { w: g.tc.base, b: g.tc.base } : null;
  g.turnStartedAt = Date.now();
  g.status = 'playing';
  g.result = null;
  g.reason = null;
  g.drawOffer = null;
  g.rematch = { w: false, b: false };
  g.gameNo++;
  g.chat.push({ from: 'system', text: 'Rematch started. Colours swapped.', t: Date.now() });
}

/* Timeouts are checked on the server so nobody can stall a lost game. */
setInterval(() => {
  const now = Date.now();
  for (const g of games.values()) {
    if (clockRunning(g)) {
      const t = g.chess.turn;
      if (g.clocks[t] - (now - g.turnStartedAt) <= 0) { flag(g, t); broadcast(g); }
    }
    // tidy up old, empty games
    const idle = now - g.lastActive;
    if (g.clients.size === 0 && (idle > 3 * 3600e3 || (g.status === 'waiting' && idle > 30 * 60e3))) games.delete(g.code);
  }
}, 500);

/* Keep live connections open through proxies. */
setInterval(() => {
  for (const g of games.values()) for (const c of g.clients) { try { c.res.write(': ping\n\n'); } catch (e) {} }
}, 20000);

/* ---------- HTTP ---------- */
function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (ch) => {
      data += ch;
      if (data.length > 20000) { data = ''; req.destroy(); }
    });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
};

function serveStatic(req, res, urlPath) {
  if (urlPath === '/' || /^\/g\/[A-Za-z0-9]{4,8}\/?$/.test(urlPath)) urlPath = '/index.html';
  const file = path.normalize(path.join(PUBLIC, decodeURIComponent(urlPath)));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

const chatTimes = new Map();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (req.method === 'GET' && p === '/api/stream') {
    const g = games.get(String(url.searchParams.get('code') || '').toUpperCase());
    if (!g) return sendJSON(res, 404, { error: 'Game not found.' });
    res.writeHead(200, {
      'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive', 'X-Accel-Buffering': 'no',
    });
    res.write('retry: 2000\n\n');
    const client = { res, token: url.searchParams.get('token') || '' };
    g.clients.add(client);
    broadcast(g);
    req.on('close', () => { g.clients.delete(client); broadcast(g); });
    return;
  }

  if (req.method === 'GET' && p === '/api/lobby') {
    const list = [];
    let playing = 0;
    for (const g of games.values()) {
      if (g.status === 'playing') playing++;
      if (g.isPublic && g.status === 'waiting') {
        const hostColor = g.players.w ? 'w' : 'b';
        if (!isConnected(g, hostColor)) continue;
        list.push({ code: g.code, host: g.players[hostColor].name, hostColor, time: g.tc ? g.tc.label : null, created: g.created });
      }
    }
    list.sort((a, b) => b.created - a.created);
    return sendJSON(res, 200, { games: list.slice(0, 30), playing });
  }

  if (req.method === 'POST' && p.startsWith('/api/')) {
    const body = await readBody(req);
    const action = p.slice(5);

    if (action === 'create') {
      const g = createGame({ time: body.time, isPublic: body.isPublic });
      let color = body.color;
      if (color !== 'w' && color !== 'b') color = Math.random() < 0.5 ? 'w' : 'b';
      const token = newToken();
      g.players[color] = { token, name: cleanName(body.name) };
      return sendJSON(res, 200, { code: g.code, token, color });
    }

    const g = games.get(String(body.code || '').toUpperCase());
    if (!g) return sendJSON(res, 404, { error: 'No game with that code. Check the code, or the game may have ended.' });

    if (action === 'join') {
      const existing = seatOf(g, body.token);
      if (existing) return sendJSON(res, 200, { token: body.token, color: existing });
      // a seat saved from an earlier visit is only handed back if nobody is using it right now
      const saved = seatOf(g, body.savedToken);
      if (saved && !isConnected(g, saved)) return sendJSON(res, 200, { token: body.savedToken, color: saved });
      const free = !g.players.w ? 'w' : !g.players.b ? 'b' : null;
      if (free && g.status === 'waiting') {
        const token = newToken();
        g.players[free] = { token, name: cleanName(body.name) };
        g.status = 'playing';
        g.turnStartedAt = Date.now();
        g.chat.push({ from: 'system', text: cleanName(body.name) + ' joined. Game on!', t: Date.now() });
        broadcast(g);
        return sendJSON(res, 200, { token, color: free });
      }
      return sendJSON(res, 200, { token: body.token || newToken(), color: 'spectator' });
    }

    const color = seatOf(g, body.token);

    if (action === 'chat') {
      const text = String(body.text || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 200);
      if (!text) return sendJSON(res, 400, { error: 'Empty message.' });
      const key = body.token || req.socket.remoteAddress;
      if (Date.now() - (chatTimes.get(key) || 0) < 600) return sendJSON(res, 429, { error: 'Slow down a little.' });
      chatTimes.set(key, Date.now());
      const name = color ? g.players[color].name : cleanName(body.name || 'Spectator');
      g.chat.push({ from: color || 'spectator', name, text, t: Date.now() });
      if (g.chat.length > 100) g.chat.splice(0, g.chat.length - 100);
      broadcast(g);
      return sendJSON(res, 200, { ok: true });
    }

    if (!color) return sendJSON(res, 403, { error: "You're watching this game, not playing in it." });

    if (action === 'move') {
      const err = doMove(g, color, body.move || {});
      broadcast(g);
      return err ? sendJSON(res, 400, { error: err }) : sendJSON(res, 200, { ok: true });
    }

    if (action === 'resign') {
      if (g.status !== 'playing') return sendJSON(res, 400, { error: 'The game is not in progress.' });
      if (g.moves.length < 2) endGame(g, '*', 'aborted');
      else endGame(g, color === 'w' ? '0-1' : '1-0', 'resignation');
      broadcast(g);
      return sendJSON(res, 200, { ok: true });
    }

    if (action === 'draw') {
      if (g.status !== 'playing') return sendJSON(res, 400, { error: 'The game is not in progress.' });
      const op = body.op;
      if (op === 'offer') {
        if (g.drawOffer === other(color)) endGame(g, '1/2-1/2', 'agreement');
        else g.drawOffer = color;
      } else if (op === 'accept' && g.drawOffer === other(color)) endGame(g, '1/2-1/2', 'agreement');
      else if (op === 'decline' && g.drawOffer === other(color)) g.drawOffer = null;
      else if (op === 'cancel' && g.drawOffer === color) g.drawOffer = null;
      broadcast(g);
      return sendJSON(res, 200, { ok: true });
    }

    if (action === 'rematch') {
      if (g.status !== 'over' || !g.players.w || !g.players.b) return sendJSON(res, 400, { error: 'Rematch is only available after a game ends.' });
      g.rematch[color] = body.op !== 'cancel';
      if (g.rematch.w && g.rematch.b) startRematch(g);
      broadcast(g);
      return sendJSON(res, 200, { ok: true });
    }

    if (action === 'cancel') {
      if (g.status === 'waiting') { endGame(g, '*', 'cancelled'); broadcast(g); games.delete(g.code); }
      return sendJSON(res, 200, { ok: true });
    }

    return sendJSON(res, 404, { error: 'Unknown action.' });
  }

  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res, p);
  res.writeHead(405); res.end();
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error('\nPort ' + PORT + ' is already in use. Is the test server already open in another window? Close it and try again.\n');
  else console.error(e);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log('');
  console.log('  Pawn Stars is running!');
  console.log('  On this laptop:   http://localhost:' + PORT);
  console.log('  Self-test page:   http://localhost:' + PORT + '/test.html');
  const nets = require('os').networkInterfaces();
  for (const name of Object.keys(nets)) for (const n of nets[name] || []) {
    if (n.family === 'IPv4' && !n.internal) console.log('  Other devices on the same Wi-Fi:  http://' + n.address + ':' + PORT);
  }
  console.log('');
  console.log('  Keep this window open while you test. Close it (or press Ctrl+C) to stop.');
  console.log('');
});
