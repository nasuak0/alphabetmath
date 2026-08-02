/* Home + Topics trays — React port of the Design Lab study's "Home — shelves"
   and "Topics — grid" screens, 1:1 with the study's cemented look (flat molded
   cartridges, nested corner badges, capsule heads, ghost art). Spec + effective
   cascade values: scraps/port-plan-home-topics.md. Same shell pattern as
   lab-screen.jsx: a 980×612 canvas scaled to cover the tray. Styles: picker.css
   (+ base tile material from lab.css, both scoped under .lab-spot). */
import React from "react";
import { ZMATH_TOPICS, ZMATH_PROJECTS, ZMATH_TByID, ZMATH_PByID } from "./data.js";
import { ZMATH_COMPOSED } from "./tile-covers.js";
const { useState: uS, useEffect: uE, useLayoutEffect: uLE, useRef: uR } = React;

/* study ink/deep per topic (Design Lab data, verbatim) */
const PICKER_ART = {
  algebra:  { ink: '#b51f57', deep: '110,20,55' },
  geometry: { ink: '#bd5410', deep: '150,60,12' },
  calculus: { ink: '#b0730f', deep: '140,90,10' },
  linalg:   { ink: '#2a3db0', deep: '25,38,120' },
  numberth: { ink: '#0e7d64', deep: '8,95,75' },
  prob:     { ink: '#5e2ba6', deep: '74,30,120' },
  analysis: { ink: '#c4441f', deep: '150,45,18' },
  logic:    { ink: '#ad2429', deep: '140,30,36' },
};
const GEO_BOLD = '--gs:rgba(224,112,42,0.9);--gst:rgba(232,130,62,0.82);--gw:2.6;';
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
/* composed art svg — kind: 'tile' (TOPIC 0X + name baked), 'cart' (INTERACTIVE
   DEMO + title baked), 'art' (wordless, for ghosts) */
function artSvg(topicId, kind) {
  const extra = topicId === 'geometry' ? GEO_BOLD : '';
  return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"' +
    ' style="' + extra + 'color:rgb(' + hex2rgb(PICKER_ART[topicId].ink) + ')">' +
    '<use href="' + ZMATH_COMPOSED[topicId][kind] + '"></use></svg>';
}
function clampN(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* open pulse — Lab behavior: pop the selected tile, then open */
function pulseSel(scrRef) {
  const el = scrRef.current && scrRef.current.querySelector('.ptile.sel');
  if (!el) return;
  el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
  el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
}

/* POSTER paper width, in study units. The study drew 980; 1080 is the framing
   that keeps the 5th tile and 4th cartridge cut by the right edge (tile 5 spans
   944–1154, cart 4 spans 940–1224, so a 1080 edge slices both) — the iPad view
   the design was tuned on. Pinning WIDTH (not the whole 980×612 shape) is what
   makes poster scale up on a wide display: the paper always spans the full tray
   like the Lab screen, so scale = trayW / 1080 and every study number rides it. */
const POSTER_W = 1080;
/* vertical floor: two shelves = head (34 + 12 gap) + 184 rail, ×2, + 24 between.
   Below this the shelves would clip, so the fit falls back to height-binding. */
const POSTER_MIN_H = 500;

/* fill the tray: scale the 980×612 design so it covers, stretch the logical
   canvas to the tray footprint (same recipe as lab-screen.jsx) */
function useFit(stageRef, poster) {
  const [fit, setFit] = uS({ scale: 1, cw: 980, ch: 612 });
  uLE(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (w <= 0 || h <= 0) return;
      if (poster) {
        /* POSTER: paper width pinned to POSTER_W, so WIDTH binds the scale and the
           sheet spans the tray edge-to-edge exactly like the Lab screen — no
           gutters. Everything on the paper stays at the study's own size and is
           enlarged by this single scale, so the tiles genuinely grow on a big
           display AND the 5th tile / 4th cartridge still break the right edge.
           The height that falls out is whatever the tray gives: .hwrap centres
           and clips, so a tray proportionally shorter than the study simply
           trims its blank top/bottom margin. */
        const s = Math.min(w / POSTER_W, h / POSTER_MIN_H);
        setFit({ scale: s, cw: w / s, ch: h / s });
        return;
      }
      /* scale up to fill, uncapped — identical to lab-screen.jsx */
      const scale = Math.min(w / 980, h / 612);
      /* STRETCH: the app's own fit — canvas stretched to the tray and --grow
         re-sizing the furniture inside it. Toggled by the "Screen fit" tweak. */
      setFit({ scale, cw: w / scale, ch: h / scale });
    };
    measure();
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    return () => ro.disconnect();
  }, [poster]);
  return fit;
}

