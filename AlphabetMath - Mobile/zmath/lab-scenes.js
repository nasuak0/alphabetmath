/* Lab spotlight — ghost/cover line-art generator. Copied from
   explore/lab-scenes.js (the Design Lab study) and converted to an ES module;
   the drawing code is UNCHANGED. Same geometry as coverart.jsx, emitted as
   an SVG string: line art in one color over the tile white, or over paper
   (topic ink) for the ghost backdrop.
   API: LabScenes.svg(scene, 'r,g,b', casing) -> '<svg …>…</svg>'
   casing=true draws the white under-strokes (knot weave, walk casings);
   ghost mode passes false so nothing white sits on the paper. */
  var TAU = Math.PI * 2;
  function pol(cx, cy, r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function pts(arr) { return arr.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }

  function build(scene, C, casing) {
    var S = [];
    var CAP = ' stroke-linecap="round" stroke-linejoin="round"';
    function W(o) { return 'rgba(' + C + ',' + Math.min(1, o * 1.32).toFixed(3) + ')'; }
    function F(o) { return 'rgba(' + C + ',' + Math.min(1, o * 1.55).toFixed(3) + ')'; }
    function path(d, stroke, sw, fill) {
      S.push('<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') + '" stroke-width="' + (sw || 0) + '"' + CAP + '/>');
    }
    function circ(c, r, fill, stroke, sw) {
      S.push('<circle cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="' + r + '" fill="' + (fill || 'none') + '"' +
        (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 2) + '"' : '') + '/>');
    }

    if (scene === 'curves') {
      var mk = function (amp, ph, yb) {
        var d = 'M-5 ' + yb;
        for (var x = -5; x <= 205; x += 5) d += ' L' + x + ' ' + (yb + amp * Math.sin((x / 200) * TAU * 1.5 + ph)).toFixed(1);
        return d;
      };
      path(mk(34, 0, 120) + ' L205 200 L-5 200 Z', null, 0, F(0.14));
      path(mk(34, 0, 120), W(0.62), 2.4);
      path(mk(22, 1.6, 70), W(0.4), 2);
      path(mk(16, 3.0, 158), W(0.32), 2);

    } else if (scene === 'vectors') {
      path('M-5 134 Q55 98 110 120 T205 100 L205 205 L-5 205 Z', null, 0, F(0.13));
      for (var gx = 0; gx < 5; gx++) for (var gy = 0; gy < 5; gy++) {
        var x = 24 + gx * 38, y = 24 + gy * 38;
        var a = Math.atan2(y - 100, x - 100) + 1.4;
        circ([x, y], 2.6, F(0.34));
        var e = pol(x, y, 15, a);
        path('M' + x + ' ' + y + ' L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1), W(0.5), 1.9);
        var h1 = pol(e[0], e[1], 5, a + 2.5), h2 = pol(e[0], e[1], 5, a - 2.5);
        path('M' + h1[0].toFixed(1) + ' ' + h1[1].toFixed(1) + ' L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) +
          ' L' + h2[0].toFixed(1) + ' ' + h2[1].toFixed(1), W(0.5), 1.9);
      }

    } else if (scene === 'contour') {
      var cx = 100, cy = 102;
      var blob = function (r, w, ph, k) {
        var d = '';
        for (var i = 0; i <= 64; i++) {
          var ang = (i / 64) * TAU, rr = r + w * Math.sin(k * ang + ph), p = pol(cx, cy, rr, ang);
          d += (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
        }
        return d + ' Z';
      };
      [[84, 13], [65, 11], [47, 9.5], [31, 8]].forEach(function (rw, i) {
        path(blob(rw[0], rw[1], 0.5, 3), W(0.28 + i * 0.10), 2.2);
      });
      path(blob(18, 5, 0.5, 3), null, 0, F(0.16));
      path(blob(18, 5, 0.5, 3), W(0.62), 2.2);
      circ([cx, cy], 4, F(0.6));

    } else if (scene === 'tiling') {
      var rh = function (rcx, rcy, s, rot, o) {
        var a = rot, b = rot + 1.15;
        var p = [pol(rcx, rcy, s, a), pol(rcx, rcy, s * 1.7, a + b / 2), pol(rcx, rcy, s, a + b), pol(rcx, rcy, s * 0.55, a + b / 2 + Math.PI)];
        /* ghost (casing=false): white shards, line-art only — no orange tint */
        S.push('<polygon points="' + pts(p) + '" fill="' + (casing ? F(o) : '#ffffff') + '" stroke="' + W(0.5) + '" stroke-width="1.8"' + CAP + '/>');
      };
      var grid = [[40, 55, 0.12], [95, 42, 0.05], [150, 60, 0.14], [55, 118, 0.06], [112, 108, 0.13], [165, 128, 0.05], [40, 170, 0.12], [100, 172, 0.06], [158, 185, 0.12]];
      grid.forEach(function (g, i) { rh(g[0], g[1], 26, (i * 1.1) % TAU, g[2]); });

    } else if (scene === 'knot') {
      var xs = -12, xe = 212, yMid = 100, amp = 30, k = (TAU * 2.5) / 224, dx = 6;
      var yOf = function (x, i) { return yMid + amp * Math.sin(k * (x - xs) + i * (TAU / 3)); };
      var zOf = function (x, i) { return Math.cos(k * (x - xs) + i * (TAU / 3)); };
      var ft = '';
      for (var fx = xs; fx <= xe; fx += 4) {
        var mY = -1e9;
        for (var i3 = 0; i3 < 3; i3++) { var yv = yOf(fx, i3); if (yv > mY) mY = yv; }
        ft += (fx === xs ? 'M' : 'L') + fx + ' ' + mY.toFixed(1);
      }
      path(ft + ' L' + xe + ' 214 L' + xs + ' 214 Z', null, 0, F(0.15));
      if (casing) for (var st2 = 0; st2 < 3; st2++) {
        var pth = '';
        for (var cx2 = xs; cx2 <= xe; cx2 += 4) pth += (cx2 === xs ? 'M' : 'L') + cx2.toFixed(1) + ' ' + yOf(cx2, st2).toFixed(1);
        path(pth, '#ffffff', 9);
      }
      var segs = [];
      for (var sx = xs; sx < xe; sx += dx) for (var si = 0; si < 3; si++) {
        segs.push({ d: 'M' + sx.toFixed(1) + ' ' + yOf(sx, si).toFixed(1) + ' L' + (sx + dx).toFixed(1) + ' ' + yOf(sx + dx, si).toFixed(1), z: zOf(sx + dx / 2, si) });
      }
      segs.sort(function (a, b) { return a.z - b.z; });
      segs.forEach(function (sg) {
        if (casing) path(sg.d, '#ffffff', 7);
        path(sg.d, W(0.62), 3.8);
      });

    } else if (scene === 'lattice') {
      var g = 21, ox = 110.5, oy = 79;
      var gsx = ox - Math.ceil((ox - 6) / g) * g;
      for (var v = gsx; v <= 194.1; v += g) if (v >= 6) path('M' + v.toFixed(1) + ' 6 L' + v.toFixed(1) + ' 194', W(0.09), 1);
      var gsy = oy - Math.ceil((oy - 6) / g) * g;
      for (var v2 = gsy; v2 <= 194.1; v2 += g) if (v2 >= 6) path('M6 ' + v2.toFixed(1) + ' L194 ' + v2.toFixed(1), W(0.09), 1);
      var WALKS = [
        { pts: [[0, 0], [0, -2], [2, -2], [2, -3]] },
        { pts: [[0, 0], [-1, 0], [-1, 1], [-4, 1]], soft: true },
        { pts: [[0, 0], [2, 0], [2, 4], [3, 4]] },
        { pts: [[0, 0], [0, -2], [-2, -2], [-2, 0]] },
        { pts: [[0, 0], [0, 2], [1, 2], [1, 4]] },
        { pts: [[0, 0], [1, 0], [1, 1], [3, 1]] },
        { pts: [[0, 0], [-1, 0], [-1, 2], [-3, 2]] },
        { pts: [[0, 0], [-1, 0], [-1, -1], [-3, -1]], soft: true },
        { pts: [[0, 0], [0, 1], [-1, 1]], ghost: true }
      ].map(function (w) {
        return { soft: w.soft, ghost: w.ghost, pts: w.pts.map(function (p) { return [ox + p[0] * g, oy + p[1] * g]; }) };
      });
      var wpath = function (ps) { return 'M' + ps.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'); };
      if (casing) WALKS.forEach(function (w) { path(wpath(w.pts), '#ffffff', 11); });
      WALKS.forEach(function (w) { path(wpath(w.pts), W(w.ghost ? 0.32 : w.soft ? 0.44 : 0.62), 6.5); });
      WALKS.forEach(function (w) {
        var e2 = w.pts[w.pts.length - 1];
        if (casing) circ(e2, 7.5, '#ffffff');
        circ(e2, 5.5, F(w.ghost ? 0.25 : 0.5));
      });
      if (casing) circ([ox, oy], 9.5, '#ffffff');
      circ([ox, oy], 7, F(0.85));
    }
    return S.join('');
  }

export const LabScenes = {
  svg: function (scene, rgb, casing) {
    return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      build(scene, rgb, casing) + '</svg>';
  }
};
