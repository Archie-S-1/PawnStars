/* Chess rules engine – works in the browser and in Node.
   Squares are 0..63, index = row*8 + col, row 0 = rank 8, col 0 = file a. */
(function (root) {
  'use strict';

  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  var FILES = 'abcdefgh';

  function sqName(i) { return FILES[i & 7] + (8 - (i >> 3)); }
  function sqIndex(n) {
    if (!n || n.length !== 2) return -1;
    var c = FILES.indexOf(n[0]), r = 8 - parseInt(n[1], 10);
    if (c < 0 || r < 0 || r > 7 || isNaN(r)) return -1;
    return r * 8 + c;
  }
  function colorOf(p) { return p ? (p === p.toUpperCase() ? 'w' : 'b') : null; }
  function typeOf(p) { return p ? p.toLowerCase() : null; }

  var KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  var KING = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  var DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]];
  var ORTHO = [[-1,0],[1,0],[0,-1],[0,1]];

  function Chess(fen) {
    this.load(fen || START_FEN);
  }

  Chess.START_FEN = START_FEN;
  Chess.sqName = sqName;
  Chess.sqIndex = sqIndex;

  Chess.prototype.load = function (fen) {
    var parts = fen.trim().split(/\s+/);
    var b = new Array(64).fill(null);
    var rows = parts[0].split('/');
    if (rows.length !== 8) throw new Error('Bad FEN');
    for (var r = 0; r < 8; r++) {
      var c = 0;
      for (var k = 0; k < rows[r].length; k++) {
        var ch = rows[r][k];
        if (/\d/.test(ch)) c += parseInt(ch, 10);
        else { b[r * 8 + c] = ch; c++; }
      }
    }
    this.board = b;
    this.turn = parts[1] || 'w';
    var cs = parts[2] || '-';
    this.castling = { K: cs.indexOf('K') >= 0, Q: cs.indexOf('Q') >= 0, k: cs.indexOf('k') >= 0, q: cs.indexOf('q') >= 0 };
    this.ep = parts[3] && parts[3] !== '-' ? sqIndex(parts[3]) : -1;
    this.halfmove = parseInt(parts[4] || '0', 10);
    this.fullmove = parseInt(parts[5] || '1', 10);
    this.history = [];
    this.positions = {};
    this.positions[this.posKey()] = 1;
  };

  Chess.prototype.fen = function () {
    var s = '';
    for (var r = 0; r < 8; r++) {
      var empty = 0;
      for (var c = 0; c < 8; c++) {
        var p = this.board[r * 8 + c];
        if (!p) empty++;
        else { if (empty) { s += empty; empty = 0; } s += p; }
      }
      if (empty) s += empty;
      if (r < 7) s += '/';
    }
    var cs = (this.castling.K ? 'K' : '') + (this.castling.Q ? 'Q' : '') + (this.castling.k ? 'k' : '') + (this.castling.q ? 'q' : '');
    return s + ' ' + this.turn + ' ' + (cs || '-') + ' ' + (this.ep >= 0 ? sqName(this.ep) : '-') + ' ' + this.halfmove + ' ' + this.fullmove;
  };

  Chess.prototype.posKey = function () {
    return this.fen().split(' ').slice(0, 4).join(' ');
  };

  Chess.prototype.get = function (sq) {
    if (typeof sq === 'string') sq = sqIndex(sq);
    return this.board[sq];
  };

  Chess.prototype.kingSquare = function (color) {
    var k = color === 'w' ? 'K' : 'k';
    for (var i = 0; i < 64; i++) if (this.board[i] === k) return i;
    return -1;
  };

  /* Is square `sq` attacked by side `by`? */
  Chess.prototype.attacked = function (sq, by) {
    var b = this.board, r = sq >> 3, c = sq & 7, i, nr, nc, p;
    // pawns
    var pr = by === 'w' ? r + 1 : r - 1;
    var pawn = by === 'w' ? 'P' : 'p';
    if (pr >= 0 && pr < 8) {
      if (c > 0 && b[pr * 8 + c - 1] === pawn) return true;
      if (c < 7 && b[pr * 8 + c + 1] === pawn) return true;
    }
    var kn = by === 'w' ? 'N' : 'n', kg = by === 'w' ? 'K' : 'k';
    for (i = 0; i < 8; i++) {
      nr = r + KNIGHT[i][0]; nc = c + KNIGHT[i][1];
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return true;
      nr = r + KING[i][0]; nc = c + KING[i][1];
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kg) return true;
    }
    var bq = by === 'w' ? 'B' : 'b', rq = by === 'w' ? 'R' : 'r', qq = by === 'w' ? 'Q' : 'q';
    for (i = 0; i < 4; i++) {
      nr = r + DIAG[i][0]; nc = c + DIAG[i][1];
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        p = b[nr * 8 + nc];
        if (p) { if (p === bq || p === qq) return true; break; }
        nr += DIAG[i][0]; nc += DIAG[i][1];
      }
      nr = r + ORTHO[i][0]; nc = c + ORTHO[i][1];
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        p = b[nr * 8 + nc];
        if (p) { if (p === rq || p === qq) return true; break; }
        nr += ORTHO[i][0]; nc += ORTHO[i][1];
      }
    }
    return false;
  };

  Chess.prototype.inCheck = function (color) {
    color = color || this.turn;
    var k = this.kingSquare(color);
    return k >= 0 && this.attacked(k, color === 'w' ? 'b' : 'w');
  };

  Chess.prototype._pseudo = function () {
    var out = [], b = this.board, us = this.turn, them = us === 'w' ? 'b' : 'w';
    var self = this;
    function add(from, to, flags, promo) {
      var m = { from: from, to: to, piece: b[from], captured: null, flags: flags || '' };
      if (flags.indexOf('e') >= 0) m.captured = us === 'w' ? 'p' : 'P';
      else if (b[to]) m.captured = b[to];
      if (promo) m.promotion = promo;
      out.push(m);
    }
    for (var from = 0; from < 64; from++) {
      var p = b[from];
      if (!p || colorOf(p) !== us) continue;
      var t = typeOf(p), r = from >> 3, c = from & 7, i, nr, nc, to, q;
      if (t === 'p') {
        var dir = us === 'w' ? -1 : 1, startRow = us === 'w' ? 6 : 1, lastRow = us === 'w' ? 0 : 7;
        nr = r + dir;
        if (nr >= 0 && nr < 8) {
          to = nr * 8 + c;
          if (!b[to]) {
            if (nr === lastRow) ['q', 'r', 'b', 'n'].forEach(function (pp) { add(from, to, 'p', pp); });
            else {
              add(from, to, '');
              if (r === startRow && !b[(r + 2 * dir) * 8 + c]) add(from, (r + 2 * dir) * 8 + c, 'd');
            }
          }
          [-1, 1].forEach(function (dc) {
            var cc = c + dc;
            if (cc < 0 || cc > 7) return;
            var t2 = nr * 8 + cc;
            if (b[t2] && colorOf(b[t2]) === them) {
              if (nr === lastRow) ['q', 'r', 'b', 'n'].forEach(function (pp) { add(from, t2, 'cp', pp); });
              else add(from, t2, 'c');
            } else if (t2 === self.ep) add(from, t2, 'e');
          });
        }
      } else if (t === 'n' || t === 'k') {
        var offs = t === 'n' ? KNIGHT : KING;
        for (i = 0; i < 8; i++) {
          nr = r + offs[i][0]; nc = c + offs[i][1];
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
          to = nr * 8 + nc;
          if (!b[to]) add(from, to, '');
          else if (colorOf(b[to]) === them) add(from, to, 'c');
        }
        if (t === 'k') {
          var home = us === 'w' ? 60 : 4;
          if (from === home && !this.attacked(home, them)) {
            var ks = us === 'w' ? 'K' : 'k', qs = us === 'w' ? 'Q' : 'q', rook = us === 'w' ? 'R' : 'r';
            if (this.castling[ks] && b[home + 3] === rook && !b[home + 1] && !b[home + 2] &&
                !this.attacked(home + 1, them) && !this.attacked(home + 2, them)) add(from, home + 2, 'k');
            if (this.castling[qs] && b[home - 4] === rook && !b[home - 1] && !b[home - 2] && !b[home - 3] &&
                !this.attacked(home - 1, them) && !this.attacked(home - 2, them)) add(from, home - 2, 'q');
          }
        }
      } else {
        var dirs = t === 'b' ? DIAG : t === 'r' ? ORTHO : DIAG.concat(ORTHO);
        for (i = 0; i < dirs.length; i++) {
          nr = r + dirs[i][0]; nc = c + dirs[i][1];
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            to = nr * 8 + nc;
            if (!b[to]) add(from, to, '');
            else { if (colorOf(b[to]) === them) add(from, to, 'c'); break; }
            nr += dirs[i][0]; nc += dirs[i][1];
          }
        }
      }
    }
    return out;
  };

  Chess.prototype._make = function (m) {
    var b = this.board, us = this.turn;
    var undo = {
      move: m, castling: { K: this.castling.K, Q: this.castling.Q, k: this.castling.k, q: this.castling.q },
      ep: this.ep, halfmove: this.halfmove, fullmove: this.fullmove
    };
    b[m.to] = m.promotion ? (us === 'w' ? m.promotion.toUpperCase() : m.promotion) : b[m.from];
    b[m.from] = null;
    if (m.flags.indexOf('e') >= 0) b[us === 'w' ? m.to + 8 : m.to - 8] = null;
    if (m.flags.indexOf('k') >= 0) { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = null; }
    if (m.flags.indexOf('q') >= 0) { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = null; }
    // castling rights
    var t = typeOf(m.piece);
    if (t === 'k') { if (us === 'w') { this.castling.K = this.castling.Q = false; } else { this.castling.k = this.castling.q = false; } }
    [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']].forEach(function (x) {
      if (m.from === x[0] || m.to === x[0]) this.castling[x[1]] = false;
    }, this);
    this.ep = m.flags.indexOf('d') >= 0 ? (us === 'w' ? m.to + 8 : m.to - 8) : -1;
    this.halfmove = (t === 'p' || m.captured) ? 0 : this.halfmove + 1;
    if (us === 'b') this.fullmove++;
    this.turn = us === 'w' ? 'b' : 'w';
    return undo;
  };

  Chess.prototype._unmake = function (u) {
    var m = u.move, b = this.board;
    this.turn = this.turn === 'w' ? 'b' : 'w';
    var us = this.turn;
    b[m.from] = m.piece;
    b[m.to] = null;
    if (m.flags.indexOf('e') >= 0) b[us === 'w' ? m.to + 8 : m.to - 8] = m.captured;
    else if (m.captured) b[m.to] = m.captured;
    if (m.flags.indexOf('k') >= 0) { b[m.to + 1] = b[m.to - 1]; b[m.to - 1] = null; }
    if (m.flags.indexOf('q') >= 0) { b[m.to - 2] = b[m.to + 1]; b[m.to + 1] = null; }
    this.castling = u.castling; this.ep = u.ep; this.halfmove = u.halfmove; this.fullmove = u.fullmove;
  };

  /* Legal moves. opts.square limits to one square; opts.raw skips SAN (faster, used by AI). */
  Chess.prototype.moves = function (opts) {
    opts = opts || {};
    var us = this.turn, them = us === 'w' ? 'b' : 'w';
    var only = opts.square !== undefined ? (typeof opts.square === 'string' ? sqIndex(opts.square) : opts.square) : -1;
    var pseudo = this._pseudo(), legal = [];
    for (var i = 0; i < pseudo.length; i++) {
      var m = pseudo[i];
      if (only >= 0 && m.from !== only) continue;
      var u = this._make(m);
      var k = this.kingSquare(us);
      if (!this.attacked(k, them)) legal.push(m);
      this._unmake(u);
    }
    if (!opts.raw) {
      var self = this;
      legal.forEach(function (m) { self._decorate(m, legal); });
    }
    return legal;
  };

  Chess.prototype._decorate = function (m, all) {
    m.fromName = sqName(m.from); m.toName = sqName(m.to);
    m.uci = m.fromName + m.toName + (m.promotion || '');
    m.san = this._san(m, all);
    m.color = colorOf(m.piece);
  };

  Chess.prototype._san = function (m, all) {
    var s;
    if (m.flags.indexOf('k') >= 0) s = 'O-O';
    else if (m.flags.indexOf('q') >= 0) s = 'O-O-O';
    else {
      var t = typeOf(m.piece);
      if (t === 'p') {
        s = m.captured ? FILES[m.from & 7] + 'x' + sqName(m.to) : sqName(m.to);
        if (m.promotion) s += '=' + m.promotion.toUpperCase();
      } else {
        s = t.toUpperCase();
        var amb = (all || []).filter(function (o) {
          return o !== m && o.to === m.to && o.piece === m.piece && o.from !== m.from;
        });
        if (amb.length) {
          var sameFile = amb.some(function (o) { return (o.from & 7) === (m.from & 7); });
          var sameRank = amb.some(function (o) { return (o.from >> 3) === (m.from >> 3); });
          if (!sameFile) s += FILES[m.from & 7];
          else if (!sameRank) s += (8 - (m.from >> 3));
          else s += sqName(m.from);
        }
        if (m.captured) s += 'x';
        s += sqName(m.to);
      }
    }
    var u = this._make(m);
    if (this.inCheck()) s += this.moves({ raw: true }).length ? '+' : '#';
    this._unmake(u);
    return s;
  };

  /* Play a move: {from:'e2', to:'e4', promotion:'q'} or a SAN/UCI string. Returns the move or null. */
  Chess.prototype.move = function (mv) {
    var legal = this.moves(), found = null;
    if (typeof mv === 'string') {
      var clean = mv.replace(/[+#?!]/g, '');
      found = legal.find(function (m) { return m.san.replace(/[+#]/g, '') === clean || m.uci === mv; }) || null;
    } else if (mv) {
      var f = typeof mv.from === 'string' ? sqIndex(mv.from) : mv.from;
      var t = typeof mv.to === 'string' ? sqIndex(mv.to) : mv.to;
      var promo = mv.promotion ? String(mv.promotion).toLowerCase() : null;
      found = legal.find(function (m) {
        return m.from === f && m.to === t && (!m.promotion || m.promotion === (promo || 'q'));
      }) || null;
    }
    if (!found) return null;
    var u = this._make(found);
    this.history.push(u);
    var key = this.posKey();
    this.positions[key] = (this.positions[key] || 0) + 1;
    return found;
  };

  Chess.prototype.undo = function () {
    var u = this.history.pop();
    if (!u) return null;
    var key = this.posKey();
    if (this.positions[key]) this.positions[key]--;
    this._unmake(u);
    return u.move;
  };

  Chess.prototype.isCheckmate = function () { return this.inCheck() && this.moves({ raw: true }).length === 0; };
  Chess.prototype.isStalemate = function () { return !this.inCheck() && this.moves({ raw: true }).length === 0; };
  Chess.prototype.isThreefold = function () { return (this.positions[this.posKey()] || 0) >= 3; };
  Chess.prototype.isFiftyMove = function () { return this.halfmove >= 100; };

  /* Can `color` (or either side if omitted) still possibly deliver mate? */
  Chess.prototype.insufficient = function (color) {
    var pieces = { w: [], b: [] }, bishopsSq = { w: [], b: [] };
    for (var i = 0; i < 64; i++) {
      var p = this.board[i];
      if (!p || typeOf(p) === 'k') continue;
      var c = colorOf(p);
      pieces[c].push(typeOf(p));
      if (typeOf(p) === 'b') bishopsSq[c].push(((i >> 3) + (i & 7)) % 2);
    }
    function weak(c) {
      var ps = pieces[c];
      if (ps.length === 0) return true;
      if (ps.length === 1 && (ps[0] === 'n' || ps[0] === 'b')) return true;
      return false;
    }
    if (color) return weak(color);
    if (weak('w') && weak('b')) {
      // K+B vs K+B with same-coloured bishops is also a draw; covered by both weak
      return true;
    }
    // only bishops all on same colour
    var all = pieces.w.concat(pieces.b);
    if (all.every(function (t) { return t === 'b'; })) {
      var sq = bishopsSq.w.concat(bishopsSq.b);
      if (sq.every(function (x) { return x === sq[0]; })) return true;
    }
    return false;
  };

  /* Returns null if the game continues, otherwise {result:'1-0'|'0-1'|'1/2-1/2', reason} */
  Chess.prototype.outcome = function () {
    if (this.moves({ raw: true }).length === 0) {
      if (this.inCheck()) return { result: this.turn === 'w' ? '0-1' : '1-0', reason: 'checkmate' };
      return { result: '1/2-1/2', reason: 'stalemate' };
    }
    if (this.insufficient()) return { result: '1/2-1/2', reason: 'insufficient material' };
    if (this.isThreefold()) return { result: '1/2-1/2', reason: 'threefold repetition' };
    if (this.isFiftyMove()) return { result: '1/2-1/2', reason: '50-move rule' };
    return null;
  };

  Chess.prototype.sanHistory = function () {
    var undos = [];
    while (this.history.length) undos.unshift(this.undo());
    var sans = [];
    for (var i = 0; i < undos.length; i++) {
      var m = this.move({ from: undos[i].from, to: undos[i].to, promotion: undos[i].promotion });
      sans.push(m.san);
    }
    return sans;
  };

  Chess.prototype.clone = function () {
    var c = new Chess(this.fen());
    return c;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Chess;
  else root.Chess = Chess;
})(this);
