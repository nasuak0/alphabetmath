/* Zmath · Slope Machine — a "manipulative" interactive.
   Drag two points on the plane; a slope triangle redraws live and the
   rise/run ratio stays put. Toggle the staircase to see every slope
   triangle on a line is similar. (Illustrative Mathematics Gr.8, Units 2–3.)
   Renders into #root. Depends on window.Icon (icons.jsx). */
const { useState, useRef, useCallback } = React;

/* ---- plane geometry ---- */
const M = 34, U = 44;            // margin px, px per unit
const XMIN = -1, YMIN = -1;
const VW = 620, VH = 472;
const XMAX = XMIN + Math.floor((VW - 2 * M) / U);   // 12 -> 11
const YMAX = YMIN + Math.floor((VH - 2 * M) / U);   // 8  -> 7
const sx = (x) => M + (x - XMIN) * U;
const sy = (y) => VH - M - (y - YMIN) * U;

const COL = { run: '#3147bc', rise: '#c2326b', line: '#2a3db0', grid: '#e9edf6', axis: '#c5ccdb', ghost: 'rgba(49,71,188,0.16)' };

function clientToMath(svg, e) {
  const r = svg.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width * VW;
  const py = (e.clientY - r.top) / r.height * VH;
  const x = Math.round((px - M) / U + XMIN);
  const y = Math.round((VH - M - py) / U + YMIN);
  return { x, y };
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* greatest common divisor for reducing the slope fraction */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

function SlopeMachine() {
  const [A, setA] = useState({ x: 2, y: 1 });
  const [B, setB] = useState({ x: 7, y: 4 });
  const [stairs, setStairs] = useState(true);
  const svgRef = useRef(null);
  const drag = useRef(null);

  const run = B.x - A.x, rise = B.y - A.y;
  const slope = run !== 0 ? rise / run : null;

  const move = useCallback((e) => {
    const which = drag.current; if (!which) return;
    const p = clientToMath(svgRef.current, e);
    const nx = clamp(p.x, XMIN + 1, XMAX), ny = clamp(p.y, YMIN + 1, YMAX);
    const other = which === 'A' ? B : A;
    if (nx === other.x) return;               // forbid vertical (undefined slope)
    (which === 'A' ? setA : setB)({ x: nx, y: ny });
  }, [A, B]);
  const down = (which) => (e) => {
    e.preventDefault(); drag.current = which;
    svgRef.current.setPointerCapture(e.pointerId);
  };
  const up = (e) => { drag.current = null; try { svgRef.current.releasePointerCapture(e.pointerId); } catch (_) {} };

  const randomize = () => {
    let a, b;
    do { a = { x: rnd(XMIN + 1, XMAX), y: rnd(YMIN + 1, YMAX) }; b = { x: rnd(XMIN + 1, XMAX), y: rnd(YMIN + 1, YMAX) }; }
    while (a.x === b.x);
    setA(a); setB(b);
  };
  const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  /* line extended across the visible plane */
  const m = slope, bIntercept = A.y - (m ?? 0) * A.x;
  const lx1 = XMIN, ly1 = m * lx1 + bIntercept;
  const lx2 = XMAX, ly2 = m * lx2 + bIntercept;

  /* staircase: unit-run similar triangles walking along the line */
  const stepDir = run > 0 ? 1 : -1;
  const stairTris = [];
  if (stairs && m != null) {
    for (let k = -3; k <= 6; k++) {
      const x0 = A.x + k * stepDir;
      const x1 = x0 + stepDir;
      if (x0 < XMIN || x1 > XMAX) continue;
      const y0 = m * x0 + bIntercept, y1 = m * x1 + bIntercept;
      if (Math.min(y0, y1) < YMIN || Math.max(y0, y1) > YMAX) continue;
      stairTris.push({ x0, y0, x1, y1 });
    }
  }

  /* readable slope fraction */
  let frac = '—';
  if (m != null) { const g = gcd(rise, run) || 1; const rr = rise / g, rn = run / g; frac = rn < 0 ? `${-rr}/${-rn}` : `${rr}/${rn}`; }

  return (
    <div className="lab">
      <div className="lab-bar">
        <a className="lab-back" href="index.html"><Icon name="chevron" size={17} sw={2.4} style={{ transform: 'rotate(180deg)' }} />Interactives</a>
        <div className="lab-id">
          <span className="lab-badge" style={{ '--b1': '#5b8def', '--b2': '#3147bc', '--bglow': 'rgba(49,71,188,0.4)' }}><span>La</span></span>
          <div><div className="eyebrow">Linear Relationships · Foundations</div><h1>The Slope Machine</h1></div>
        </div>
        <span className="lab-tag"><span className="dot" style={{ '--tag-dot': '#3147bc', '--tag-dot-h': 'rgba(49,71,188,0.18)' }}></span>Manipulative</span>
      </div>

      <p className="lab-lede">Slope is just <b>steepness</b> — how far you climb for every step across.
        Drag the two points and watch the <b>rise over run</b> ratio. Turn on the staircase to see the
        secret: <b>every slope triangle on the same line is the same shape.</b></p>

      <div className="demo">
        <div className="demo-split">
          <div className="stage-surface">
            <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
              {/* grid */}
              <g>
                {range(XMIN, XMAX).map(x => <line key={'gx' + x} x1={sx(x)} y1={sy(YMIN)} x2={sx(x)} y2={sy(YMAX)} stroke={COL.grid} strokeWidth="1" />)}
                {range(YMIN, YMAX).map(y => <line key={'gy' + y} x1={sx(XMIN)} y1={sy(y)} x2={sx(XMAX)} y2={sy(y)} stroke={COL.grid} strokeWidth="1" />)}
                {/* axes */}
                <line x1={sx(XMIN)} y1={sy(0)} x2={sx(XMAX)} y2={sy(0)} stroke={COL.axis} strokeWidth="1.75" />
                <line x1={sx(0)} y1={sy(YMIN)} x2={sx(0)} y2={sy(YMAX)} stroke={COL.axis} strokeWidth="1.75" />
                {range(XMIN, XMAX).filter(x => x !== 0).map(x => <text key={'tx' + x} x={sx(x)} y={sy(0) + 15} textAnchor="middle" className="ax-num">{x}</text>)}
                {range(YMIN, YMAX).filter(y => y !== 0).map(y => <text key={'ty' + y} x={sx(0) - 9} y={sy(y) + 4} textAnchor="end" className="ax-num">{y}</text>)}
              </g>

              {/* staircase of similar triangles */}
              {stairTris.map((t, i) => (
                <g key={'st' + i}>
                  <polygon points={`${sx(t.x0)},${sy(t.y0)} ${sx(t.x1)},${sy(t.y0)} ${sx(t.x1)},${sy(t.y1)}`}
                    fill={COL.ghost} stroke="rgba(49,71,188,0.34)" strokeWidth="1.25" strokeLinejoin="round" />
                </g>
              ))}

              {/* the line */}
              <line x1={sx(lx1)} y1={sy(ly1)} x2={sx(lx2)} y2={sy(ly2)} stroke={COL.line} strokeWidth="3" strokeLinecap="round" opacity="0.85" />

              {/* primary slope triangle A→B */}
              <line x1={sx(A.x)} y1={sy(A.y)} x2={sx(B.x)} y2={sy(A.y)} stroke={COL.run} strokeWidth="4" strokeLinecap="round" />
              <line x1={sx(B.x)} y1={sy(A.y)} x2={sx(B.x)} y2={sy(B.y)} stroke={COL.rise} strokeWidth="4" strokeLinecap="round" />
              <text x={(sx(A.x) + sx(B.x)) / 2} y={sy(A.y) + (rise > 0 ? 20 : -10)} textAnchor="middle" className="leg-lbl" fill={COL.run}>run {Math.abs(run)}</text>
              <text x={sx(B.x) + 10} y={(sy(A.y) + sy(B.y)) / 2 + 4} className="leg-lbl" fill={COL.rise}>rise {rise}</text>

              {/* draggable handles */}
              {[['A', A], ['B', B]].map(([k, P]) => (
                <g key={k} className="handle" onPointerDown={down(k)} style={{ cursor: 'grab' }}>
                  <circle cx={sx(P.x)} cy={sy(P.y)} r="16" fill="transparent" />
                  <circle cx={sx(P.x)} cy={sy(P.y)} r="8.5" fill="#fff" stroke={COL.line} strokeWidth="3" />
                  <text x={sx(P.x)} y={sy(P.y) - 15} textAnchor="middle" className="pt-lbl">{k} ({P.x}, {P.y})</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="panel">
            <div className="panel-card">
              <div className="panel-eyebrow">Live readout</div>
              <div className="readouts">
                <span className="readout"><span className="lbl">rise</span><span className="val" style={{ color: COL.rise }}>{rise > 0 ? '+' : ''}{rise}</span></span>
                <span className="readout"><span className="lbl">run</span><span className="val" style={{ color: COL.run }}>{run > 0 ? '+' : ''}{run}</span></span>
              </div>
              <div className="readouts" style={{ marginTop: 9 }}>
                <span className="readout accent big" style={{ '--accent-soft': 'rgba(49,71,188,0.10)', '--accent-ink': COL.line }}>
                  <span className="lbl">slope m</span><span className="val">{frac}{m != null ? ` = ${(+m.toFixed(2))}` : ''}</span>
                </span>
              </div>
              <p style={{ marginTop: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--wii-ink)' }}>
                y = {m != null ? trim(m) : '?'}x {bIntercept >= 0 ? '+ ' + trim(bIntercept) : '− ' + trim(-bIntercept)}
              </p>
            </div>

            <div className="panel-card">
              <div className={'toggle' + (stairs ? ' on' : '')} onClick={() => setStairs(s => !s)} role="switch" aria-checked={stairs}>
                <span className="tx">Stack similar triangles</span>
                <span className="switch"></span>
              </div>
              <p style={{ marginTop: 10 }}>Each step is a <b style={{ color: COL.run }}>run of 1</b>. The rise of every
                little triangle equals the slope — so they're all the <b>same shape</b>, just smaller copies. That's why slope never changes along a line.</p>
            </div>

            <div className="btn-row">
              <button className="btn btn-primary" onClick={randomize}><Icon name="sparkle" size={16} stroke="#fff" sw={2} />New line</button>
              <button className="btn btn-ghost" onClick={() => { setA({ x: 2, y: 1 }); setB({ x: 7, y: 4 }); }}>Reset</button>
            </div>
            <div className="hint"><Icon name="shapes" size={15} sw={2} />Drag point A or B anywhere on the grid.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }
function trim(v) { return (+v.toFixed(2)).toString(); }

ReactDOM.createRoot(document.getElementById('root')).render(<SlopeMachine />);
