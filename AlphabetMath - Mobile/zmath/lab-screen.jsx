/* Lab spotlight screen — React port of the Design Lab study's matured
   "Spotlight — flat cartridges" screen (Composed material, Title+Desc meta,
   live chrome). Markup, geometry and behavior mirror the study 1:1:
   980×612 canvas, vertical cartridge rail (86px minis, 178px selected,
   14px gap), ghost art bleeding off the bottom-right, side metadata,
   corner button chrome, arrow-key navigation, open pulse.
   App wiring: data comes from ZMATH_PROJECTS (data.js); opening the
   selected cartridge calls onOpen({type:'project', data}) — the real modal.
   Styles: lab.css (scoped under .lab-spot). */
import React from "react";
import { ZMATH_PROJECTS, ZMATH_TByID } from "./data.js";
import { ZMATH_COMPOSED } from "./tile-covers.js";
const { useState: uS, useEffect: uE, useLayoutEffect: uLE, useRef: uR } = React;

/* Study art constants per topic (verbatim from the Design Lab study):
   ink   — topic ink for ghost tint + details-card eyebrow
   deep  — deep r,g,b for cartridge frame hairline + pick outline
   label / eyebrow — composed cover text colors (baked in the study defs) */
const LAB_ART = {
  geometry: { ink: '#bd5410', deep: '150,60,12',  label: '#bd5410', eyebrow: 'rgba(189,84,16,0.62)' },
  algebra:  { ink: '#b51f57', deep: '110,20,55',  label: '#b51f57', eyebrow: 'rgba(181,31,87,0.62)' },
  linalg:   { ink: '#2a3db0', deep: '25,38,120',  label: '#2a3db0', eyebrow: 'rgba(42,61,176,0.62)' },
  numberth: { ink: '#0e7d64', deep: '8,95,75',    label: '#0e8268', eyebrow: 'rgba(14,130,104,0.62)' },
  calculus: { ink: '#b0730f', deep: '140,90,10',  label: '#b0730f', eyebrow: 'rgba(176,115,15,0.62)' },
  prob:     { ink: '#5e2ba6', deep: '74,30,120',  label: '#5e2ba6', eyebrow: 'rgba(94,43,166,0.62)' },
  analysis: { ink: '#c4441f', deep: '150,45,18',  label: '#c4441f', eyebrow: 'rgba(196,68,31,0.62)' },
};
/* Phase 3c: rail art now comes from the composed Design Tile set (tile-covers.js,
   defs injected globally on import). Selected cart uses the cart-composed def
   (words baked in); minis + ghosts use the wordless art def underneath it. */
const COMPOSED_ART_ONLY = {
  algebra: '#alg-rc2-cover', geometry: '#geo-cart-cover', calculus: '#cal-cover',
  linalg: '#la-spiral-cover', numberth: '#nt-cover', prob: '#prob-cover',
  analysis: '#an-cover', logic: '#lg-cover',
};

/* geometry's composed art reads stroke vars; the selected cart bolds them
   (same override the study's geo-cart-composed def carried). */
const GEO_BOLD = '--gs:rgba(224,112,42,0.9);--gst:rgba(232,130,62,0.82);--gw:2.6;';

