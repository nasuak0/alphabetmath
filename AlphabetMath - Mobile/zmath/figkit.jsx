/* Zmath interactive-figure kit — "Notebook" direction (warm/tactile).
   Shared primitives for the live inline figures: a red pin handle with a soft
   shadow and a snap-pop, serif-italic equations, pink offcut shading, chunky
   paper controls, and integer-snapping lattice drag. */
import React from "react";

const K = {
    NAVY: '#26345f', BLUE: '#3a5694', RED: '#bf3535', GRID: '#c3cde2',
    GRIDSOFT: '#d6deec', INK: '#2c2420', INK2: '#6a615b', GREEN: '#3f9b73',
    BLUEFILL: 'rgba(74,110,190,0.16)',
    PINKFILL: 'rgba(226,138,166,0.22)',
    REDFILL: 'rgba(191,53,53,0.10)',
    GREENFILL: 'rgba(82,170,132,0.20)',
  };
  K.pts = (...a) => a.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');

  // client coords -> svg-local coords (handles viewBox scaling)
  K.svgLocal = (svg, clientX, clientY) => {
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
    const l = pt.matrixTransform(m.inverse());
    return { x: l.x, y: l.y };
  };

  // increments a key whenever deps change — drives the snap-pop animation
  K.usePop = (deps) => {
    const [pop, setPop] = React.useState(0);
    const first = React.useRef(true);
    React.useEffect(() => {
      if (first.current) { first.current = false; return; }
      setPop(p => p + 1);
    }, deps);
    return pop;
  };

  // ---- the red pin handle (drag target). popKey re-triggers the pop. ----
  K.Pin = function Pin({ x, y, onPointerDown, popKey, r = 8.5, color = K.RED, label }) {
    return (
      <g className="zfig-pinwrap">
        {label != null && <text x={x + r + 6} y={y - r - 2} className="zfig-pinlabel">{label}</text>}
        <g key={popKey} className="zfig-pinpop" style={{ transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r={r + 7} className="zfig-pinhalo" />
          <circle cx={x} cy={y} r={r} fill={color} stroke="#fff" strokeWidth="2.5"
            filter="url(#zfigPinShadow)" style={{ cursor: 'grab' }}
            onPointerDown={onPointerDown} />
        </g>
      </g>
    );
  };

  // shared <defs> (drop shadow for pins) — drop once per svg
  K.PinDefs = function PinDefs() {
    return (
      <defs>
        <filter id="zfigPinShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#26345f" floodOpacity="0.32" />
        </filter>
      </defs>
    );
  };

  // ---- preset "scene" chips (paper buttons) ----
  K.Scenes = function Scenes({ scenes, active, onPick }) {
    return (
      <div className="zfig-scenes">
        {scenes.map((s, i) => (
          <button key={i} type="button"
            className={'zfig-paper' + (active === i ? ' on' : '')}
            onClick={() => onPick(s, i)}>{s.name}</button>
        ))}
      </div>
    );
  };

  // ---- chunky slider row ----
  K.Slider = function Slider({ label, min, max, value, onChange }) {
    return (
      <label className="zfig-slider">
        <span className="zfig-slab">{label}</span>
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(+e.target.value)} />
        <b className="zfig-sval">{value}</b>
      </label>
    );
  };

  // ---- the figure shell: SVG on top, equation, controls below ----
  K.Stage = function Stage({ children, eq, controls, hint }) {
    return (
      <div className="zfig">
        <div className="zfig-stage">{children}</div>
        {eq != null && <div className="zfig-eq">{eq}</div>}
        {controls && <div className="zfig-controls">{controls}</div>}
        {hint && <div className="zfig-hint">{hint}</div>}
      </div>
    );
  };

  export const ZFIGKIT = K;

  // ---- inject the kit stylesheet once ----
  if (!document.getElementById('zfig-kit-css')) {
    const css = `
.zfig{display:flex;flex-direction:column;width:100%;max-width:440px;margin:0 auto;
  --zf-serif:var(--font-serif,Georgia,"Times New Roman",serif);
  --zf-ui:var(--font-ui,"Inter",sans-serif);
  --zf-display:var(--font-display,"Baloo 2","Inter",sans-serif);
  --zf-mono:var(--font-mono,"JetBrains Mono",monospace);}
.zfig-stage{width:100%;}
.zfig-svg{width:100%;height:auto;display:block;touch-action:none;
  -webkit-user-select:none;user-select:none;}
.zfig-pinpop{animation:zfigpop .24s cubic-bezier(.34,1.56,.64,1);}
@keyframes zfigpop{0%{transform:scale(1.55);}55%{transform:scale(.88);}100%{transform:scale(1);}}
@media (prefers-reduced-motion:reduce){.zfig-pinpop{animation:none;}}
.zfig-pinhalo{fill:rgba(191,53,53,0.13);}
.zfig-pinlabel{font-family:var(--zf-serif);font-style:italic;font-weight:600;font-size:14px;fill:#bf3535;}
.zfig-eq{font-family:var(--zf-serif);font-style:italic;font-size:20px;color:#26345f;
  text-align:center;margin:12px 0 4px;text-wrap:balance;line-height:1.35;}
.zfig-eq b{font-style:normal;font-weight:700;color:#bf3535;}
.zfig-eq .zf-ok{color:#3f9b73;}
.zfig-controls{display:flex;flex-direction:column;gap:11px;margin-top:14px;
  padding-top:14px;border-top:1px dashed rgba(38,52,95,0.18);}
.zfig-scenes{display:flex;gap:7px;flex-wrap:wrap;}
.zfig-paper{flex:1 1 0;min-width:54px;font-family:var(--zf-display);font-weight:600;
  font-size:14px;color:#6a615b;background:#fffdf8;border:1.5px solid #e0d5c3;
  border-radius:11px;padding:7px 4px;cursor:pointer;box-shadow:0 1.5px 0 #e0d5c3;
  transition:transform .12s,background .12s,color .12s;}
.zfig-paper:hover{transform:translateY(-1px);color:#26345f;border-color:#cdbfa8;}
.zfig-paper.on{background:#26345f;color:#fff;border-color:#26345f;box-shadow:0 1.5px 0 #1a2543;}
.zfig-slider{display:flex;align-items:center;gap:11px;}
.zfig-slab{font-family:var(--zf-display);font-weight:600;font-size:15px;color:#26345f;
  font-style:italic;width:18px;text-align:center;}
.zfig-slider input[type=range]{flex:1;-webkit-appearance:none;appearance:none;height:7px;
  background:#e6ddcf;border-radius:99px;outline:none;}
.zfig-slider input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;
  border-radius:50%;background:#bf3535;cursor:grab;border:3px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.25);}
.zfig-slider input[type=range]::-moz-range-thumb{width:22px;height:22px;border:3px solid #fff;
  border-radius:50%;background:#bf3535;cursor:grab;box-shadow:0 2px 5px rgba(0,0,0,.25);}
.zfig-sval{font-family:var(--zf-display);font-weight:600;background:#26345f;color:#fff;
  border-radius:7px;padding:2px 0;font-size:14px;min-width:28px;text-align:center;}
.zfig-hint{font-family:var(--zf-ui);font-size:0.8rem;line-height:1.5;color:#6a615b;
  margin-top:10px;display:flex;gap:7px;align-items:flex-start;text-wrap:pretty;}
.zfig-hint::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;
  background:#bf3535;margin-top:6px;}
.zfig-row{display:flex;gap:18px;flex-wrap:wrap;}
.zfig-row .zfig-slider{flex:1 1 130px;}
.zfig-grab text,.zfig-svg text{pointer-events:none;}
`;
    const st = document.createElement('style');
    st.id = 'zfig-kit-css';
    st.textContent = css;
    document.head.appendChild(st);
  }
