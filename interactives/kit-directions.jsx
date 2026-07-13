/* Direction B — "Notebook" interactive (the chosen design).
   UNIFIED FIGURE: every grid square is a step (p, q) — p across, q up — with
   area p² + q². A perfect square is just the q = 0 case (no tilt); a tilted
   square is q > 0. One widget covers both.

   Drag the red pin P, tap a preset, or use the sliders. Everything snaps to
   integers — the grid is drawn FROM the lattice origin, so every integer point
   lands on an intersection.

   The upright bounding square has side (p+q). Four corner triangles (each ½pq)
   fill the gap; peel them off and the tilted square (p²+q²) remains:
      (p+q)² − 4·½pq = (p+q)² − 2pq = p² + q².
   At q = 0 the triangles vanish and the bounding square IS the square → p². */
(function () {
  const NAVY = '#26345f', BLUE = '#3a5694', RED = '#bf3535', GRID = '#c3cde2';
  const GREEN = '#3f9b73';
  const BLUEFILL = 'rgba(74,110,190,0.16)';
  const PINK = 'rgba(226,138,166,0.40)';
  const PINKEDGE = 'rgba(191,53,53,0.28)';

  const VB = { w: 360, h: 340 };
  const u = 30;
  const O = [90, 186];        // grid intersection (lattice origin)
  const MAXP = 4, MAXQ = 4;

  // tilted scene presets, labeled by area n. (Perfect squares are reached by
  // dragging q down to 0 — no preset needed.)
  const SCENES = [
    { p: 1, q: 1, name: '2' },
    { p: 1, q: 2, name: '5' },
    { p: 2, q: 3, name: '13' },
  ];

  function geo(p, q) {
    const L = (p + q) * u;
    const P = [O[0] + p * u, O[1] - q * u];
    const Q = [O[0] + (p + q) * u, O[1] + (p - q) * u];
    const R = [O[0] + q * u, O[1] + p * u];
    // axis-aligned bounding square corners
    const TL = [O[0], O[1] - q * u], TR = [O[0] + L, O[1] - q * u];
    const BR = [O[0] + L, O[1] + p * u], BL = [O[0], O[1] + p * u];
    // four corner offcut triangles (each ½·p·q·u²)
    const tris = [[TL, P, O], [TR, Q, P], [BR, R, Q], [BL, O, R]];
    return { O, P, Q, R, TL, TR, BR, BL, tris, area: p * p + q * q };
  }
  const ptsOf = (...a) => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const cen = (t) => [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
  // real radical: √ glyph + an overbar (vinculum) stretching across the radicand
  // proper radical: a √ check (inline SVG that stretches to the line) joined to an
  // overbar (border-top) over the radicand — scales with the surrounding font.
  const Radical = ({ children }) => (
    <span className="kitB-sqrt">
      <svg className="kitB-sqrt-sign" viewBox="0 0 10 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,12 L3.4,19.6 L10,0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="butt" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="kitB-sqrt-body">{children}</span>
    </span>
  );
  // exponent form — used in the value/plug-in rows
  const RadExp = ({ children }) => (
    <span className="kitB-pow">({children})<sup className="kitB-sup kitB-halfexp"><span className="kitB-dfrac"><span className="kitB-dfn">1</span><span className="kitB-dfsl">/</span><span className="kitB-dfd">2</span></span></sup></span>
  );
  const Sup = ({ children }) => <sup className="kitB-sup">{children}</sup>;
  // curly dimension braces (proper overbraces: end tips point toward the figure,
  // center spike points AWAY from it). dir = -1 → spike up/left; +1 → spike down/right.
  const braceH = (x1, x2, edgeY, h, dir = -1) => {
    const xm = (x1 + x2) / 2, tipY = edgeY + dir * 4, my = tipY + dir * h / 2, sy = tipY + dir * h;
    return `M${x1},${tipY} Q${x1},${my} ${(x1 + xm) / 2},${my} Q${xm},${my} ${xm},${sy} Q${xm},${my} ${(xm + x2) / 2},${my} Q${x2},${my} ${x2},${tipY}`;
  };
  const braceV = (edgeX, y1, y2, w, dir = -1) => {
    const ym = (y1 + y2) / 2, tipX = edgeX + dir * 4, mx = tipX + dir * w / 2, sx = tipX + dir * w;
    return `M${tipX},${y1} Q${mx},${y1} ${mx},${(y1 + ym) / 2} Q${mx},${ym} ${sx},${ym} Q${mx},${ym} ${mx},${(ym + y2) / 2} Q${mx},${y2} ${tipX},${y2}`;
  };

  function gridLines_REMOVED() {
    const out = [];
    return out;
  }
  // grid lines covering a local-coordinate range (so they fill the frame after
  // the fit-transform), drawn on the same phase as the lattice origin O.
  function gridLines(lx0, lx1, ly0, ly1) {
    const out = [];
    const xs = Math.floor((lx0 - O[0]) / u) * u + O[0];
    const ys = Math.floor((ly0 - O[1]) / u) * u + O[1];
    let k = 0;
    for (let x = xs; x <= lx1; x += u, k++)
      out.push(<line key={'v' + k} x1={x} y1={ly0} x2={x} y2={ly1} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" />);
    k = 0;
    for (let y = ys; y <= ly1; y += u, k++)
      out.push(<line key={'h' + k} x1={lx0} y1={y} x2={lx1} y2={y} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" />);
    return out;
  }

  function KitNotebook({ braceSide = 'OP', tableStyle = 'sheet', panelLayout = 'full' } = {}) {
    const minimal = panelLayout === 'min';
    const [pq, setPq] = React.useState(() => ({ p: 2, q: minimal ? 0 : 1 }));   // A: open on perfect square; B: open tilted (q≥1)
    const [pop, setPop] = React.useState(0);
    const [touched, setTouched] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [showTrap, setShowTrap] = React.useState(true);   // bounding square + offcut triangles
    const svgRef = React.useRef(null);
    const gRef = React.useRef(null);
    const drag = React.useRef(false);
    const first = React.useRef(true);
    React.useEffect(() => {
      if (first.current) { first.current = false; return; }
      setPop(p => p + 1);
    }, [pq.p, pq.q]);
    // Layout B is tilted-squares-only: if we enter it while sitting on a
    // perfect square (q=0), bump to q=1 so figure/slider/badge stay in sync.
    React.useEffect(() => {
      if (!minimal && pq.q === 0) setPq(v => ({ ...v, q: 1 }));
    }, [minimal]);

    // smoothly eased display position — the figure glides toward the snapped
    // integer target (pq) instead of jumping, so dragging feels fluid.
    const reduceMotion = typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [disp, setDisp] = React.useState(() => ({ p: 2, q: minimal ? 0 : 1 }));
    const dispRef = React.useRef({ p: 2, q: minimal ? 0 : 1 });
    const rafRef = React.useRef(0);
    React.useEffect(() => {
      cancelAnimationFrame(rafRef.current);
      if (reduceMotion) { dispRef.current = { p: pq.p, q: pq.q }; setDisp({ p: pq.p, q: pq.q }); return; }
      const step = () => {
        const c = dispRef.current;
        const k = 0.28;                                  // per-frame ease (~150ms settle)
        const np = c.p + (pq.p - c.p) * k;
        const nq = c.q + (pq.q - c.q) * k;
        const done = Math.abs(pq.p - np) < 0.0015 && Math.abs(pq.q - nq) < 0.0015;
        const next = done ? { p: pq.p, q: pq.q } : { p: np, q: nq };
        dispRef.current = next;
        setDisp(next);
        if (!done) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
    }, [pq.p, pq.q, reduceMotion]);

    const toLattice = (e) => {
      const grp = gRef.current; if (!grp) return null;
      const m = grp.getScreenCTM(); if (!m) return null;
      const pt = grp.ownerSVGElement.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const l = pt.matrixTransform(m.inverse());
      const p = Math.max(1, Math.min(MAXP, Math.round((l.x - O[0]) / u)));   // p ≥ 1, never a dot
      const q = Math.max(minimal ? 0 : 1, Math.min(MAXQ, Math.round((O[1] - l.y) / u)));   // A: q≥0 can flatten; B: q≥1 stays tilted
      return { p, q };
    };
    const onDown = (e) => {
      drag.current = true; setDragging(true); setTouched(true);
      e.target.setPointerCapture?.(e.pointerId);
      const v = toLattice(e); if (v) setPq(v);
    };
    const onMove = (e) => { if (!drag.current) return; const v = toLattice(e); if (v) setPq(v); };
    const onUp = () => { drag.current = false; setDragging(false); };
    const pickScene = (s) => { setTouched(true); setPq({ p: s.p, q: s.q }); };

    const g = geo(disp.p, disp.q);
    // B — while pin-dragging, the pin sits on the LIVE snapped lattice cell under
    // the cursor (instant); the eased blue square catches up to it.
    const pinLocal = dragging ? [O[0] + pq.p * u, O[1] - pq.q * u] : g.P;
    const activeScene = SCENES.findIndex(s => s.p === pq.p && s.q === pq.q);
    const perfect = pq.q === 0;
    const areaInt = pq.p * pq.p + pq.q * pq.q;          // exact area from the integer state (not the eased float)
    const labelBelow = g.P[1] < 40;                  // flip coord tag near top edge
    const offcut = 2 * pq.p * pq.q;
    const outer = (pq.p + pq.q) * (pq.p + pq.q);
    const triVal = pq.p * pq.q / 2;                  // area of one corner triangle
    const triRoom = pq.p >= 1 && pq.q >= 1 && pq.p * u >= 26 && pq.q * u >= 26;
    // vertex coordinates relative to the origin (math convention, y up), matching
    // the widget's clockwise build: v=(p,q), w=(q,−p).
    const cx4 = (g.O[0] + g.P[0] + g.Q[0] + g.R[0]) / 4;
    const cy4 = (g.O[1] + g.P[1] + g.Q[1] + g.R[1]) / 4;
    const verts = [
      [g.O, [0, 0]],
      [pinLocal, [pq.p, pq.q]],
      [g.Q, [pq.p + pq.q, pq.q - pq.p]],
      [g.R, [pq.q, -pq.p]],
    ];
    // ---- framing: CONSTANT scale (never resizes) that centers the figure's
    // centroid in the frame, so the square sits middle-aligned with equal grid
    // margin all around. The centering tracks the (eased) figure every frame, so
    // it is ALWAYS centered — no freeze, nothing to settle/re-fix on release. ----
    const M = 40;                                   // margin for labels/braces
    // one fixed scale, sized so the largest centroid-centered figure just fits
    const S = (VB.h / 2) / ((MAXP + MAXQ) * u / 2 + M);
    const frameAt = (pp, qq) => {
      const cx = O[0] + u * (pp + qq) / 2;          // figure centroid (local)
      const cy = O[1] + u * (pp - qq) / 2;
      return { tx: VB.w / 2 - S * cx, ty: VB.h / 2 - S * cy };
    };
    const fr = frameAt(disp.p, disp.q);
    const s = S, tx = fr.tx, ty = fr.ty;
    const xform = `translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${s.toFixed(4)})`;
    const lx0 = -tx / s, lx1 = (VB.w - tx) / s, ly0 = -ty / s, ly1 = (VB.h - ty) / s;

    return (
      <div className="kit kitB">
       <div className={'kitB-top' + (minimal ? ' kitB-top--min' : '')}>
        <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} className="kit-svg"
          onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <defs>
            <filter id="pinShadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#26345f" floodOpacity="0.35" />
            </filter>
          </defs>
          <g ref={gRef} transform={xform}>
          <g opacity="0.85">{gridLines(lx0, lx1, ly0, ly1)}</g>

          {/* dashed bounding square (side p+q) + four offcut triangles (2pq) */}
          {!perfect && showTrap && g.tris.map((t, i) => {
            const c = cen(t);
            return (
              <g key={i}>
                <polygon points={ptsOf(...t)} fill={PINK} stroke={PINKEDGE} strokeWidth="1" strokeLinejoin="round" />
                {triRoom && <text x={c[0]} y={c[1] + 4} className="kitB-trilab" textAnchor="middle">½pq</text>}
              </g>
            );
          })}
          {!perfect && showTrap &&
            <polygon points={ptsOf(g.TL, g.TR, g.BR, g.BL)} fill="none" stroke={NAVY} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />}

          {/* p (horizontal) + q (vertical) dimension braces on the side's rise/run legs.
              braceSide picks which side of the tilted square they decorate. */}
          {!perfect && (braceSide === 'OP' || braceSide === 'both') && <>
            <path d={braceH(g.TL[0], g.P[0], g.TL[1], 7, -1)} className="kitB-brace" fill="none" />
            <text x={(g.TL[0] + g.P[0]) / 2} y={g.TL[1] - 17} className="kitB-bracelab" textAnchor="middle">p = {pq.p}</text>
            <path d={braceV(g.TL[0], g.TL[1], g.O[1], 7, -1)} className="kitB-brace" fill="none" />
            <text x={g.TL[0] - 17} y={(g.TL[1] + g.O[1]) / 2 + 4} className="kitB-bracelab" textAnchor="end">q = {pq.q}</text>
          </>}
          {!perfect && (braceSide === 'RQ' || braceSide === 'both') && <>
            <path d={braceH(g.R[0], g.BR[0], g.BL[1], 7, 1)} className="kitB-brace" fill="none" />
            <text x={(g.R[0] + g.BR[0]) / 2} y={g.BL[1] + 33} className="kitB-bracelab" textAnchor="middle">p = {pq.p}</text>
            <path d={braceV(g.BR[0], g.BR[1], g.Q[1], 7, 1)} className="kitB-brace" fill="none" />
            <text x={g.BR[0] + 17} y={(g.BR[1] + g.Q[1]) / 2 + 4} className="kitB-bracelab" textAnchor="start">q = {pq.q}</text>
          </>}

          {/* the tilted square (p²+q²) — solid blue on top */}
          <polygon points={ptsOf(g.O, g.P, g.Q, g.R)} fill={BLUEFILL} stroke={BLUE} strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx={g.O[0]} cy={g.O[1]} r="3.5" fill={NAVY} />

          {/* corner P marker — the draggable red pin */}
          <g className="kitB-pin" onPointerDown={onDown} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
            <circle cx={pinLocal[0]} cy={pinLocal[1]} r="14" fill="transparent" />
            <circle cx={pinLocal[0]} cy={pinLocal[1]} r={dragging ? 6.5 : 5.5} fill={RED} stroke="#fff" strokeWidth="2" filter="url(#pinShadow)" style={{ transition: 'r .12s' }} />
          </g>
          {/* vertex coordinates (relative to origin) — the algebra made visible */}
          {verts.map(([pos, c], i) => {
            let ox, oy, anchor;
            if (i === 1) {                       // pin: bias right, clear of the braces above
              ox = pos[0] + 15; oy = pos[1] - 7; anchor = 'start';
            } else {
              const dx = pos[0] - cx4, dy = pos[1] - cy4;
              const len = Math.hypot(dx, dy) || 1;
              ox = pos[0] + dx / len * 15;
              oy = pos[1] + dy / len * 15 + 4;
              anchor = dx > 6 ? 'start' : dx < -6 ? 'end' : 'middle';
            }
            return (
              <g key={'v' + i}>
                {i !== 1 && <circle cx={pos[0]} cy={pos[1]} r="2.6" fill={NAVY} />}
                <text x={ox} y={oy} textAnchor={anchor} className="kitB-vlab">({c[0]}, {c[1]})</text>
              </g>
            );
          })}
          </g>

          {/* perfect-square cue — fixed in frame (outside the fit-transform) */}
          {perfect && <text x={VB.w - 12} y={22} className="kitB-perfect" textAnchor="end">perfect square ✓</text>}
        </svg>

        {/* structured plugin panel — left of the drawing */}
        <div className="kitB-panel">
          <div className="kitB-slidercard">
            <div className="kitB-sliders">
              <label>p <input type="range" min="1" max={MAXP} value={pq.p} onChange={e => { setTouched(true); setPq(v => ({ ...v, p: +e.target.value })); }} /><b>{pq.p}</b></label>
              <label>q <input type="range" min={minimal ? 0 : 1} max={MAXQ} value={pq.q} onChange={e => { setTouched(true); setPq(v => ({ ...v, q: +e.target.value })); }} /><b>{pq.q}</b></label>
            </div>
            {!minimal && tableStyle === 'sheet' && (
              <div className="kitB-step"><span className="kitB-step-key">Step</span> <i>(p, q)</i> = <b>({pq.p}, {pq.q})</b></div>
            )}
          </div>
          {!minimal && <div className="kitB-sh-grid">
            <span className="kitB-sh-h">Side</span>
            <span className="kitB-sh-h">Area</span>
            <div className="kitB-sh-rule"></div>
            <span className="kitB-sh-f"><Radical>p{<Sup>2</Sup>}+q{<Sup>2</Sup>}</Radical></span>
            <span className="kitB-sh-f">{perfect ? <>(p){<Sup>2</Sup>}</> : <>(p+q){<Sup>2</Sup>} − 4·½(p)(q)</>}</span>
            <span className="kitB-sh-n"><RadExp>{pq.p}{<Sup>2</Sup>}+{pq.q}{<Sup>2</Sup>}</RadExp></span>
            <span className="kitB-sh-n">{perfect ? <>({pq.p}){<Sup>2</Sup>}</> : <>({pq.p}+{pq.q}){<Sup>2</Sup>} − 2({pq.p})({pq.q})</>}</span>
            <span className="kitB-sh-v"><RadExp><b>{areaInt}</b></RadExp>{Number.isInteger(Math.sqrt(areaInt)) && <> = <b>{Math.sqrt(areaInt)}</b></>}</span>
            <span className="kitB-sh-v"><b>{areaInt}</b></span>
          </div>}

          <button type="button" className="kitB-toggle" onClick={() => setShowTrap(t => !t)}>
            <span className="kitB-tgl-text">
              <span className="kitB-tgl-title">Show the trap</span>
              <span className="kitB-tgl-sub">Bounding square &amp; four offcuts</span>
            </span>
            <span className={'kitB-switch' + (showTrap ? ' on' : '')}><span /></span>
          </button>
        </div>
       </div>
      </div>
    );
  }

  Object.assign(window, { KitNotebook });
})();