/* the study's flat molded tile: gradient rim (::before via .fc), white card,
   composed cover, nested corner badge */
function FlatTile({ t, w, h, sel, art, onClick }) {
  return (
    <div className={'ptile fc' + (sel ? ' sel' : '')} onClick={onClick}
         style={{ '--c1': t.grad[0], '--c2': t.grad[1], '--deep': PICKER_ART[t.id].deep, ...(w ? { width: w + 'px', height: h + 'px' } : {}) }}>
      <span className="pring"></span>
      <div className="pcard"><div className="coverwrap" dangerouslySetInnerHTML={{ __html: art }}></div></div>
      <span className="psym"><span>{t.sym}</span></span>
    </div>
  );
}

/* ---- HOME: two capsule-headed glide shelves on the paper ground ---------- */
const HG_STRETCH = { pad: 24, gap: 16, tW: 207, tH: 154, cW: 279, cH: 154 };
/* POSTER — the Design Lab study's own shelf numbers, verbatim (explore/Design
   Lab.html HG). Used at --grow 1 on the Lab screen's own canvas, so the tiles,
   cartridges, selection ring and badges are all exactly the study's size while
   the paper matches the Lab's width. */
const HG_POSTER = { pad: 40, gap: 16, tW: 210, tH: 162, cW: 284, cH: 162 };
/* CONSOLE PROMOTION — Lab's mechanism: the selected card is handed a REAL bigger
   size (Lab: 96 -> 196), so it inherits lab.css's width/height/padding/radius/badge
   bounce transitions and genuinely shoves its neighbours along the row.
   Ceiling 1.18: the card grows about its lane's centre, so half of
   (162*g*PROMO - 184*g) travels up into the 12px gap between a shelf's capsule
   head and its rail. At 1.18 that overhang is ~4 units, leaving ~8 of air under
   the head; past ~1.18 the growing card starts covering its own header. This is
   a property of the two-shelf layout, not a preference. */
const PROMO = 1.12;
/* GROW: the tray fills the pane, so on a wide screen the logical canvas is
   stretched past the 980 design width. grow spends that surplus on the fixed
   composition instead of leaving it as empty ground. 1 = design size, never less.
   HOME: iPad composition, just bigger — the shelves stay sliding rails (a cut
   right edge is the design, same as on iPad). cw/980 is how far THIS tray is
   stretched past the design width, so it is exactly 1 on the iPad (nothing grows
   there) and ~2 on a wide desktop. Capped by the vertical room: two capsule heads
   (44 + 12 each) + two rails + the 24 gap, plus 24 of slack so the shelves never
   sit flush against the tray edges.
   Ceiling 1.05: match the iPad's tile/cartridge size and only SLIGHTLY grow it to
   suit the wider screen. The tray's own scale (~1.32 on the Dell) already enlarges
   everything; grow is a small extra nudge on top, not a second zoom. At 1.2 the
   tiles rendered ~346px on the Dell, near the Lab hero cartridge; 1.05 puts them
   ~303px, the same family as the Lab rail cartridge.
   CEILING 1.095 — REASON CHANGED. It used to enforce "the Menu demo cartridge must
   never out-size the Lab hero cartridge"; the user retired that rule when Menu got
   its own console promotion, and the promoted cartridge now does exceed Lab's hero
   (294 * 1.095 * PROMO ~= 380 logical units vs Lab's 322) by design. The cap stays
   at 1.095 purely for VERTICAL FIT: two capsule heads (44 + 12) + two rails (184g)
   + the 24 shelf gap must fit 612 and still leave room for the promoted card's
   overhang plus edge slack. Raising it squeezes that overhang, not the look. */
function growHome(cw, ch) {
  return clampN(Math.min(cw / 980, (ch - 160) / 368), 1, 1.095);
}
/* Lab's colOffset, ported to a row: walk the cards summing their REAL widths (the
   promoted one is genuinely wider), find the focused card's centre, then slide the
   row so that centre lands mid-tray. Clamped to the row ends exactly as before.
   promoIdx = -1 when this shelf holds no selection (only one card is ever
   promoted, app-wide — one hero, like Lab). */
