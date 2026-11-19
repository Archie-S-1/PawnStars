/* Animated website backgrounds for the themes: embers, stars, bubbles, leaves, snow, sprinkles, synth grid, rain. */
(function (root) {
  'use strict';
  var canvas, ctx, W = 0, H = 0, dpr = 1, raf = 0, effect = null, parts = [], t0 = 0, flash = 0, last = 0;
  var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, root.devicePixelRatio || 1);
    W = root.innerWidth; H = root.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (effect && EFFECTS[effect].init) parts = EFFECTS[effect].init();
  }

  function count(base) { return Math.round(base * Math.min(1.6, (W * H) / (1400 * 800))); }

  var EFFECTS = {
    embers: {
      init: function () { var a = []; for (var i = 0; i < count(90); i++) a.push(this.make(true)); return a; },
      make: function (any) { return { x: rnd(0, W), y: any ? rnd(0, H) : H + rnd(0, 40), r: rnd(0.8, 2.8), vy: rnd(0.35, 1.3), sway: rnd(0, 6.28), hue: rnd(12, 45), life: rnd(0.4, 1) }; },
      draw: function (t) {
        var g = ctx.createLinearGradient(0, H, 0, H * 0.45);
        g.addColorStop(0, 'rgba(255,90,20,0.28)'); g.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = g; ctx.fillRect(0, H * 0.45, W, H * 0.55);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y -= p.vy; p.x += Math.sin(t / 900 + p.sway) * 0.5;
          var a = Math.max(0, Math.min(1, p.y / H)) * p.life * (0.6 + 0.4 * Math.sin(t / 120 + p.sway * 7));
          if (p.y < -10) parts[i] = this.make(false);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
          ctx.fillStyle = 'hsla(' + p.hue + ',100%,60%,' + a + ')';
          ctx.shadowColor = 'hsla(' + p.hue + ',100%,55%,1)'; ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    },
    stars: {
      init: function () {
        var a = [];
        for (var i = 0; i < count(220); i++) a.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.3, 1.6), tw: rnd(0, 6.28), sp: rnd(0.5, 2), c: Math.random() < 0.15 ? '255,225,160' : Math.random() < 0.2 ? '170,200,255' : '255,255,255' });
        this.shoot = null; return a;
      },
      draw: function (t) {
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i], a = 0.35 + 0.65 * Math.abs(Math.sin(t / 1000 * p.sp + p.tw));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(' + p.c + ',' + a + ')'; ctx.fill();
        }
        if (!this.shoot && Math.random() < 0.004) this.shoot = { x: rnd(W * 0.2, W), y: rnd(0, H * 0.4), vx: -rnd(7, 11), vy: rnd(2.5, 4), life: 1 };
        var s = this.shoot;
        if (s) {
          var g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
          g.addColorStop(0, 'rgba(255,255,255,' + s.life + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); ctx.stroke();
          s.x += s.vx; s.y += s.vy; s.life -= 0.015;
          if (s.life <= 0 || s.x < -100) this.shoot = null;
        }
      }
    },
    bubbles: {
      init: function () { var a = []; for (var i = 0; i < count(55); i++) a.push(this.make(true)); return a; },
      make: function (any) { return { x: rnd(0, W), y: any ? rnd(0, H) : H + 20, r: rnd(2, 9), vy: rnd(0.3, 1.1), sway: rnd(0, 6.28) }; },
      draw: function (t) {
        for (var k = 0; k < 4; k++) {
          ctx.beginPath();
          for (var x = 0; x <= W; x += 20) {
            var y = 40 + k * 70 + Math.sin(x / 140 + t / 1600 + k) * 18 + Math.sin(x / 60 - t / 1100) * 6;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'rgba(160,240,255,' + (0.08 - k * 0.015) + ')'; ctx.lineWidth = 14 - k * 2; ctx.stroke();
        }
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y -= p.vy; p.x += Math.sin(t / 700 + p.sway) * 0.35;
          if (p.y < -20) parts[i] = this.make(false);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
          ctx.strokeStyle = 'rgba(200,250,255,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.25, 0, 6.283); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill();
        }
      }
    },
    leaves: {
      init: function () { var a = []; for (var i = 0; i < count(32); i++) a.push(this.make(true)); return a; },
      make: function (any) {
        var cols = ['#7fb24a', '#a3c45a', '#d8a13a', '#c46a2a', '#5e8f3a'];
        return { x: rnd(0, W), y: any ? rnd(0, H) : -20, s: rnd(5, 11), vy: rnd(0.4, 1), rot: rnd(0, 6.28), vr: rnd(-0.03, 0.03), sway: rnd(0, 6.28), c: cols[Math.floor(Math.random() * cols.length)] };
      },
      draw: function (t) {
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y += p.vy; p.x += Math.sin(t / 900 + p.sway) * 0.8; p.rot += p.vr;
          if (p.y > H + 20) parts[i] = this.make(false);
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.sin(t / 700 + p.sway)) * 0.6 + 0.4);
          ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.quadraticCurveTo(p.s * 0.8, 0, 0, p.s); ctx.quadraticCurveTo(-p.s * 0.8, 0, 0, -p.s);
          ctx.fillStyle = p.c; ctx.globalAlpha = 0.75; ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.lineTo(0, p.s); ctx.stroke();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    },
    snow: {
      init: function () { var a = []; for (var i = 0; i < count(140); i++) a.push(this.make(true)); return a; },
      make: function (any) { return { x: rnd(0, W), y: any ? rnd(0, H) : -10, r: rnd(1, 3.6), vy: rnd(0.3, 1.2), sway: rnd(0, 6.28) }; },
      draw: function (t) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y += p.vy; p.x += Math.sin(t / 1300 + p.sway) * 0.5;
          if (p.y > H + 10) parts[i] = this.make(false);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
          ctx.shadowColor = 'rgba(120,170,220,0.8)'; ctx.shadowBlur = 3; ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    },
    sprinkles: {
      init: function () { var a = []; for (var i = 0; i < count(70); i++) a.push(this.make(true)); return a; },
      make: function (any) {
        var cols = ['#ff5fa2', '#ffd23f', '#5ad1ff', '#7cf29c', '#b78cff', '#ff8a5c'];
        return { x: rnd(0, W), y: any ? rnd(0, H) : -10, l: rnd(6, 12), vy: rnd(0.5, 1.4), rot: rnd(0, 6.28), vr: rnd(-0.05, 0.05), c: cols[Math.floor(Math.random() * cols.length)] };
      },
      draw: function () {
        ctx.lineCap = 'round'; ctx.lineWidth = 3.5;
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y += p.vy; p.rot += p.vr;
          if (p.y > H + 15) parts[i] = this.make(false);
          var dx = Math.cos(p.rot) * p.l / 2, dy = Math.sin(p.rot) * p.l / 2;
          ctx.strokeStyle = p.c; ctx.globalAlpha = 0.8;
          ctx.beginPath(); ctx.moveTo(p.x - dx, p.y - dy); ctx.lineTo(p.x + dx, p.y + dy); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    },
    synth: {
      init: function () { return []; },
      draw: function (t) {
        var hz = H * 0.62;
        var sun = ctx.createLinearGradient(0, hz - 230, 0, hz);
        sun.addColorStop(0, '#ffd34d'); sun.addColorStop(1, '#ff2fa8');
        ctx.save(); ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.arc(W / 2, hz, 190, Math.PI, 0); ctx.fillStyle = sun; ctx.fill();
        ctx.fillStyle = '#12002b';
        for (var b = 0; b < 6; b++) ctx.fillRect(W / 2 - 200, hz - 18 - b * 26, 400, 3 + b * 1.4);
        ctx.restore();
        var g = ctx.createLinearGradient(0, hz, 0, H);
        g.addColorStop(0, 'rgba(255,62,207,0.9)'); g.addColorStop(1, 'rgba(77,243,255,0.5)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.3; ctx.globalAlpha = 0.55;
        var off = (t / 30) % 40;
        for (var i = 0; i < 20; i++) {
          var z = i * 40 + off, y = hz + (z * z) / 2600;
          if (y > H) break;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        for (var x = -20; x <= 20; x++) {
          ctx.beginPath(); ctx.moveTo(W / 2 + x * 30, hz); ctx.lineTo(W / 2 + x * 260, H); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    },
    rain: {
      init: function () { var a = []; for (var i = 0; i < count(180); i++) a.push(this.make(true)); return a; },
      make: function (any) { return { x: rnd(-100, W), y: any ? rnd(0, H) : rnd(-60, -10), l: rnd(10, 22), v: rnd(9, 15) }; },
      draw: function () {
        if (flash > 0) { ctx.fillStyle = 'rgba(220,235,255,' + flash * 0.35 + ')'; ctx.fillRect(0, 0, W, H); flash -= 0.04; }
        else if (Math.random() < 0.0025) flash = 1;
        ctx.strokeStyle = 'rgba(170,200,230,0.35)'; ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y += p.v; p.x += p.v * 0.18;
          if (p.y > H + 20) parts[i] = this.make(false);
          ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.l * 0.18, p.y - p.l);
        }
        ctx.stroke();
      }
    }
  };

  function frame(t) {
    raf = 0;
    if (!effect || document.hidden) return;
    if (t - last < 30) { raf = requestAnimationFrame(frame); return; } // ~30fps is plenty and saves battery
    last = t;
    ctx.clearRect(0, 0, W, H);
    EFFECTS[effect].draw(t - t0);
    if (!reduced) raf = requestAnimationFrame(frame);
  }

  function set(name) {
    if (!canvas) {
      canvas = document.getElementById('bgfx');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      root.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', function () { if (!document.hidden && effect && !raf) raf = requestAnimationFrame(frame); });
    }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    effect = EFFECTS[name] ? name : null;
    canvas.hidden = !effect;
    resize();
    ctx.clearRect(0, 0, W, H);
    if (effect) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
  }

  root.Effects = { set: set, names: Object.keys(EFFECTS) };
})(this);
