/* Zmath CoverArt — generative abstract "math scenes" drawn in white line/΄fill
   over each topic's vivid gradient. Pure SVG, deterministic.
   Renders to fill its parent (position:absolute inset:0). */
import React from "react";

const TAU = Math.PI * 2;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
const pts = (arr) => arr.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

function scenePaths(scene, rgb) {
  const C = rgb || '255,255,255';
  const S = []; // each: {t:'path'|'poly'|'circle'|'line', ...}
  const W = (o) => ({ stroke: 'rgba(' + C + ',' + Math.min(1, (o ?? 0.5) * 1.32) + ')' });
  const F = (o) => ({ fill: 'rgba(' + C + ',' + Math.min(1, (o ?? 0.16) * 1.55) + ')' });

  if (scene === 'symmetry') {            // rotational orbit of petals
    const n = 8, cx = 100, cy = 100;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const [x1, y1] = pol(cx, cy, 20, a);
      const [x2, y2] = pol(cx, cy, 78, a);
      const [cxp, cyp] = pol(cx, cy, 52, a + 0.5);
      S.push({ d: `M${x1} ${y1} Q${cxp} ${cyp} ${x2} ${y2}`, ...W(0.55), sw: 2 });
      S.push({ c: pol(cx, cy, 78, a), r: 4.5, ...F(0.5) });
    }
    S.push({ c: [cx, cy], r: 13, ...W(0.6), sw: 2.4, nofill: 1 });
    S.push({ c: [cx, cy], r: 5, ...F(0.6) });
  } else if (scene === 'tiling') {       // aperiodic rhombi
    const rh = (cx, cy, s, rot, o) => {
      const a = rot, b = rot + 1.15;
      const p = [pol(cx, cy, s, a), pol(cx, cy, s * 1.7, a + b/2), pol(cx, cy, s, a + b), pol(cx, cy, s*0.55, a + b/2 + Math.PI)];
      S.push({ poly: pts(p), ...W(0.5), sw: 1.8, fill: 'rgba(255,255,255,' + o + ')' });
    };
    const grid = [[40,55,0.12],[95,42,0.05],[150,60,0.14],[55,118,0.06],[112,108,0.13],[165,128,0.05],[40,170,0.12],[100,172,0.06],[158,185,0.12]];
    grid.forEach((g,i) => rh(g[0], g[1], 26, (i*1.1)%TAU, g[2]));
  } else if (scene === 'curves') {       // flowing sine curves + area fill
    const mk = (amp, ph, yb) => {
      let d = `M-5 ${yb}`;
      for (let x = -5; x <= 205; x += 5) d += ` L${x} ${(yb + amp*Math.sin((x/200)*TAU*1.5 + ph)).toFixed(1)}`;
      return d;
    };
    S.push({ d: mk(34, 0, 120) + ' L205 200 L-5 200 Z', ...F(0.14), nostroke: 1 });
    S.push({ d: mk(34, 0, 120), ...W(0.62), sw: 2.4 });
    S.push({ d: mk(22, 1.6, 70), ...W(0.4), sw: 2 });
    S.push({ d: mk(16, 3.0, 158), ...W(0.32), sw: 2 });
  } else if (scene === 'vectors') {      // sheared vector field over a soft flow band
    S.push({ d: 'M-5 134 Q55 98 110 120 T205 100 L205 205 L-5 205 Z', ...F(0.13), nostroke: 1 });
    for (let gx = 0; gx < 5; gx++) for (let gy = 0; gy < 5; gy++) {
      const x = 24 + gx * 38, y = 24 + gy * 38;
      const a = Math.atan2(y - 100, x - 100) + 1.4;
      S.push({ c: [x, y], r: 2.6, ...F(0.34) });
      const [ex, ey] = pol(x, y, 15, a);
      S.push({ d: `M${x} ${y} L${ex.toFixed(1)} ${ey.toFixed(1)}`, ...W(0.5), sw: 1.9 });
      const [hx, hy] = pol(ex, ey, 5, a + 2.5), [hx2, hy2] = pol(ex, ey, 5, a - 2.5);
      S.push({ d: `M${hx.toFixed(1)} ${hy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${hx2.toFixed(1)} ${hy2.toFixed(1)}`, ...W(0.5), sw: 1.9 });
    }
  } else if (scene === 'contour') {      // abstract nested field contours + soft core (number theory)
    const cx = 100, cy = 102;
    const blob = (r, w, ph, k) => {
      let d = '';
      for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU; const rr = r + w * Math.sin(k * a + ph); const [x, y] = pol(cx, cy, rr, a); d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1); }
      return d + ' Z';
    };
    [[84, 13], [65, 11], [47, 9.5], [31, 8]].forEach(([r, w], i) => S.push({ d: blob(r, w, 0.5, 3), ...W(0.28 + i * 0.10), sw: 2.2, nofill: 1 }));
    S.push({ d: blob(18, 5, 0.5, 3), ...F(0.16), nostroke: 1 });
    S.push({ d: blob(18, 5, 0.5, 3), ...W(0.62), sw: 2.2, nofill: 1 });
    S.push({ c: [cx, cy], r: 4, ...F(0.6) });
  } else if (scene === 'weave') {         // branching tree — counting paths/permutations (combinatorics)
    const levels = 4, top = 30, dy = 44, cx = 100;
    const fill = [];
    // soft filled fan behind the tree
    S.push({ d: `M${cx} ${top} L${cx + 78} ${top + dy*(levels-1) + 6} L${cx - 78} ${top + dy*(levels-1) + 6} Z`, ...F(0.11), nostroke: 1 });
    const draw = (x, y, halfSpan, depth) => {
      const node = { x, y, r: depth === 0 ? 6 : 5 };
      fill.push(node);
      if (depth >= levels - 1) return;
      const cy2 = y + dy;
      [-1, 1].forEach((s) => {
        const cx2 = x + s * halfSpan;
        S.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y + dy*0.6).toFixed(1)} ${cx2.toFixed(1)} ${cy2.toFixed(1)}`, ...W(0.4 + (levels - depth) * 0.05), sw: 2 });
        draw(cx2, cy2, halfSpan * 0.52, depth + 1);
      });
    };
    draw(cx, top, 42, 0);
    fill.forEach((nd, i) => S.push({ c: [nd.x, nd.y], r: nd.r, ...W(0.62), sw: 2, ...F(i === 0 ? 0.5 : 0.32) }));
  } else if (scene === 'lattice') {      // Manhattan walks from a common origin (probability) — shades of purple
    const g = 21;
    const ox = 110.5, oy = 79;
    // faint graph-paper grid, aligned to the origin so corners sit on intersections
    const gsx = ox - Math.ceil((ox - 6) / g) * g;
    for (let v = gsx; v <= 194.1; v += g) { if (v >= 6) S.push({ d: `M${v.toFixed(1)} 6 L${v.toFixed(1)} 194`, ...W(0.09), sw: 1 }); }
    const gsy = oy - Math.ceil((oy - 6) / g) * g;
    for (let v = gsy; v <= 194.1; v += g) { if (v >= 6) S.push({ d: `M6 ${v.toFixed(1)} L194 ${v.toFixed(1)}`, ...W(0.09), sw: 1 }); }
    const CASE = '#ffffff';   // white casing → walks rest on top of the surface
    // curated composition — a tidy, centred walk that mirrors the reference "goal" sketch
    const WALKS = [
      { col: '#9a5cee', pts: [[0, 0], [0, -2], [2, -2], [2, -3]] },        // up then right, then up to the top dot
      { col: '#c9a4f2', pts: [[0, 0], [-1, 0], [-1, 1], [-4, 1]] },        // left run to the light dot
      { col: '#7c45d0', pts: [[0, 0], [2, 0], [2, 4], [3, 4]] },           // staircase down to the lower-right dot
      { col: '#a070ee', pts: [[0, 0], [0, -2], [-2, -2], [-2, 0]] },       // up, left, then down — dot drops per the arrow
      { col: '#8e54e0', pts: [[0, 0], [0, 2], [1, 2], [1, 4]] },           // limb down to the bottom-centre dot
      { col: '#9560e8', pts: [[0, 0], [1, 0], [1, 1], [3, 1]] },           // limb right to the mid-right dot
      { col: '#7e48d2', pts: [[0, 0], [-1, 0], [-1, 2], [-3, 2]] },        // limb into the lower-left
      { col: '#a877ea', pts: [[0, 0], [-1, 0], [-1, -1], [-3, -1]] },      // limb into the upper/mid-left
      { col: '#b89ae8', pts: [[0, 0], [0, 1], [-1, 1]], ghost: true },     // short limb to the central ghost dot
    ].map((w) => ({ col: w.col, ghost: w.ghost, pts: w.pts.map((p) => [ox + p[0] * g, oy + p[1] * g]) }));
    const path = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    WALKS.forEach((w) => S.push({ d: path(w.pts), stroke: CASE, sw: 11, nofill: 1 }));                 // white casing under everything
    WALKS.forEach((w) => S.push({ d: path(w.pts), stroke: w.col, sw: 6.5, nofill: 1, opacity: w.ghost ? 0.5 : 1 }));   // purple walk traces
    WALKS.forEach((w) => { const e = w.pts[w.pts.length - 1]; S.push({ c: e, r: 7.5, fill: CASE }); S.push({ c: e, r: 5.5, fill: w.col, opacity: w.ghost ? 0.45 : 1 }); });  // endpoints (ghost = translucent)
    S.push({ c: [ox, oy], r: 9.5, fill: CASE }); S.push({ c: [ox, oy], r: 7, fill: '#2a1640' });       // dark central origin
  } else if (scene === 'knot') {         // 3-strand braid (braid group) — depth-sorted weave, filled (topology)
    const xs = -12, xe = 212, yMid = 100, amp = 30, k = (TAU * 2.5) / 224, dx = 2.5;
    const yOf = (x, i) => yMid + amp * Math.sin(k * (x - xs) + i * (TAU / 3));
    const zOf = (x, i) => Math.cos(k * (x - xs) + i * (TAU / 3));
    // soft area fill under the lowest strand (calculus-kin)
    let ft = '';
    for (let x = xs; x <= xe; x += 4) { let mY = -1e9; for (let i = 0; i < 3; i++) { const y = yOf(x, i); if (y > mY) mY = y; } ft += (x === xs ? 'M' : 'L') + x + ' ' + mY.toFixed(1); }
    S.push({ d: ft + ` L${xe} 214 L${xs} 214 Z`, ...F(0.15), nostroke: 1 });
    // continuous white casings (one per strand) so strands stand out, no seams
    for (let i = 0; i < 3; i++) {
      let p = ''; for (let x = xs; x <= xe; x += 3) p += (x === xs ? 'M' : 'L') + x.toFixed(1) + ' ' + yOf(x, i).toFixed(1);
      S.push({ d: p, stroke: '#ffffff', sw: 9, nofill: 1 });
    }
    // colored strand segments, painted back-to-front by depth → correct over/under everywhere
    const segs = [];
    for (let x = xs; x < xe; x += dx) for (let i = 0; i < 3; i++) {
      segs.push({ d: `M${x.toFixed(1)} ${yOf(x, i).toFixed(1)} L${(x + dx).toFixed(1)} ${yOf(x + dx, i).toFixed(1)}`, z: zOf(x + dx / 2, i) });
    }
    segs.sort((a, b) => a.z - b.z);
    segs.forEach((s) => {
      S.push({ d: s.d, stroke: '#ffffff', sw: 7, nofill: 1 });   // groove: under strand cleared where over passes
      S.push({ d: s.d, ...W(0.62), sw: 3.8, nofill: 1 });
    });
  } else if (scene === 'epsilon') {      // nested shrinking intervals
    for (let i=0;i<6;i++){ const inset=18+i*15; S.push({ rect:[inset, inset, 200-inset*2, 200-inset*2], rx:6, ...W(0.3+i*0.06), sw: 1.8, nofill:1 }); }
    S.push({ d:'M100 18 L100 182', ...W(0.5), sw: 1.6 });
    S.push({ c:[100,100], r: 5, ...F(0.7) });
  } else if (scene === 'truth') {        // boolean lattice diamond
    const N=[[100,30],[55,75],[145,75],[100,75],[55,125],[145,125],[100,125],[100,170]];
    const E=[[0,1],[0,2],[0,3],[1,4],[2,5],[3,6],[4,7],[5,7],[6,7]];
    E.forEach(([a,b])=>S.push({ d:`M${N[a][0]} ${N[a][1]} L${N[b][0]} ${N[b][1]}`, ...W(0.4), sw:1.7 }));
    N.forEach((p,i)=>S.push({ c:p, r: 7, ...W(0.6), sw:2, fill:'rgba(255,255,255,'+((i===0||i===7)?0.55:0.2)+')' }));
  } else if (scene === 'gates') {        // boolean truth-table grid (filled = true, hollow = false)
    const cols = [50, 90, 130, 170], rows = [54, 90, 126, 162];
    // header underline + column divider
    S.push({ d:'M30 36 L186 36', ...W(0.5), sw: 2 });
    S.push({ d:'M110 24 L110 178', ...W(0.34), sw: 1.6 });
    // truth pattern (a little AND/XOR-ish mix) per cell
    const truth = [
      [1,0,0,1],
      [0,1,1,0],
      [1,1,0,0],
      [0,0,1,1],
    ];
    rows.forEach((y, r) => cols.forEach((x, c) => {
      if (truth[r][c]) { S.push({ c:[x,y], r: 9, ...W(0.7), sw: 2.3, fill:'rgba('+C+',0.5)' }); }
      else { S.push({ c:[x,y], r: 9, ...W(0.45), sw: 2, nofill: 1 }); }
    }));
  }
  return S;
}

export function CoverArt({ topic, color, className, style }) {
  const rgb = React.useMemo(() => {
    if (!color) return '255,255,255';
    const n = parseInt(color.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }, [color]);
  const S = React.useMemo(() => scenePaths(topic.scene, rgb), [topic.scene, rgb]);
  return (
    <svg className={className} style={style} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true" width="100%" height="100%">
      {S.map((e, i) => {
        const common = { strokeLinecap: 'round', strokeLinejoin: 'round' };
        const sk = e.nofill || e.nostroke === undefined ? (e.stroke || 'none') : (e.stroke || 'none');
        if (e.d) return <path key={i} d={e.d} fill={e.nostroke ? (e.fill||'none') : (e.fill||'none')} stroke={e.nostroke ? 'none' : e.stroke} strokeWidth={e.sw||2} opacity={e.opacity} {...common} />;
        if (e.poly) return <polygon key={i} points={e.poly} fill={e.fill||'none'} stroke={e.stroke} strokeWidth={e.sw||2} {...common} />;
        if (e.c) return <circle key={i} cx={e.c[0]} cy={e.c[1]} r={e.r} fill={e.nofill ? 'none' : (e.fill||'none')} stroke={e.nofill ? e.stroke : (e.stroke||'none')} strokeWidth={e.sw||0} opacity={e.opacity} {...common} />;
        if (e.rect) return <rect key={i} x={e.rect[0]} y={e.rect[1]} width={e.rect[2]} height={e.rect[3]} rx={e.rx||0} fill={e.nofill ? 'none' : (e.fill||'none')} stroke={e.nofill ? e.stroke : (e.stroke||'none')} strokeWidth={e.sw||0} {...common} />;
        return null;
      })}
    </svg>
  );
}
