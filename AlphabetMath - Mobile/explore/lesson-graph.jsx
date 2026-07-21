/* Lesson Player — the one persistent graph (right side).
   A single lattice camera eases between sections; every scene draws in WORLD
   units (y up, integers on grid intersections) and maps to screen each frame.
   RED = p/a (first variable) · BLUE = q/b/square · NAVY = structure. */
(function () {
  const { useState, useRef, useEffect } = React;
  const NAVY = '#26345f', BLUE = '#3a5694', RED = '#bf3535';
  const GRID = '#ccd5e8', AXIS = '#a2aec9';
  const BLUEFILL = 'rgba(74,110,190,0.16)', PINK = 'rgba(226,138,166,0.38)', PINKEDGE = 'rgba(191,53,53,0.28)';
  const REDFILL = 'rgba(191,53,53,0.13)', NEUT = 'rgba(80,95,140,0.07)';
  const lerp = (a, b, k) => a + (b - a) * k;

  function useSize(ref) {
    const [sz, setSz] = useState({ w: 800, h: 700 });
    useEffect(() => {
      const el = ref.current; if (!el) return;
      const ro = new ResizeObserver(() => setSz({ w: el.clientWidth || 800, h: el.clientHeight || 700 }));
      ro.observe(el); setSz({ w: el.clientWidth || 800, h: el.clientHeight || 700 });
      return () => ro.disconnect();
    }, []);
    return sz;
  }

  function camTarget(mode, s, w, h) {
    const m = 2.6;
    if (mode === 'step') return { cx: (s.p + s.q) / 2, cy: (s.q - s.p) / 2, S: Math.min(w, h) / 10.9 };
    if (mode === 'cross') return { cx: -2, cy: 3.5, S: Math.min(w / (8 + m + 3.4), h / (7 + m)) };
    if (mode === 'inscribe') return { cx: s.n / 2, cy: s.n / 2, S: Math.min(w, h) / (s.n + m + 0.8) };
    return { cx: (s.a + s.b) / 2, cy: (s.a + s.b) / 2 - 0.35, S: Math.min(w, h) / (s.a + s.b + m + 0.6) };
  }

  // curly dimension braces, screen space (spike points AWAY from figure)
  const braceH = (x1, x2, edgeY, hh, dir) => {
    const xm = (x1 + x2) / 2, tipY = edgeY + dir * 4, my = tipY + dir * hh / 2, sy = tipY + dir * hh;
    return `M${x1},${tipY} Q${x1},${my} ${(x1 + xm) / 2},${my} Q${xm},${my} ${xm},${sy} Q${xm},${my} ${(xm + x2) / 2},${my} Q${x2},${my} ${x2},${tipY}`;
  };
  const braceV = (edgeX, y1, y2, ww, dir) => {
    const ym = (y1 + y2) / 2, tipX = edgeX + dir * 4, mx = tipX + dir * ww / 2, sx = tipX + dir * ww;
    return `M${tipX},${y1} Q${mx},${y1} ${mx},${(y1 + ym) / 2} Q${mx},${ym} ${sx},${ym} Q${mx},${ym} ${mx},${(ym + y2) / 2} Q${mx},${y2} ${tipX},${y2}`;
  };
  const fmt = (x) => Number.isInteger(x) ? String(x) : (Math.round(x * 100) / 100).toString();

  function LessonGraph({ mode, minQ = 0, state, labels, setState, sectionId }) {
    const hostRef = useRef(null), gRef = useRef(null);
    const { w, h } = useSize(hostRef);
    const [dragging, setDragging] = useState(false);
    const dragRef = useRef(false);

    // eased floats: shape params + camera
    const animRef = useRef(null);
    const [, setTick] = useState(0);
    const target = { p: state.p, q: state.q, n: state.n, a: state.a, b: state.b, ...camTarget(mode, state, w, h) };
    if (!animRef.current) animRef.current = { ...target };
    const rafRef = useRef(0);
    useEffect(() => {
      cancelAnimationFrame(rafRef.current);
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { animRef.current = { ...target }; setTick(t => t + 1); return; }
      const step = () => {
        const c = animRef.current; let done = true;
        for (const k in target) {
          const nv = lerp(c[k], target[k], 0.2);
          const eps = k === 'S' ? 0.05 : 0.002;
          if (Math.abs(target[k] - nv) > eps) done = false;
          c[k] = done && Math.abs(target[k] - nv) <= eps ? c[k] : nv;
          if (Math.abs(target[k] - c[k]) <= eps) c[k] = target[k];
        }
        setTick(t => t + 1);
        if (!done) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
    }, [state.p, state.q, state.n, state.a, state.b, mode, w, h]);

    const A = animRef.current;
    const X = (x) => w / 2 + (x - A.cx) * A.S;
    const Y = (y) => h / 2 - (y - A.cy) * A.S;
    const P = (x, y) => X(x).toFixed(1) + ',' + Y(y).toFixed(1);

    // ---- grid + axes (edge to edge, integer lattice) ----
    const x0 = Math.floor(A.cx - w / 2 / A.S), x1 = Math.ceil(A.cx + w / 2 / A.S);
    const y0 = Math.floor(A.cy - h / 2 / A.S), y1 = Math.ceil(A.cy + h / 2 / A.S);
    const grid = [], ticks = [];
    const tickStep = A.S >= 34 ? 1 : 2;
    for (let x = x0; x <= x1; x++) {
      grid.push(<line key={'v' + x} x1={X(x)} y1={0} x2={X(x)} y2={h} stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 1.5 : 1} />);
      if (labels && x !== 0 && x % tickStep === 0) ticks.push(<text key={'tx' + x} x={X(x)} y={Y(0) + 16} textAnchor="middle" className="fig-tick">{x}</text>);
    }
    for (let y = y0; y <= y1; y++) {
      grid.push(<line key={'h' + y} x1={0} y1={Y(y)} x2={w} y2={Y(y)} stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 1.5 : 1} />);
      if (labels && y !== 0 && y % tickStep === 0) ticks.push(<text key={'ty' + y} x={X(0) - 7} y={Y(y) + 4} textAnchor="end" className="fig-tick">{y}</text>);
    }

    // ---- pin drag (step modes) ----
    const toWorld = (e) => {
      const r = hostRef.current.getBoundingClientRect();
      const x = (e.clientX - r.left - w / 2) / A.S + A.cx, y = -((e.clientY - r.top - h / 2) / A.S) + A.cy;
      return { p: Math.max(1, Math.min(4, Math.round(x))), q: Math.max(minQ, Math.min(4, Math.round(y))) };
    };
    const onDown = (e) => { dragRef.current = true; setDragging(true); e.target.setPointerCapture?.(e.pointerId); const v = toWorld(e); setState(st => ({ ...st, ...v })); };
    const onMove = (e) => { if (!dragRef.current) return; const v = toWorld(e); setState(st => ({ ...st, ...v })); };
    const onUp = () => { dragRef.current = false; setDragging(false); };

    let scene = null;

    if (mode === 'step') {
      const { p, q } = A, ip = state.p, iq = state.q;
      const perfect = iq === 0 && Math.abs(q) < 0.05;
      const trap = sectionId === 'trap' && state.showTrap && iq > 0;
      const pin = dragging ? [X(state.p), Y(state.q)] : [X(p), Y(q)];
      const tris = [[[0, q], [p, q], [0, 0]], [[p + q, q], [p + q, q - p], [p, q]], [[p + q, q - p], [q, -p], [p + q, -p]], [[0, -p], [0, 0], [q, -p]]];
      const triRoom = ip >= 1 && iq >= 1 && ip * A.S >= 30 && iq * A.S >= 30;
      const verts = [[p + q, q - p, `(${ip + iq}, ${iq - ip})`], [q, -p, `(${iq}, −${ip})`]];
      scene = <g key="step" className="scene-pop">
        {trap && tris.map((t, i) => {
          const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
          return <g key={i}><polygon points={t.map(v => P(v[0], v[1])).join(' ')} fill={PINK} stroke={PINKEDGE} strokeWidth="1" strokeLinejoin="round" />
            {triRoom && labels && <text x={X(cx)} y={Y(cy) + 5} textAnchor="middle" className="fig-lab" fontSize="13">½pq</text>}</g>;
        })}
        {trap && <polygon points={[P(0, q), P(p + q, q), P(p + q, -p), P(0, -p)].join(' ')} fill="none" stroke={NAVY} strokeWidth="1.2" strokeDasharray="5 5" opacity="0.55" />}
        <polygon points={[P(0, 0), P(p, q), P(p + q, q - p), P(q, -p)].join(' ')} fill={BLUEFILL} stroke={BLUE} strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx={X(0)} cy={Y(0)} r="3" fill={NAVY} />
        {labels && !perfect && iq > 0 && <>
          <path d={braceH(X(0), X(p), Y(q), 8, -1)} className="fig-brace" />
          <text x={(X(0) + X(p)) / 2} y={Y(q) - 20} textAnchor="middle" className="fig-vlab" fontSize="15" fill={RED} fontWeight="700">p = {ip}</text>
          <path d={braceV(X(0), Y(q), Y(0), 8, -1)} className="fig-brace" />
          <text x={X(0) - 20} y={(Y(q) + Y(0)) / 2 + 5} textAnchor="end" className="fig-vlab" fontSize="15" fill={'#2f4bce'} fontWeight="700">q = {iq}</text>
        </>}
        <text x={X((p + q) / 2)} y={Y((q - p) / 2) + 10} textAnchor="middle" className="fig-area">{ip * ip + iq * iq}</text>
        {labels && verts.map((v, i) => <g key={'vx' + i}><circle cx={X(v[0])} cy={Y(v[1])} r="3" fill={NAVY} />
          <text x={X(v[0]) + (v[0] > (p + q) / 2 ? 10 : -10)} y={Y(v[1]) + (v[1] < (q - p) / 2 ? 20 : -10)} textAnchor={v[0] > (p + q) / 2 ? 'start' : 'end'} className="fig-vlab" fontSize="13.5">{v[2]}</text></g>)}
        <g onPointerDown={onDown} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
          <circle cx={pin[0]} cy={pin[1]} r="16" fill="transparent" />
          <circle cx={pin[0]} cy={pin[1]} r={dragging ? 8 : 7} fill={RED} stroke="#fff" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 2px 3px rgba(38,52,95,0.4))', transition: 'r .12s' }} />
        </g>
        {labels && <text x={pin[0] + 14} y={pin[1] - 10} className="fig-coord" fontSize="15">({ip}, {iq})</text>}
        {perfect && <text x={w - 20} y={30} textAnchor="end" className="fig-perfect">perfect square ✓</text>}
      </g>;
    }

    if (mode === 'cross') {
      const a = [2, 3], b = [-6, 4], ab = [-4, 7];
      const arrow = (to, color, id) => <g key={id}>
        <line x1={X(0)} y1={Y(0)} x2={X(to[0] * 0.94)} y2={Y(to[1] * 0.94)} stroke={color} strokeWidth="3" strokeLinecap="round" />
        <polygon points={arrowHead(to, color)} fill={color} />
      </g>;
      const arrowHead = (to) => {
        const tx = X(to[0]), ty = Y(to[1]);
        const dx = tx - X(0), dy = ty - Y(0), L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        const bx = tx - ux * 13, by = ty - uy * 13;
        return `${tx},${ty} ${bx - uy * 5},${by + ux * 5} ${bx + uy * 5},${by - ux * 5}`;
      };
      // right-angle mark at O between a and b directions
      const ua = [2 / Math.hypot(2, 3), 3 / Math.hypot(2, 3)], ub = [-6 / Math.hypot(6, 4), 4 / Math.hypot(6, 4)];
      const mS = 14 / A.S;
      scene = <g key="cross" className="scene-pop">
        <polygon points={[P(0, 0), P(a[0], a[1]), P(ab[0], ab[1]), P(b[0], b[1])].join(' ')} fill={BLUEFILL} stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
        {state.showRoutes && <polygon points={[P(-6, 0), P(2, 0), P(2, 7), P(-6, 7)].join(' ')} fill="none" stroke={NAVY} strokeWidth="1.2" strokeDasharray="5 5" opacity="0.5" />}
        <path d={`M${P(ua[0] * mS, ua[1] * mS)} L${P((ua[0] + ub[0]) * mS, (ua[1] + ub[1]) * mS)} L${P(ub[0] * mS, ub[1] * mS)}`} fill="none" stroke={NAVY} strokeWidth="1.5" />
        {arrow(a, RED, 'a')}{arrow(b, '#2f4bce', 'b')}
        <circle cx={X(0)} cy={Y(0)} r="4" fill={NAVY} />
        <text x={(X(-2))} y={Y(3.5) + 10} textAnchor="middle" className="fig-area">26</text>
        {labels && <>
          <text x={X(a[0]) + 12} y={Y(a[1]) + 5} className="fig-vlab" fontSize="16" fill={RED} fontWeight="700">a = (2, 3)</text>
          <text x={X(b[0]) - 12} y={Y(b[1]) - 8} textAnchor="end" className="fig-vlab" fontSize="16" fill="#2f4bce" fontWeight="700">b = (−6, 4)</text>
          <text x={X(0) + 12} y={Y(0) + 20} className="fig-vlab" fontSize="13.5">(0, 0)</text>
        </>}
        {state.showRoutes && <>
          <text x={X(1) + 8} y={(Y(0) + Y(3)) / 2 + 8} className="fig-vlab" fontSize="14" fill={RED}>|a| = √13</text>
          <text x={X(-3.2)} y={(Y(2)) - 12} textAnchor="end" className="fig-vlab" fontSize="14" fill="#2f4bce">|b| = 2√13</text>
          <text x={X(-2)} y={Y(7) - 14} textAnchor="middle" className="fig-lab" fontSize="15">(−6)(3) − (4)(2) = −26 → area 26</text>
        </>}
      </g>;
    }

    if (mode === 'inscribe') {
      const n = A.n, ni = state.n, hn = n / 2;
      const area = ni * ni / 2;
      const tris = [[[0, 0], [hn, 0], [0, hn]], [[n, 0], [n, hn], [hn, 0]], [[n, n], [hn, n], [n, hn]], [[0, n], [0, hn], [hn, n]]];
      const mids = [[hn, 0], [n, hn], [hn, n], [0, hn]];
      scene = <g key="inscribe" className="scene-pop">
        {tris.map((t, i) => <polygon key={i} points={t.map(v => P(v[0], v[1])).join(' ')} fill={PINK} stroke={PINKEDGE} strokeWidth="1" strokeLinejoin="round" />)}
        <polygon points={[P(0, 0), P(n, 0), P(n, n), P(0, n)].join(' ')} fill="none" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={mids.map(v => P(v[0], v[1])).join(' ')} fill={BLUEFILL} stroke={BLUE} strokeWidth="2.4" strokeLinejoin="round" />
        {mids.map((v, i) => <circle key={'m' + i} cx={X(v[0])} cy={Y(v[1])} r="4" fill={NAVY} />)}
        <text x={X(hn)} y={Y(hn) + 10} textAnchor="middle" className="fig-area">{fmt(area)}</text>
        {labels && <>
          <path d={braceH(X(0), X(n), Y(0), 8, 1)} className="fig-brace" />
          <text x={X(hn)} y={Y(0) + 34} textAnchor="middle" className="fig-vlab" fontSize="15" fill={RED} fontWeight="700">n = {ni}</text>
          <text x={(X(hn) + X(n)) / 2 + 14} y={(Y(0) + Y(hn)) / 2 + 18} className="fig-vlab" fontSize="15" fill={BLUE} fontWeight="700">side = √{fmt(area)}{ni === 2 ? ' = √2 ✓' : ''}</text>
        </>}
      </g>;
    }

    if (mode === 'pythag' || mode === 'expand') {
      const a = A.a, b = A.b, c = a + b, ia = state.a, ib = state.b;
      const tilted = mode === 'pythag' && state.split === 'tilted';
      const parts = mode === 'expand' ? state.showParts : !tilted;
      const gridSplit = <g style={{ opacity: tilted ? 0 : 1, transition: 'opacity .45s' }}>
        {parts && <>
          <rect x={X(0)} y={Y(a)} width={a * A.S} height={a * A.S} fill={REDFILL} />
          <rect x={X(a)} y={Y(c)} width={b * A.S} height={b * A.S} fill={BLUEFILL} />
          <rect x={X(a)} y={Y(a)} width={b * A.S} height={a * A.S} fill={NEUT} />
          <rect x={X(0)} y={Y(c)} width={a * A.S} height={b * A.S} fill={NEUT} />
          <text x={X(a / 2)} y={Y(a / 2) + 8} textAnchor="middle" className="fig-area" fill={RED} fontSize="24">a²</text>
          <text x={X(a + b / 2)} y={Y(a + b / 2) + 8} textAnchor="middle" className="fig-area" fill={BLUE} fontSize="24">b²</text>
          <text x={X(a + b / 2)} y={Y(a / 2) + 7} textAnchor="middle" className="fig-lab" fontSize="17">ab</text>
          <text x={X(a / 2)} y={Y(a + b / 2) + 7} textAnchor="middle" className="fig-lab" fontSize="17">ab</text>
        </>}
        <line x1={X(0)} y1={Y(a)} x2={X(c)} y2={Y(a)} stroke={NAVY} strokeWidth="1.4" strokeDasharray={parts ? '' : '5 5'} opacity="0.7" />
        <line x1={X(a)} y1={Y(0)} x2={X(a)} y2={Y(c)} stroke={NAVY} strokeWidth="1.4" strokeDasharray={parts ? '' : '5 5'} opacity="0.7" />
      </g>;
      const tvs = [[a, 0], [c, a], [b, c], [0, b]];
      const ttris = [[[0, 0], [a, 0], [0, b]], [[a, 0], [c, 0], [c, a]], [[c, a], [c, c], [b, c]], [[b, c], [0, c], [0, b]]];
      const tiltSplit = mode === 'pythag' && <g style={{ opacity: tilted ? 1 : 0, transition: 'opacity .45s' }} pointerEvents="none">
        {ttris.map((t, i) => <polygon key={i} points={t.map(v => P(v[0], v[1])).join(' ')} fill={PINK} stroke={PINKEDGE} strokeWidth="1" strokeLinejoin="round" />)}
        <polygon points={tvs.map(v => P(v[0], v[1])).join(' ')} fill={BLUEFILL} stroke={BLUE} strokeWidth="2.4" strokeLinejoin="round" />
        <text x={X(c / 2)} y={Y(c / 2) + 9} textAnchor="middle" className="fig-area" fontSize="26">c²</text>
        {labels && <text x={(X(a) + X(c)) / 2 + 10} y={(Y(0) + Y(a)) / 2 + 16} className="fig-vlab" fontSize="15" fill={BLUE} fontWeight="700">c</text>}
      </g>;
      scene = <g key={mode} className="scene-pop">
        {gridSplit}{tiltSplit}
        <polygon points={[P(0, 0), P(c, 0), P(c, c), P(0, c)].join(' ')} fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinejoin="round" />
        {labels && <>
          <path d={braceH(X(0), X(a), Y(0), 8, 1)} className="fig-brace" />
          <text x={X(a / 2)} y={Y(0) + 34} textAnchor="middle" className="fig-vlab" fontSize="15" fill={RED} fontWeight="700">a = {ia}</text>
          <path d={braceH(X(a), X(c), Y(0), 8, 1)} className="fig-brace" />
          <text x={X(a + b / 2)} y={Y(0) + 34} textAnchor="middle" className="fig-vlab" fontSize="15" fill="#2f4bce" fontWeight="700">b = {ib}</text>
        </>}
      </g>;
    }

    return (
      <div ref={hostRef} className="lp-graph-host">
        <svg ref={gRef} className="lp-graph" viewBox={`0 0 ${w} ${h}`} width={w} height={h}
          onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <g>{grid}</g><g>{ticks}</g>
          {scene}
        </svg>
      </div>
    );
  }

  Object.assign(window, { LessonGraph });
})();
