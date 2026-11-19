/* Simple computer opponent: alpha-beta search with piece-square tables. */
(function (root) {
  'use strict';
  var Chess = root.Chess || (typeof require !== 'undefined' ? require('./chess-engine.js') : null);

  var VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  // Tables from white's point of view, index 0 = a8
  var PST = {
    p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
        0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
        -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
        -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
        -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
        0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
  };

  function evaluate(g) {
    var s = 0, b = g.board;
    for (var i = 0; i < 64; i++) {
      var p = b[i];
      if (!p) continue;
      var t = p.toLowerCase();
      if (p === t) s -= VAL[t] + PST[t][(7 - (i >> 3)) * 8 + (i & 7)];
      else s += VAL[t] + PST[t][i];
    }
    return g.turn === 'w' ? s : -s;
  }

  function order(moves) {
    return moves.sort(function (a, b) {
      var sa = (a.captured ? 10 * VAL[a.captured.toLowerCase()] - VAL[a.piece.toLowerCase()] / 10 : 0) + (a.promotion ? 800 : 0);
      var sb = (b.captured ? 10 * VAL[b.captured.toLowerCase()] - VAL[b.piece.toLowerCase()] / 10 : 0) + (b.promotion ? 800 : 0);
      return sb - sa;
    });
  }

  var nodes = 0, deadline = 0;

  function quiesce(g, alpha, beta, depth) {
    nodes++;
    var stand = evaluate(g);
    if (stand >= beta) return beta;
    if (alpha < stand) alpha = stand;
    if (depth <= 0) return alpha;
    var moves = order(g.moves({ raw: true }).filter(function (m) { return m.captured || m.promotion; }));
    for (var i = 0; i < moves.length; i++) {
      var u = g._make(moves[i]);
      var score = -quiesce(g, -beta, -alpha, depth - 1);
      g._unmake(u);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function search(g, depth, alpha, beta, ply, useQ) {
    nodes++;
    var moves = g.moves({ raw: true });
    if (!moves.length) return g.inCheck() ? -100000 + ply : 0;
    if (depth === 0) return useQ ? quiesce(g, alpha, beta, 4) : evaluate(g);
    order(moves);
    for (var i = 0; i < moves.length; i++) {
      var u = g._make(moves[i]);
      var score = -search(g, depth - 1, -beta, -alpha, ply + 1, useQ);
      g._unmake(u);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
      if (Date.now() > deadline) break;
    }
    return alpha;
  }

  /* level: 1 (easy) .. 4 (hard). Returns {from,to,promotion} */
  function bestMove(fen, level) {
    var g = new Chess(fen);
    var moves = order(g.moves({ raw: true }));
    if (!moves.length) return null;
    level = level || 2;
    var depth = { 1: 1, 2: 2, 3: 3, 4: 4 }[level] || 2;
    var useQ = level >= 2;
    var noise = { 1: 120, 2: 30, 3: 8, 4: 0 }[level] || 0;
    deadline = Date.now() + (level >= 4 ? 4000 : 2500);
    nodes = 0;
    var best = null, bestScore = -Infinity;
    for (var i = 0; i < moves.length; i++) {
      var u = g._make(moves[i]);
      var score = -search(g, depth - 1, -Infinity, Infinity, 1, useQ) + (noise ? Math.random() * noise : 0);
      g._unmake(u);
      if (score > bestScore) { bestScore = score; best = moves[i]; }
      if (Date.now() > deadline && best) break;
    }
    return { from: best.from, to: best.to, promotion: best.promotion };
  }

  var AI = { bestMove: bestMove, evaluate: evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = AI;
  else root.ChessAI = AI;
})(this);