function rowShift(count, focusIdx, promoIdx, w, wBig, cw, gap, pad) {
  let x = 0, c = 0;
  for (let i = 0; i < count; i++) {
    const ww = i === promoIdx ? wBig : w;
    if (i === focusIdx) c = x + ww / 2;
    x += ww + gap;
  }
  return clampN(cw / 2 - c, cw - pad - (x - gap), pad);
}
export function HomeTray({ onOpen, fit }) {
  const poster = fit === 'poster';
  const [sel, setSel] = uS({ shelf: 1, key: 'p1' }); /* boot ringed on the Geometric Areas cartridge (Lab arrival rhythm) */
  const [shelf, setShelf] = uS(1);
  const [last, setLast] = uS({ topic: ZMATH_TOPICS[0].id, proj: ZMATH_PROJECTS[0].id });
  const stageRef = uR(null);
  const scrRef = uR(null);
  const { scale, cw, ch } = useFit(stageRef, poster);
  const HG = poster ? HG_POSTER : HG_STRETCH;
  const openItem = (s) => {
    if (!s) return;
    pulseSel(scrRef);
    if (s.shelf === 0) onOpen({ type: 'topic', data: ZMATH_TByID[s.key] });
    else onOpen({ type: 'project', data: ZMATH_PByID[s.key] });
  };
  /* Lab tap rhythm: first tap rings, second tap opens */
  const pick = (sh, key) => () => {
    if (sel && sel.shelf === sh && sel.key === key) { openItem(sel); return; }
    setShelf(sh); setSel({ shelf: sh, key });
    setLast((l) => (sh === 0 ? { ...l, topic: key } : { ...l, proj: key }));
  };
  /* ←/→ move within the shelf, ↑/↓ hop shelves (to the remembered pick), Enter opens */
  uE(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') { openItem(sel); return; }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) < 0) return;
      e.preventDefault();
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const sh = e.key === 'ArrowUp' ? 0 : 1;
        setShelf(sh); setSel({ shelf: sh, key: sh === 0 ? last.topic : last.proj });
        return;
      }
      const back = e.key === 'ArrowLeft';
      if (shelf === 0) {
        const j = Math.max(0, ZMATH_TOPICS.findIndex((t) => t.id === last.topic));
        const id = ZMATH_TOPICS[(j + (back ? -1 : 1) + ZMATH_TOPICS.length) % ZMATH_TOPICS.length].id;
        setSel({ shelf: 0, key: id }); setLast((l) => ({ ...l, topic: id }));
      } else {
        const j = Math.max(0, ZMATH_PROJECTS.findIndex((p) => p.id === last.proj));
        const id = ZMATH_PROJECTS[(j + (back ? -1 : 1) + ZMATH_PROJECTS.length) % ZMATH_PROJECTS.length].id;
        setSel({ shelf: 1, key: id }); setLast((l) => ({ ...l, proj: id }));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sel, shelf, last]);
  const ghostTopic = sel ? (sel.shelf === 0 ? sel.key : ZMATH_PByID[sel.key].topic) : null;
  const g = poster ? 1 : growHome(cw, ch);
  /* DELL-ONLY vertical ease. The two shelves need 498 study units of height
     (41 capsule + 12 gap + 184 rail, twice, + the 24 between). The iPad's paper
     is 568 units tall — 35 units of margin top and bottom. A proportionally
     WIDER tray (the Dell: 2.03 vs the iPad's 1.90) yields a shorter paper — 533
     units — halving that margin to 17, which reads as the Field capsule jammed
     against the top edge. So take the difference out of the card height, but ONLY
     on the trays that are actually short: 1 at the iPad's 568 and above (nothing
     changes there), easing to 0.94 on the widest trays. */
  const vsh = poster ? clampN(ch / 568, 0.94, 1) : 1;
  const tW = Math.round(HG.tW * g), tH = Math.round(HG.tH * g * vsh);
  const cW = Math.round(HG.cW * g), cH = Math.round(HG.cH * g * vsh), gap = Math.round(HG.gap * g), pad = Math.round(HG.pad * g);
  /* POSTER keeps the study's own behaviour: no real-size promotion at all — the
     selected card just gets the 3% transform nudge (picker.css). STRETCH keeps
     the app's console promotion, where the card genuinely grows and shoves its
     neighbours along the row. */
  const promo = poster ? 1 : PROMO;
  const tWs = Math.round(tW * promo), tHs = Math.round(tH * promo);
  const cWs = Math.round(cW * promo), cHs = Math.round(cH * promo);
  const tSel = sel && sel.shelf === 0 ? ZMATH_TOPICS.findIndex((t) => t.id === sel.key) : -1;
  const pSel = sel && sel.shelf === 1 ? ZMATH_PROJECTS.findIndex((p) => p.id === sel.key) : -1;
  const tShift = rowShift(ZMATH_TOPICS.length, Math.max(0, ZMATH_TOPICS.findIndex((t) => t.id === last.topic)), tSel, tW, tWs, cw, gap, pad);
  const cShift = rowShift(ZMATH_PROJECTS.length, Math.max(0, ZMATH_PROJECTS.findIndex((p) => p.id === last.proj)), pSel, cW, cWs, cw, gap, pad);
  return (
    /* TRAY-CONTAINMENT RULE (permanent): tiles are children of .scr, one scaling
       unit with the tray (Lab pattern). Never wrap them in a separate island. */
    <div className="lab-stage" ref={stageRef}>
      <div className="heroScale" style={{ width: cw * scale, height: ch * scale }}>
        <div className="scr" ref={scrRef} data-screen-label="Home — shelves tray" data-layout="home" data-ghost="bold"
             data-screenfit={poster ? 'poster' : 'stretch'}
             style={{ '--grow': g, '--vsh': vsh, transform: 'scale(' + scale + ')', width: cw + 'px', height: ch + 'px' }}>
          <div className="hwrap">
            {ghostTopic && <div className="ghost gtop" key={ghostTopic} dangerouslySetInnerHTML={{ __html: artSvg(ghostTopic, 'art') }}></div>}
            <div className="hshelf topics on">
              <div className="hhead"><span className="spill">Field <b>{ZMATH_TByID[last.topic].name}</b></span></div>
              <div className="hrail"><div className="hrow" style={{ gap: gap + 'px', transform: 'translateX(' + tShift.toFixed(1) + 'px)' }}>
                {ZMATH_TOPICS.map((t, i) => (
                  <FlatTile key={t.id} t={t} w={i === tSel ? tWs : tW} h={i === tSel ? tHs : tH} art={artSvg(t.id, 'tile')}
                            sel={i === tSel} onClick={pick(0, t.id)} />
                ))}
              </div></div>
            </div>
            <div className="hshelf carts on">
              <div className="hhead"><span className="spill">Demo <b>{ZMATH_PByID[last.proj].title}</b></span></div>
              <div className="hrail"><div className="hrow" style={{ gap: gap + 'px', transform: 'translateX(' + cShift.toFixed(1) + 'px)' }}>
                {ZMATH_PROJECTS.map((p, i) => (
                  <FlatTile key={p.id} t={ZMATH_TByID[p.topic]} w={i === pSel ? cWs : cW} h={i === pSel ? cHs : cH} art={artSvg(p.topic, 'cart')}
                            sel={i === pSel} onClick={pick(1, p.id)} />
                ))}
              </div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- TOPICS: 4×2 grid of Lab-DNA topic tiles + center-right ghost -------- */
/* 4 cols (218) + 3 gaps (20) inside .tgrid's 40px side padding; 2 rows (158) +
   1 gap (22) inside its 44/32 top/bottom padding. Whichever binds first caps grow.
   Ceiling 1.2, same band as HOME (between the Lab mini and selected cartridge).
   Unbounded, the height limit alone took these to 1.56 (~406px tiles), past the
   Lab hero cartridge. */
function growTopics(cw, ch) {
  return clampN(Math.min((cw - 80) / 932, (ch - 76) / 338), 1, 1.095);
}
export function TopicsTray({ onOpen, fit }) {
  const poster = fit === 'poster';
  const [sel, setSel] = uS(ZMATH_TOPICS[0].id); /* boot ringed on the Algebra tile (Lab arrival rhythm) */
  const stageRef = uR(null);
  const scrRef = uR(null);
  const { scale, cw, ch } = useFit(stageRef, poster);
  const open = (id) => { pulseSel(scrRef); onOpen({ type: 'topic', data: ZMATH_TByID[id] }); };
  uE(() => {
    const onKey = (e) => {
      const N = ZMATH_TOPICS.length;
      if (e.key === 'Enter') { if (sel) open(sel); return; }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) < 0) return;
      e.preventDefault();
      const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -4 : 4;
      setSel((id) => {
        const j = ZMATH_TOPICS.findIndex((t) => t.id === id);
        return ZMATH_TOPICS[j < 0 ? 0 : (j + step + N) % N].id;
      });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sel]);
  return (
    /* TRAY-CONTAINMENT RULE (permanent): tiles are children of .scr, one scaling
       unit with the tray (Lab pattern). Never wrap them in a separate island. */
    <div className="lab-stage" ref={stageRef}>
      <div className="heroScale" style={{ width: cw * scale, height: ch * scale }}>
        <div className="scr" ref={scrRef} data-screen-label="Topics — grid tray" data-layout="topics" data-ghost="bold"
             data-screenfit={poster ? 'poster' : 'stretch'}
             style={{ '--grow': poster ? 1 : growTopics(cw, ch), transform: 'scale(' + scale + ')', width: cw + 'px', height: ch + 'px' }}>
          {sel && <div className="ghost" key={sel} dangerouslySetInnerHTML={{ __html: artSvg(sel, 'art') }}></div>}
          <div className="tgrid">
            {ZMATH_TOPICS.map((t) => (
              <FlatTile key={t.id} t={t} art={artSvg(t.id, 'tile')} sel={sel === t.id}
                        onClick={() => { if (sel === t.id) open(t.id); else setSel(t.id); }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
