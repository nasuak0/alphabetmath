/* The figure, rewired: it keeps NO numbers of its own. It shows the notebook's
   (p, q) and edits them. Drawing lifted from interactives/kit-directions.jsx. */
(function () {
  const NAVY = '#26345f', BLUE = '#3a5694', RED = '#bf3535', GRID = '#c3cde2';
  const BLUEFILL = 'rgba(74,110,190,0.16)';
  const PINK = 'rgba(226,138,166,0.40)', PINKEDGE = 'rgba(191,53,53,0.28)';
  const VB = { w: 360, h: 340 }, u = 30, O = [90, 186], MAXP = 4, MAXQ = 4;

  function geo(p, q) {
    const L = (p + q) * u;
    const P = [O[0] + p * u, O[1] - q * u];
    const Q = [O[0] + (p + q) * u, O[1] + (p - q) * u];
    const R = [O[0] + q * u, O[1] + p * u];
    const TL = [O[0], O[1] - q * u], TR = [O[0] + L, O[1] - q * u];
    const BR = [O[0] + L, O[1] + p * u], BL = [O[0], O[1] + p * u];
    return { O, P, Q, R, TL, TR, BR, BL, tris: [[TL, P, O], [TR, Q, P], [BR, R, Q], [BL, O, R]] };
  }
  const ptsOf = (...a) => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const cen = (t) => [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
  const Sup = ({ children }) => <sup className="nb-sup">{children}</sup>;
  const Radical = ({ children }) => (
    <span className="nb-sqrt">
      <svg className="nb-sqrt-sign" viewBox="0 0 10 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,12 L3.4,19.6 L10,0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="nb-sqrt-body">{children}</span>
    </span>
  );
  const RadExp = ({ children }) => (
    <span className="nb-pow">({children})<sup className="nb-sup nb-halfexp"><span className="nb-dfrac"><span className="nb-dfn">1</span><span className="nb-dfsl">/</span><span className="nb-dfd">2</span></span></sup></span>
  );
  const braceH = (x1, x2, edgeY, h, dir = -1) => {
    const xm = (x1 + x2) / 2, tipY = edgeY + dir * 4, my = tipY + dir * h / 2, sy = tipY + dir * h;
    return `M${x1},${tipY} Q${x1},${my} ${(x1 + xm) / 2},${my} Q${xm},${my} ${xm},${sy} Q${xm},${my} ${(xm + x2) / 2},${my} Q${x2},${my} ${x2},${tipY}`;
  };
  const braceV = (edgeX, y1, y2, w, dir = -1) => {
    const ym = (y1 + y2) / 2, tipX = edgeX + dir * 4, mx = tipX + dir * w / 2, sx = tipX + dir * w;
    return `M${tipX},${y1} Q${mx},${y1} ${mx},${(y1 + ym) / 2} Q${mx},${ym} ${sx},${ym} Q${mx},${ym} ${mx},${(ym + y2) / 2} Q${mx},${y2} ${tipX},${y2}`;
  };
  function gridLines(lx0, lx1, ly0, ly1) {
    const out = [];
    const xs = Math.floor((lx0 - O[0]) / u) * u + O[0], ys = Math.floor((ly0 - O[1]) / u) * u + O[1];
    let k = 0;
    for (let x = xs; x <= lx1; x += u, k++) out.push(<line key={'v' + k} x1={x} y1={ly0} x2={x} y2={ly1} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" />);
    k = 0;
    for (let y = ys; y <= ly1; y += u, k++) out.push(<line key={'h' + k} x1={lx0} y1={y} x2={lx1} y2={y} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" />);
    return out;
  }

  function NBFigure({ expanded = false, braceSide = 'OP' }) {
    const { v, set, disp } = useNotebook();
    const [showTrap, setShowTrap] = React.useState(true);
    const [dragging, setDragging] = React.useState(false);
    const gRef = React.useRef(null), drag = React.useRef(false);

    const toLattice = (e) => {
      const grp = gRef.current; if (!grp) return null;
      const m = grp.getScreenCTM(); if (!m) return null;
      const pt = grp.ownerSVGElement.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const l = pt.matrixTransform(m.inverse());
      return { p: Math.max(1, Math.min(MAXP, Math.round((l.x - O[0]) / u))),
               q: Math.max(0, Math.min(MAXQ, Math.round((O[1] - l.y) / u))) };
    };
    const onDown = (e) => { drag.current = true; setDragging(true); e.target.setPointerCapture?.(e.pointerId); const t = toLattice(e); if (t) set(t); };
    const onMove = (e) => { if (!drag.current) return; const t = toLattice(e); if (t) set(t); };
    const onUp = () => { drag.current = false; setDragging(false); };

    const g = geo(disp.p, disp.q);
    const pinLocal = dragging ? [O[0] + v.p * u, O[1] - v.q * u] : g.P;
    const perfect = v.q === 0;
    const areaInt = v.p * v.p + v.q * v.q;
    const triRoom = v.p >= 1 && v.q >= 1 && v.p * u >= 26 && v.q * u >= 26;
    const cx4 = (g.O[0] + g.P[0] + g.Q[0] + g.R[0]) / 4, cy4 = (g.O[1] + g.P[1] + g.Q[1] + g.R[1]) / 4;
    const verts = [[g.O, [0, 0]], [pinLocal, [v.p, v.q]], [g.Q, [v.p + v.q, v.q - v.p]], [g.R, [v.q, -v.p]]];
    const M = 40, S = (VB.h / 2) / ((MAXP + MAXQ) * u / 2 + M);
    const tx = VB.w / 2 - S * (O[0] + u * (disp.p + disp.q) / 2);
    const ty = VB.h / 2 - S * (O[1] + u * (disp.p - disp.q) / 2);
    const xform = `translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${S.toFixed(4)})`;
    const lx0 = -tx / S, lx1 = (VB.w - tx) / S, ly0 = -ty / S, ly1 = (VB.h - ty) / S;

    return (
      <div className={'nb-kit' + (expanded ? ' nb-kit--full' : '')}>
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="nb-svg" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <defs>
            <filter id="nbPinShadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#26345f" floodOpacity="0.35" />
            </filter>
          </defs>
          <g ref={gRef} transform={xform}>
            <g opacity="0.85">{gridLines(lx0, lx1, ly0, ly1)}</g>
            {!perfect && showTrap && g.tris.map((t, i) => {
              const c = cen(t);
              return (
                <g key={i}>
                  <polygon points={ptsOf(...t)} fill={PINK} stroke={PINKEDGE} strokeWidth="1" strokeLinejoin="round" />
                  {triRoom && <text x={c[0]} y={c[1] + 4} className="nb-trilab" textAnchor="middle">&frac12;pq</text>}
                </g>
              );
            })}
            {!perfect && showTrap && <polygon points={ptsOf(g.TL, g.TR, g.BR, g.BL)} fill="none" stroke={NAVY} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />}
            {!perfect && (braceSide === 'OP' || braceSide === 'both') && <>
              <path d={braceH(g.TL[0], g.P[0], g.TL[1], 7, -1)} className="nb-brace nb-b-p" fill="none" />
              <text x={(g.TL[0] + g.P[0]) / 2} y={g.TL[1] - 17} className="nb-bracelab nb-b-p" textAnchor="middle">p = {v.p}</text>
              <path d={braceV(g.TL[0], g.TL[1], g.O[1], 7, -1)} className="nb-brace nb-b-q" fill="none" />
              <text x={g.TL[0] - 17} y={(g.TL[1] + g.O[1]) / 2 + 4} className="nb-bracelab nb-b-q" textAnchor="end">q = {v.q}</text>
            </>}
            <polygon points={ptsOf(g.O, g.P, g.Q, g.R)} fill={BLUEFILL} stroke={BLUE} strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx={g.O[0]} cy={g.O[1]} r="3.5" fill={NAVY} />
            <g onPointerDown={onDown} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
              <circle cx={pinLocal[0]} cy={pinLocal[1]} r="16" fill="transparent" />
              <circle cx={pinLocal[0]} cy={pinLocal[1]} r={dragging ? 6.5 : 5.5} fill={RED} stroke="#fff" strokeWidth="2" filter="url(#nbPinShadow)" style={{ transition: 'r .12s' }} />
            </g>
            {verts.map(([pos, c], i) => {
              let ox, oy, anchor;
              if (i === 1) { ox = pos[0] + 15; oy = pos[1] - 7; anchor = 'start'; }
              else {
                const dx = pos[0] - cx4, dy = pos[1] - cy4, len = Math.hypot(dx, dy) || 1;
                ox = pos[0] + dx / len * 15; oy = pos[1] + dy / len * 15 + 4;
                anchor = dx > 6 ? 'start' : dx < -6 ? 'end' : 'middle';
              }
              return (
                <g key={'v' + i}>
                  {i !== 1 && <circle cx={pos[0]} cy={pos[1]} r="2.6" fill={NAVY} />}
                  <text x={ox} y={oy} textAnchor={anchor} className="nb-vlab">({c[0]}, {c[1]})</text>
                </g>
              );
            })}
          </g>
          {perfect && <text x={VB.w - 12} y={22} className="nb-perfect" textAnchor="end">perfect square &#10003;</text>}
        </svg>

        <div className="nb-panel">
          <div className="nb-slidercard">
            <div className="nb-sliders">
              <label className="nb-var-p">p <input type="range" min="1" max={MAXP} value={v.p} onChange={e => set({ p: +e.target.value })} /><b>{v.p}</b></label>
              <label className="nb-var-q">q <input type="range" min="0" max={MAXQ} value={v.q} onChange={e => set({ q: +e.target.value })} /><b>{v.q}</b></label>
            </div>
            <div className="nb-step"><span className="nb-step-key">Step</span> <i>(p, q)</i> = <b>(<span className="nb-var-p">{v.p}</span>, <span className="nb-var-q">{v.q}</span>)</b></div>
          </div>

          {expanded && <div className="nb-sh-grid">
            <span className="nb-sh-h">Side</span>
            <span className="nb-sh-h">Area</span>
            <div className="nb-sh-rule"></div>
            <span className="nb-sh-f"><Radical>p<Sup>2</Sup>+q<Sup>2</Sup></Radical></span>
            <span className="nb-sh-f">{perfect ? <>(p)<Sup>2</Sup></> : <>(p+q)<Sup>2</Sup> &minus; 4&middot;&frac12;(p)(q)</>}</span>
            <span className="nb-sh-n"><RadExp>{v.p}<Sup>2</Sup>+{v.q}<Sup>2</Sup></RadExp></span>
            <span className="nb-sh-n">{perfect ? <>({v.p})<Sup>2</Sup></> : <>({v.p}+{v.q})<Sup>2</Sup> &minus; 2({v.p})({v.q})</>}</span>
            <span className="nb-sh-v"><RadExp><b>{areaInt}</b></RadExp>{Number.isInteger(Math.sqrt(areaInt)) && <> = <b>{Math.sqrt(areaInt)}</b></>}</span>
            <span className="nb-sh-v"><b>{areaInt}</b></span>
          </div>}

          <button type="button" className="nb-toggle" onClick={() => setShowTrap(t => !t)}>
            <span className="nb-tgl-text">
              <span className="nb-tgl-title">Show the trap</span>
              <span className="nb-tgl-sub">Bounding square &amp; four offcuts</span>
            </span>
            <span className={'nb-switch' + (showTrap ? ' on' : '')}><span /></span>
          </button>
        </div>
      </div>
    );
  }

  Object.assign(window, { NBFigure });
})();
