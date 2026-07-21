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

/* fill the tray: scale the 980×612 design so it covers, stretch the logical
   canvas to the tray footprint (same recipe as lab-screen.jsx) */
function useFit(stageRef, widthLock) {
  const [fit, setFit] = uS({ scale: 1, cw: 980, ch: 612 });
  uLE(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (w <= 0 || h <= 0) return;
      /* widthLock: canvas is ALWAYS 980 logical px wide (study-verbatim
         horizontals — insets, peeks); height flexes to the tray shape.
         Safety floor: if the tray gets too short for the two shelves
         (~520 logical px), shrink just enough — normal shapes unaffected. */
      const scale = widthLock ? Math.min(w / 980, h / 520) : Math.min(w / 980, h / 612);
      setFit({ scale, cw: w / scale, ch: h / scale });
    };
    measure();
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
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
const HG = { pad: 24, gap: 16, tW: 218, tH: 162, cW: 294, cH: 162 };
function rowShift(count, selIdx, w, cw) {
  const rowW = count * w + (count - 1) * HG.gap;
  const c = selIdx * (w + HG.gap) + w / 2;
  return clampN(cw / 2 - c, cw - HG.pad - rowW, HG.pad);
}
export function HomeTray({ onOpen }) {
  const [sel, setSel] = uS({ shelf: 1, key: 'p1' }); /* boot ringed on the Geometric Areas cartridge (Lab arrival rhythm) */
  const [shelf, setShelf] = uS(1);
  const [last, setLast] = uS({ topic: ZMATH_TOPICS[0].id, proj: ZMATH_PROJECTS[0].id });
  const stageRef = uR(null);
  const { scale, cw, ch } = useFit(stageRef);
  const openItem = (s) => {
    if (!s) return;
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
  const tShift = rowShift(ZMATH_TOPICS.length, Math.max(0, ZMATH_TOPICS.findIndex((t) => t.id === last.topic)), HG.tW, cw);
  const cShift = rowShift(ZMATH_PROJECTS.length, Math.max(0, ZMATH_PROJECTS.findIndex((p) => p.id === last.proj)), HG.cW, cw);
  return (
    <div className="lab-stage" ref={stageRef}>
      <div className="heroScale" style={{ width: cw * scale, height: ch * scale }}>
        <div className="scr" data-screen-label="Home — shelves tray" data-layout="home" data-ghost="bold"
             style={{ transform: 'scale(' + scale + ')', width: cw + 'px', height: ch + 'px' }}>
          <div className="hwrap">
            {ghostTopic && <div className="ghost gtop" key={ghostTopic} dangerouslySetInnerHTML={{ __html: artSvg(ghostTopic, 'art') }}></div>}
            <div className="hshelf topics on">
              <div className="hhead"><span className="spill">Field <b>{ZMATH_TByID[last.topic].name}</b></span></div>
              <div className="hrail"><div className="hrow" style={{ transform: 'translateX(' + tShift.toFixed(1) + 'px)' }}>
                {ZMATH_TOPICS.map((t) => (
                  <FlatTile key={t.id} t={t} w={HG.tW} h={HG.tH} art={artSvg(t.id, 'tile')}
                            sel={!!sel && sel.shelf === 0 && sel.key === t.id} onClick={pick(0, t.id)} />
                ))}
              </div></div>
            </div>
            <div className="hshelf carts on">
              <div className="hhead"><span className="spill">Demo <b>{ZMATH_PByID[last.proj].title}</b></span></div>
              <div className="hrail"><div className="hrow" style={{ transform: 'translateX(' + cShift.toFixed(1) + 'px)' }}>
                {ZMATH_PROJECTS.map((p) => (
                  <FlatTile key={p.id} t={ZMATH_TByID[p.topic]} w={HG.cW} h={HG.cH} art={artSvg(p.topic, 'cart')}
                            sel={!!sel && sel.shelf === 1 && sel.key === p.id} onClick={pick(1, p.id)} />
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
export function TopicsTray({ onOpen }) {
  const [sel, setSel] = uS(ZMATH_TOPICS[0].id); /* boot ringed on the Algebra tile (Lab arrival rhythm) */
  const stageRef = uR(null);
  const { scale, cw, ch } = useFit(stageRef);
  const open = (id) => onOpen({ type: 'topic', data: ZMATH_TByID[id] });
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
    <div className="lab-stage" ref={stageRef}>
      <div className="heroScale" style={{ width: cw * scale, height: ch * scale }}>
        <div className="scr" data-screen-label="Topics — grid tray" data-layout="topics" data-ghost="bold"
             style={{ transform: 'scale(' + scale + ')', width: cw + 'px', height: ch + 'px' }}>
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
