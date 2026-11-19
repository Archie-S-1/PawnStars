/* Runs the computer opponent off the main thread so the page never freezes. */
importScripts('chess-engine.js', 'ai.js');
self.onmessage = function (e) {
  var mv = self.ChessAI.bestMove(e.data.fen, e.data.level);
  self.postMessage({ id: e.data.id, move: mv });
};
