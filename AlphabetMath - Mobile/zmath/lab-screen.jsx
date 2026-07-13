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
import { LabScenes } from "./lab-scenes.js";
import { LAB_COVER_DEFS, LAB_COVER_IDS } from "./lab-cover-art.js";
const { useState: uS, useEffect: uE, useRef: uR } = React;

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
/* geometry's composed art reads stroke vars; the selected cart bolds them
   (same override the study's geo-cart-composed def carried). */
const GEO_BOLD = '--gs:rgba(224,112,42,0.9);--gst:rgba(232,130,62,0.82);--gw:2.6;';

/* rail geometry — study-exact */
const RAIL = { sm: 96, bg: 196, gap: 14 };

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ---- cover builders (string SVG, mirroring the study's helpers) -------- */
function cartCoverSvg(p) {
  /* selected cartridge: composed ink art + words living inside the drawing */
  const art = LAB_ART[p.topic];
  const eyebrow = 'INTERACTIVE DEMO';
  const title = esc(p.title);
  const useEl = p.topic === 'geometry'
    ? '<use href="#' + LAB_COVER_IDS[p.topic] + '" style="' + GEO_BOLD + '"></use>'
    : '<use href="#' + LAB_COVER_IDS[p.topic] + '"></use>';
  const t = (y, f, fill, casing) =>
    '<text x="8" y="' + y + '" style="font:' + f + '" fill="' + fill + '"' +
    (casing ? ' stroke="#fff" stroke-width="2.6" stroke-linejoin="round"' : '') + '>';
  const fEye = '800 6.55px var(--font-ui);letter-spacing:0.65px';
  const fTitle = '700 11.7px var(--font-display);letter-spacing:-0.12px';
  return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    useEl +
    t('130.1', fEye, '#fff', true) + eyebrow + '</text>' +
    t('143.7', fTitle, '#fff', true) + title + '</text>' +
    t('130.1', fEye, art.eyebrow, false) + eyebrow + '</text>' +
    t('143.7', fTitle, art.label, false) + title + '</text>' +
    '</svg>';
}
function miniCoverSvg(p) {
  /* unselected cartridge: cropped composed art, no words */
  const art = LAB_ART[p.topic];
  const extra = p.topic === 'geometry' ? GEO_BOLD : '';
  return '<svg viewBox="14 14 172 172" preserveAspectRatio="xMidYMid slice" aria-hidden="true"' +
    ' style="' + extra + 'color:rgb(' + hex2rgb(art.ink) + ')"><use href="#' + LAB_COVER_IDS[p.topic] + '"></use></svg>';
}
function ghostSvg(p) {
  /* geometry keeps its quiet classic line-art ghost even in composed */
  if (p.topic !== 'geometry')
    return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#' + LAB_COVER_IDS[p.topic] + '"></use></svg>';
  return LabScenes.svg(ZMATH_TByID[p.topic].scene, hex2rgb(LAB_ART[p.topic].ink), false);
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
  const [selId, setSelId] = uS('p1'); /* boot on Knot Atlas, as before */
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
  uE(() => {
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

  /* arrow keys move the selection (study behavior), wrapping */
  uE(() => {
    const onKey = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) < 0) return;
      e.preventDefault();
      const back = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
      setSelId((id) => {
        const j = Math.max(0, ZMATH_PROJECTS.findIndex((p) => p.id === id));
        return ZMATH_PROJECTS[(j + (back ? -1 : 1) + ZMATH_PROJECTS.length) % ZMATH_PROJECTS.length].id;
      });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const pulseSel = () => {
    const el = scrRef.current && scrRef.current.querySelector('.ptile.sel');
    if (!el) return;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
    el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
  };
  const openSel = () => { pulseSel(); onOpen({ type: 'project', data: sel }); };
  const onTile = (p) => { if (p.id === selId) openSel(); else setSelId(p.id); };

  return (
    <div className="lab-stage" ref={stageRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: LAB_COVER_DEFS }}></defs>
      </svg>
      <div className="heroScale" style={{ width: cw * scale, height: ch * scale }}>
        <div className="scr" ref={scrRef} data-screen-label="Lab — Spotlight tray"
             data-layout="cart-flat" data-ghost="bold" data-chrome="live" data-knot="composed"
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
          <div className="cch l">
            <button className="cbtn" type="button"><span className="g">B</span>Back</button>
            <button className={'cbtn act' + (dOpen ? ' on' : '')} type="button"
                    onClick={() => setDOpen((o) => !o)}><span className="g">{'\u2212'}</span>Details</button>
          </div>
          <div className="cch r">
            <button className="cbtn act" type="button" onClick={openSel}><span className="g">A</span>Open</button>
            <button className="cbtn" type="button"><span className="g">+</span>Menu</button>
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
