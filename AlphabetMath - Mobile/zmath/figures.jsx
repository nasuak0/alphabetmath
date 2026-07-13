/* Zmath note figures — generative SVG diagrams for the "Square Roots, Geometric
   Areas & the Pythagorean Theorem" note. Faithful to the source lecture-note
   look: navy line work, pale-blue square interiors, pink corner offcuts.
   Each is registered into the shared ZFIGURES registry so NoteBlock can
   render { fig:'name' }. */
import React from "react";
import { ZFIGURES } from "./figures-registry.js";

const NAVY = '#26345f', BLUE = '#3a5694', RED = '#bf3535', GRID = '#c3cde2';
  const BLUEFILL = 'rgba(74,110,190,0.16)';
  const PINKFILL = 'rgba(226,138,166,0.20)';
  const REDFILL  = 'rgba(191,53,53,0.10)';
  const GREENFILL = 'rgba(82,170,132,0.22)';
  const pts = (...a) => a.map(p => p.join(',')).join(' ');

  // ---- Figure 1: perfect squares 1,4,9,16 drawn upright on the grid ----
  function PerfectSquares() {
    const u = 15, base = 128, els = [];
    let x = 16;
    [[1, 1], [4, 2], [9, 3], [16, 4]].forEach(([n, k]) => {
      const side = k * u, top = base - side, gl = [];
      for (let i = 1; i < k; i++) {
        gl.push(<line key={'v' + i} x1={x + i * u} y1={top} x2={x + i * u} y2={base} stroke={GRID} strokeWidth="1" strokeDasharray="3 3" />);
        gl.push(<line key={'h' + i} x1={x} y1={top + i * u} x2={x + side} y2={top + i * u} stroke={GRID} strokeWidth="1" strokeDasharray="3 3" />);
      }
      els.push(
        <g key={n}>
          <rect x={x} y={top} width={side} height={side} fill={BLUEFILL} stroke={NAVY} strokeWidth="1.5" />
          {gl}
          <text x={x + side / 2} y={top - 7} className="fg-lab" textAnchor="middle">&#8730;{n} = {k}</text>
          <text x={x + side / 2} y={base - side / 2 + 5} className="fg-num" textAnchor="middle">{n}</text>
        </g>
      );
      x += side + 24;
    });
    return <svg className="fig-svg wide" viewBox="0 0 268 150" role="img" aria-label="Perfect squares 1, 4, 9, 16 drawn upright on a grid">{els}</svg>;
  }

  // ---- Figure 2: tilted squares n = 2,5,8,13 with pink corner offcuts ----
  function TiltedSquares() {
    const u = 13, base = 130, els = [];
    let x = 14;
    [[2, 1, 1], [5, 1, 2], [8, 2, 2], [13, 2, 3]].forEach(([n, p, q]) => {
      const L = (p + q) * u, ox = x, oy = base - L;
      const A = [ox + p * u, oy], B = [ox + L, oy + p * u], C = [ox + q * u, oy + L], D = [ox, oy + q * u];
      els.push(
        <g key={n}>
          <rect x={ox} y={oy} width={L} height={L} fill={PINKFILL} stroke="none" />
          <polygon points={pts(A, B, C, D)} fill={BLUEFILL} stroke={BLUE} strokeWidth="1.6" strokeLinejoin="round" />
          <text x={ox + L / 2} y={oy + L / 2 + 5} className="fg-num" textAnchor="middle">{n}</text>
          <text x={ox + L / 2} y={base + 17} className="fg-cap-in" textAnchor="middle">n={n}, ({p},{q})</text>
        </g>
      );
      x += L + 24;
    });
    return <svg className="fig-svg wide" viewBox="0 0 286 160" role="img" aria-label="Four tilted lattice squares of area 2, 5, 8 and 13">{els}</svg>;
  }

  // ---- Figure 3: perpendicular vectors spanning a rectangle of area 26 ----
  function CrossVectors() {
    const O = [298, 300], u = 27;
    const a = [O[0] + 2 * u, O[1] - 3 * u];          // a = (2,3)  red
    const b = [O[0] - 6 * u, O[1] - 4 * u];          // b = (-6,4) navy
    const ab = [b[0] + 2 * u, b[1] - 3 * u];         // O + a + b
    // grid (solid, aligned to the origin)
    const grid = [], xMin = 120, xMax = 392, yMin = 96, yMax = 322;
    for (let k = -8; k <= 4; k++) { const gx = O[0] + k * u; if (gx >= xMin && gx <= xMax) grid.push(<line key={'v' + k} x1={gx} y1={yMin} x2={gx} y2={yMax} stroke={GRID} strokeWidth="1" />); }
    for (let k = -1; k <= 8; k++) { const gy = O[1] - k * u; if (gy >= yMin && gy <= yMax) grid.push(<line key={'h' + k} x1={xMin} y1={gy} x2={xMax} y2={gy} stroke={GRID} strokeWidth="1" />); }
    // right-angle tick at O: unit dirs along a and b (screen coords, y down)
    const ad = [0.5547, -0.8321], bd = [-0.8321, -0.5547], t = 16;
    const p1 = [O[0] + t * ad[0], O[1] + t * ad[1]];
    const p2 = [O[0] + t * bd[0], O[1] + t * bd[1]];
    const cn = [O[0] + t * (ad[0] + bd[0]), O[1] + t * (ad[1] + bd[1])];
    return (
      <svg className="fig-svg wide" viewBox="0 0 430 360" role="img" aria-label="Vectors b=(-6,4) and a=(2,3) are perpendicular and span a rectangle of area 26">
        <defs>
          <marker id="cvAx" markerWidth="9" markerHeight="9" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7d889e" /></marker>
          <marker id="cvR" markerWidth="10" markerHeight="10" refX="6.5" refY="3.2" orient="auto"><path d="M0,0 L8,3.2 L0,6.4 Z" fill={RED} /></marker>
          <marker id="cvN" markerWidth="10" markerHeight="10" refX="6.5" refY="3.2" orient="auto"><path d="M0,0 L8,3.2 L0,6.4 Z" fill={BLUE} /></marker>
        </defs>
        <g opacity="0.85">{grid}</g>
        {/* axes */}
        <line x1={xMin - 4} y1={O[1]} x2={xMax + 12} y2={O[1]} stroke="#7d889e" strokeWidth="1.1" markerEnd="url(#cvAx)" />
        <line x1={O[0]} y1={yMax + 4} x2={O[0]} y2={yMin - 12} stroke="#7d889e" strokeWidth="1.1" markerEnd="url(#cvAx)" />
        <text x={xMax + 16} y={O[1] + 5} className="fg-ax">x</text>
        <text x={O[0] + 7} y={yMin - 10} className="fg-ax">y</text>
        {/* rectangle: fill + dashed completion + solid vectors */}
        <polygon points={pts(O, a, ab, b)} fill={BLUEFILL} stroke="none" />
        <line x1={a[0]} y1={a[1]} x2={ab[0]} y2={ab[1]} stroke={BLUE} strokeWidth="1.3" strokeDasharray="5 4" />
        <line x1={b[0]} y1={b[1]} x2={ab[0]} y2={ab[1]} stroke={BLUE} strokeWidth="1.3" strokeDasharray="5 4" />
        <polyline points={pts(p1, cn, p2)} fill="none" stroke="#55617d" strokeWidth="1.2" />
        <line x1={O[0]} y1={O[1]} x2={b[0]} y2={b[1]} stroke={BLUE} strokeWidth="2.6" markerEnd="url(#cvN)" />
        <line x1={O[0]} y1={O[1]} x2={a[0]} y2={a[1]} stroke={RED} strokeWidth="2.6" markerEnd="url(#cvR)" />
        {/* labels */}
        <text x={b[0] - 14} y={b[1] - 14} className="fg-vlab" fill={BLUE} textAnchor="end">b = (&minus;6, 4)</text>
        <text x={a[0] + 14} y={a[1] + 2} className="fg-vlab" fill={RED}>a = (2, 3)</text>
        <text x={(O[0] + ab[0]) / 2 - 6} y={(O[1] + ab[1]) / 2 + 5} className="fg-strong" textAnchor="middle">Area = 26</text>
        {/* dot-product annotation by the y-axis */}
        <text x={O[0] + 14} y={yMin + 16} className="fg-note">b&middot;a</text>
        <text x={O[0] + 14} y={yMin + 32} className="fg-note">= (&minus;6)(2) + (4)(3)</text>
        <text x={O[0] + 14} y={yMin + 48} className="fg-note">= 0 &nbsp;&rArr; &perp;</text>
      </svg>
    );
  }

  // ---- Figure 4: the (a+b)^2 "machine" — four ½ab triangles round a tilted square ----
  function MachineSquare() {
    const ox = 44, oy = 16, L = 120, a = 48;
    const A = [ox + a, oy], B = [ox + L, oy + a], C = [ox + (L - a), oy + L], D = [ox, oy + (L - a)];
    return (
      <svg className="fig-svg" viewBox="0 0 210 168" role="img" aria-label="An (a+b) squared square split into four half-ab triangles around a central tilted square of area a-squared plus b-squared">
        <rect x={ox} y={oy} width={L} height={L} fill={PINKFILL} stroke={NAVY} strokeWidth="1.2" />
        <polygon points={pts(A, B, C, D)} fill={BLUEFILL} stroke={BLUE} strokeWidth="1.7" strokeLinejoin="round" />
        <text x={ox + L / 2} y={oy + L / 2 + 5} className="fg-lab" textAnchor="middle">a&sup2;+b&sup2;</text>
        <text x={ox + 16} y={oy + 26} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={ox + L - 16} y={oy + 18} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={ox + L - 16} y={oy + L - 12} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={ox + 16} y={oy + L - 8} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={ox + L + 10} y={oy + a / 2 + 4} className="fg-lab">a</text>
        <text x={ox + L + 10} y={oy + a + (L - a) / 2 + 4} className="fg-lab">b</text>
      </svg>
    );
  }

  // ---- Figure 7: tilted square inscribed in a 2×2 grid, area = 2 ----
  function InscribedSqrt2() {
    const ox = 48, oy = 20, u = 55, L = 2 * u;
    const T = [ox + u, oy], Rt = [ox + L, oy + u], Bt = [ox + u, oy + L], Lt = [ox, oy + u];
    return (
      <svg className="fig-svg" viewBox="0 0 230 178" role="img" aria-label="A red square inscribed in a 2 by 2 grid by joining side midpoints has area 2">
        <rect x={ox} y={oy} width={L} height={L} fill={PINKFILL} stroke={NAVY} strokeWidth="1.2" />
        <line x1={ox + u} y1={oy} x2={ox + u} y2={oy + L} stroke={GRID} strokeWidth="1" strokeDasharray="4 3" />
        <line x1={ox} y1={oy + u} x2={ox + L} y2={oy + u} stroke={GRID} strokeWidth="1" strokeDasharray="4 3" />
        <polygon points={pts(T, Rt, Bt, Lt)} fill={REDFILL} stroke={RED} strokeWidth="2" strokeLinejoin="round" />
        <text x={ox + u} y={oy + u + 5} className="fg-strong" textAnchor="middle">area = 2</text>
        {[[ox + u / 2, oy + u / 2], [ox + 1.5 * u, oy + u / 2], [ox + 1.5 * u, oy + 1.5 * u], [ox + u / 2, oy + 1.5 * u]].map((c, i) =>
          <text key={i} x={c[0]} y={c[1] + 4} className="fg-sm" textAnchor="middle">&frac12;</text>)}
        <text x={ox - 13} y={oy + u / 2 + 4} className="fg-lab" textAnchor="middle">1</text>
        <text x={ox - 13} y={oy + 1.5 * u + 4} className="fg-lab" textAnchor="middle">1</text>
        <text x={ox + u / 2} y={oy + L + 18} className="fg-lab" textAnchor="middle">1</text>
        <text x={ox + 1.5 * u} y={oy + L + 18} className="fg-lab" textAnchor="middle">1</text>
      </svg>
    );
  }

  // ---- Figure 8: two subdivisions of one (a+b)^2 square (grid vs. triangles) ----
  function PythagTwoSubdiv() {
    const oy = 18, L = 120, a = 48, b = L - a;
    // left grid square
    const lx = 18, vx = lx + a, hy = oy + b;
    // right tilted square
    const rx = 214;
    const A = [rx + a, oy], B = [rx + L, oy + a], C = [rx + (L - a), oy + L], D = [rx, oy + (L - a)];
    return (
      <svg className="fig-svg wide" viewBox="0 0 356 192" role="img" aria-label="Two subdivisions of the same (a+b) squared square: a grid giving a-squared plus 2ab plus b-squared, and four triangles plus an inner square giving c-squared plus 2ab">
        {/* LEFT: grid subdivision */}
        <rect x={lx} y={oy} width={a} height={b} fill={BLUEFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={vx} y={oy} width={b} height={b} fill={GREENFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={lx} y={hy} width={a} height={a} fill={PINKFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={vx} y={hy} width={b} height={a} fill={BLUEFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={lx} y={oy} width={L} height={L} fill="none" stroke={NAVY} strokeWidth="1.4" />
        <text x={lx + a / 2} y={oy + b / 2 + 4} className="fg-lab" textAnchor="middle">ab</text>
        <text x={vx + b / 2} y={oy + b / 2 + 4} className="fg-lab" textAnchor="middle">b&sup2;</text>
        <text x={lx + a / 2} y={hy + a / 2 + 4} className="fg-lab" textAnchor="middle">a&sup2;</text>
        <text x={vx + b / 2} y={hy + a / 2 + 4} className="fg-lab" textAnchor="middle">ab</text>
        <text x={lx + L / 2} y={oy + L + 18} className="fg-cap-in" textAnchor="middle">= a&sup2; + 2ab + b&sup2;</text>
        {/* RIGHT: triangles + inner square */}
        <rect x={rx} y={oy} width={L} height={L} fill={PINKFILL} stroke={NAVY} strokeWidth="1.2" />
        <polygon points={pts(A, B, C, D)} fill={BLUEFILL} stroke={BLUE} strokeWidth="1.7" strokeLinejoin="round" />
        <text x={rx + L / 2} y={oy + L / 2 + 5} className="fg-lab" textAnchor="middle">c&sup2;</text>
        <text x={rx + 15} y={oy + 24} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={rx + L - 15} y={oy + 16} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={rx + L - 15} y={oy + L - 11} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={rx + 15} y={oy + L - 7} className="fg-sm" textAnchor="middle">&frac12;ab</text>
        <text x={rx + L / 2} y={oy + L + 18} className="fg-cap-in" textAnchor="middle">= c&sup2; + 2ab</text>
      </svg>
    );
  }

  // ---- rectangle = base × height, half of which is a right triangle ----
  function RectTriangle() {
    const ox = 38, oy = 20, w = 124, h = 78;
    return (
      <svg className="fig-svg" viewBox="0 0 210 128" role="img" aria-label="A rectangle of area a times b, split by a diagonal into a right triangle of area one half a b">
        <rect x={ox} y={oy} width={w} height={h} fill={BLUEFILL} stroke={NAVY} strokeWidth="1.4" />
        <polygon points={pts([ox, oy + h], [ox + w, oy + h], [ox + w, oy])} fill={PINKFILL} stroke={RED} strokeWidth="1.6" strokeLinejoin="round" />
        <rect x={ox + w - 9} y={oy + h - 9} width="9" height="9" fill="none" stroke={NAVY} strokeWidth="1" />
        <text x={ox + w / 2 - 14} y={oy + h / 2 + 12} className="fg-lab" textAnchor="middle">&frac12;ab</text>
        <text x={ox + w / 2} y={oy + h + 18} className="fg-lab" textAnchor="middle">a</text>
        <text x={ox + w + 11} y={oy + h / 2 + 4} className="fg-lab" textAnchor="middle">b</text>
      </svg>
    );
  }

  // ---- (a+b)^2 partial-product grid (standalone, for the cheat sheet) ----
  function AbSquare() {
    const ox = 34, oy = 14, L = 120, a = 48, b = L - a, vx = ox + a, hy = oy + b;
    return (
      <svg className="fig-svg" viewBox="0 0 188 168" role="img" aria-label="An (a+b) squared square split into ab, b-squared, a-squared and ab">
        <rect x={ox} y={oy} width={a} height={b} fill={BLUEFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={vx} y={oy} width={b} height={b} fill={GREENFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={ox} y={hy} width={a} height={a} fill={PINKFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={vx} y={hy} width={b} height={a} fill={BLUEFILL} stroke={NAVY} strokeWidth="1" />
        <rect x={ox} y={oy} width={L} height={L} fill="none" stroke={NAVY} strokeWidth="1.4" />
        <text x={ox + a / 2} y={oy + b / 2 + 4} className="fg-lab" textAnchor="middle">ab</text>
        <text x={vx + b / 2} y={oy + b / 2 + 4} className="fg-lab" textAnchor="middle">b&sup2;</text>
        <text x={ox + a / 2} y={hy + a / 2 + 4} className="fg-lab" textAnchor="middle">a&sup2;</text>
        <text x={vx + b / 2} y={hy + a / 2 + 4} className="fg-lab" textAnchor="middle">ab</text>
        <text x={ox + L / 2} y={oy + L + 18} className="fg-cap-in" textAnchor="middle">a + b</text>
      </svg>
    );
  }

  Object.assign(ZFIGURES, {
    perfectSquares: PerfectSquares,
    tiltedSquares: TiltedSquares,
    crossVectors: CrossVectors,
    machineSquare: MachineSquare,
    inscribedSqrt2: InscribedSqrt2,
    pythagTwoSubdiv: PythagTwoSubdiv,
    rectTriangle: RectTriangle,
    abSquare: AbSquare,
  });