/* rail geometry — study-exact */
const RAIL = { sm: 96, bg: 196, gap: 14 };

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ---- cover builders (string SVG, mirroring the study's helpers) -------- */
/* LA spiral sits with its tail off to one side, reading as a tilt. Rotate the
   wordless art about center to seat the spiral more symmetrically (Lab minis +
   ghost). The selected cart keeps the upright baked-word composition. */
const LA_SPIN = 'rotate(-55 100 100)';
function cartCoverSvg(p) {
  /* selected cartridge: composed cart def — art + "INTERACTIVE DEMO / title" baked in */
  const style = p.topic === 'geometry' ? ' style="' + GEO_BOLD + '"' : '';
  return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<use href="' + ZMATH_COMPOSED[p.topic].cart + '"' + style + '></use></svg>';
}
function miniCoverSvg(p) {
  /* unselected cartridge: cropped composed art, no words */
  const art = LAB_ART[p.topic];
  const extra = p.topic === 'geometry' ? GEO_BOLD : '';
  const tf = p.topic === 'linalg' ? ' transform="' + LA_SPIN + '"' : '';
  return '<svg viewBox="14 14 172 172" preserveAspectRatio="xMidYMid slice" aria-hidden="true"' +
    ' style="' + extra + 'color:rgb(' + hex2rgb(art.ink) + ')"><use href="' + COMPOSED_ART_ONLY[p.topic] + '"' + tf + '></use></svg>';
}
function ghostSvg(p) {
  /* ghost = same composed art as the cartridge, all topics (geometry included);
     geometry's dotted circles get a visibility boost here only */
  const tf = p.topic === 'linalg' ? ' transform="' + LA_SPIN + '"' : '';
  const style = p.topic === 'geometry' ? ' style="' + GEO_BOLD + '--gdot1:rgba(224,112,42,0.72);--gdot2:rgba(224,112,42,0.65);"' : '';
  return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"' + style + '><use href="' + COMPOSED_ART_ONLY[p.topic] + '"' + tf + '></use></svg>';
}

/* rail column offset so the selected cartridge sits at mid-screen */
function colOffset(selIdx, midY) {
  let y = 0, c = 0;
  for (let i = 0; i < ZMATH_PROJECTS.length; i++) {
    const h = i === selIdx ? RAIL.bg : RAIL.sm;
    if (i === selIdx) c = y + h / 2;
    y += h + RAIL.gap;
  }
  return midY - c;
}

export function LabSpotlight({ onOpen }) {
  const [selId, setSelId] = uS('p7'); /* boot on the BOTTOM-MOST cartridge (Riemann sum) — user browses upward; Lab only */
  const [ringOn, setRingOn] = uS(true); /* Lab shows the selection ring on arrival */
  const [dOpen, setDOpen] = uS(false);
  const [fit, setFit] = uS({ scale: 1, cw: 980, ch: 612 });
  const stageRef = uR(null);
  const scrRef = uR(null);

  const selIdx = Math.max(0, ZMATH_PROJECTS.findIndex((p) => p.id === selId));
  const sel = ZMATH_PROJECTS[selIdx];
  const selTopic = ZMATH_TByID[sel.topic];
  const selArt = LAB_ART[sel.topic];

  /* fill the tray area: scale the 980×612 design so it covers, then stretch
     the logical canvas to w/scale × h/scale so the frame matches the tray
     footprint exactly (same as the mosaic .tile-tray). */
  uLE(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (w <= 0 || h <= 0) return;
      const scale = Math.min(w / 980, h / 612);
      setFit({ scale, cw: w / scale, ch: h / scale });
    };
    measure();
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { scale, cw, ch } = fit;

  /* arrow keys move the selection (study behavior), wrapping; Enter opens */
  uE(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') { openSel(); return; }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) < 0) return;
      e.preventDefault();
      setRingOn(true);
      const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
      setSelId((id) => {
        const j = Math.max(0, ZMATH_PROJECTS.findIndex((p) => p.id === id));
        return ZMATH_PROJECTS[(j + (back ? -1 : 1) + ZMATH_PROJECTS.length) % ZMATH_PROJECTS.length].id;
      });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selId]);

  const pulseSel = () => {
    const el = scrRef.current && scrRef.current.querySelector('.ptile.sel');
    if (!el) return;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
    el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
  };
  const openSel = () => { pulseSel(); onOpen({ type: 'project', data: sel }); };
  const onTile = (p) => { setRingOn(true); if (p.id === selId) openSel(); else setSelId(p.id); };

  return (
    <div className="lab-stage" ref={stageRef}>
      <div className="heroScale" style={{ width: cw * scale, height: ch * scale }}>
        <div className="scr" ref={scrRef} data-screen-label="Lab — Spotlight tray"
             data-layout="cart-flat" data-ghost="bold" data-chrome="live" data-knot="composed" data-ring={ringOn ? 'on' : 'off'}
             style={{ transform: 'scale(' + scale + ')', width: cw + 'px', height: ch + 'px' }}>
          <div className="ghost" dangerouslySetInnerHTML={{ __html: ghostSvg(sel) }}></div>
          <div className="railv">
            <div className="railcol" style={{ transform: 'translateY(' + colOffset(selIdx, ch / 2).toFixed(1) + 'px)' }}>
              {ZMATH_PROJECTS.map((p, i) => {
                const on = i === selIdx;
                const h = on ? RAIL.bg : RAIL.sm;
                const topic = ZMATH_TByID[p.topic];
                const art = LAB_ART[p.topic];
                return (
                  <div key={p.id} className={'ptile cart fc' + (on ? ' sel' : '')} data-id={p.id}
                       onClick={() => onTile(p)}
                       style={{ '--c1': topic.grad[0], '--c2': topic.grad[1], '--deep': art.deep,
                                width: Math.round(h * 1.9) + 'px', height: h + 'px' }}>
                    <span className="pring"></span>
                    <div className="pcard">
                      <div className="coverwrap" dangerouslySetInnerHTML={{ __html: on ? cartCoverSvg(p) : miniCoverSvg(p) }}></div>
                    </div>
                    <span className="psym"><span>{topic.sym}</span></span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="meta">
            <div className="m-title">{sel.title}</div>
            <div className="m-pills"><span className="spill">Kind: <b>{sel.kind + ' · ' + sel.year}</b></span></div>
            <p className="m-desc">{sel.desc}</p>
          </div>
          <div className="cch r">
            <button className="cbtn act" type="button" onClick={openSel}><span className="g">A</span>Open</button>
            <button className={'cbtn act' + (dOpen ? ' on' : '')} type="button"
                    onClick={() => setDOpen((o) => !o)}><span className="g">{'\u2212'}</span>Details</button>
          </div>
          <div className={'dcard' + (dOpen ? ' open' : '')}>
            <div className="d-eyebrow" style={{ '--ink': selArt.ink }}>{selTopic.name + ' \u00B7 ' + sel.kind + ' \u00B7 ' + sel.year}</div>
            <p className="d-body">{sel.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
