/* Zmath components — Sidebar (Miiverse rail), Dock, Tile, Modal, screens. */
import React from "react";
import { Icon, GlyphIcon, CapsuleIcon } from "./icons.jsx";
import { ZMATH_COMPOSED } from "./tile-covers.js";
import { ZMATH_PByID, ZMATH_TByID, NOTE_GLYPH } from "./data.js";
import { ZFIGURES } from "./figures-registry.js";
import "./figures.jsx";   // side-effect: registers the 8 note figures into ZFIGURES
const { useState, useEffect, useRef } = React;

/* gradient helpers from a topic */
const grad = (t) => ({ '--c1': t.grad[0], '--c2': t.grad[1] });
const badgeGrad = (t) => ({ '--b1': t.grad[0], '--b2': t.grad[1] });
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

/* ---- PixelLetter — the pixel-grid brand mark, morphs A–Z with the rank ---- */
const PIXFONT = {
  A:'0111010001100011111110001100011000', B:'1111010001100011111010001100011111',
  C:'0111010001100001000010000100010111', D:'1111010001100011000110001100011111',
  E:'1111110000100001111010000100001111', F:'1111110000100001111010000100001000',
  G:'0111010001100001011110001100010111', H:'1000110001100011111110001100011000',
  I:'1111100100001000010000100001001111', J:'0011100010000100001100101001001100',
  K:'1000110010101001100010100100101000', L:'1000010000100001000010000100001111',
  M:'1000111011101011010110001100011000', N:'1000111001101011001110001100011000',
  O:'0111010001100011000110001100010111', P:'1111010001100011111010000100001000',
  Q:'0111010001100011000110101100100110', R:'1111010001100011111010100100101000',
  S:'0111110000100000111000001000011111', T:'1111100100001000010000100001000010',
  U:'1000110001100011000110001100010111', V:'1000110001100011000110001010100010',
  W:'1000110001100011010110101101110001', X:'1000110001010100010001010100011000',
  Y:'1000110001010100010000100001000010', Z:'1111100001000100010001000100001111',
};
function PixelLetter({ letter = 'Z', cell = 5 }) {
  const pat = (PIXFONT[letter] || PIXFONT.Z);
  const cols = 5, rows = 7, gw = cols * cell, gh = rows * cell;
  const cells = [];
  for (let i = 0; i < rows * cols; i++) {
    const on = pat[i] === '1';
    const c = i % cols, r = (i / cols) | 0;
    cells.push(<span key={i} className={'px' + (on ? ' on' : '')}
      style={on ? { background: 'var(--brand-spectrum)', backgroundSize: `${gw}px ${gh}px`, backgroundPosition: `${-c * cell}px ${-r * cell}px` } : undefined} />);
  }
  return <span className="pixletter" style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gridAutoRows: `${cell}px`, width: gw, height: gh }}>{cells}</span>;
}

/* ---- NAV config (rail) ---- */
const NAV = [
  { id: 'Home',     icon: 'home',   colors: ['#6a8cff', '#2f54c8'], glow: 'rgba(50,90,220,0.42)' },
  { id: 'Topics',   icon: 'book',   colors: ['#b48cf0', '#6a36b5'], glow: 'rgba(120,60,200,0.42)' },
  { id: 'Projects', icon: 'beaker', colors: ['#4fe0bf', '#159c7e'], glow: 'rgba(30,190,160,0.42)' },
  { id: 'Notes',    icon: 'note',   colors: ['#ffc24d', '#e0701f'], glow: 'rgba(240,130,30,0.42)' },
  { id: 'About',    icon: 'user',   colors: ['#ff86ac', '#c2326b'], glow: 'rgba(220,70,130,0.42)' },
];

/* iconFinish is always 'flat' in the app (app.jsx); the glossy branch and the
   Home-only homeIconFinish override are retired. */
function Sidebar({ page, setPage, searchInRail, onSearch, capsuleDepth = 'raised', homeMaterial = 'grey', iconFinish = 'flat' }) {
  const NavIcon = CapsuleIcon;
  const COLLAPSED = 90, EXPANDED = 248, MID = (COLLAPSED + EXPANDED) / 2;
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(null);          // live width while dragging (px) or null
  const drag = useRef(null);                  // { startX, startW, curW, moved }

  useEffect(() => { document.body.classList.toggle('rail-open', open); }, [open]);

  // (Z)math rank wheel — 26 tiers, Rank Z (baseline) → Rank A (ultimate)
  const [rank, setRank] = useState(0);
  const RITEM = 40;
  const LETTERS = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');
  const RANKLTR = LETTERS[rank];
  const rankDrag = useRef(null);
  const clampRank = (n) => Math.max(0, Math.min(25, n));
  const onRankWheel = (e) => { e.stopPropagation(); setRank(r => clampRank(r + (e.deltaY > 0 ? -1 : 1))); };
  const onRankDown = (e) => { e.stopPropagation(); rankDrag.current = { y: e.clientY, start: rank, moved: 0 }; e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); };
  const onRankMove = (e) => { const d = rankDrag.current; if (!d) return; const dy = e.clientY - d.y; d.moved = Math.max(d.moved, Math.abs(dy)); setRank(clampRank(d.start - Math.round(dy / RITEM))); };
  const onRankUp = (e) => { rankDrag.current = null; e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId); };

  const onDown = (e) => {
    e.preventDefault();
    const startW = open ? EXPANDED : COLLAPSED;
    drag.current = { startX: e.clientX, startW, curW: startW, moved: 0 };
    setW(startW);
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    d.curW = Math.max(COLLAPSED, Math.min(EXPANDED, d.startW + dx));
    setW(d.curW);
    setOpen(d.curW > MID);
  };
  const onUp = (e) => {
    const d = drag.current; if (!d) return;
    if (d.moved < 4) setOpen(o => !o);            // tap → toggle
    else setOpen(d.curW > MID);                    // drag → snap to nearest
    drag.current = null; setW(null);
    e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const railW = w != null ? w : (open ? EXPANDED : COLLAPSED);

  return (
    <aside className={'rail' + (open ? ' open' : '') + (w != null ? ' dragging' : '')} style={{ flexBasis: railW + 'px' }}>
      <div className="rail-panel">
        <div className="profile">
          <span className="ava"><span className="ava-lambda">&lambda;</span></span>
          <div>
            <div className="nm">Nana</div>
            <div className="role">Rank {RANKLTR} · Mathematician</div>
          </div>
        </div>
        {searchInRail && (
          <button className="nav-item nav-search" onClick={onSearch}>
            <span className="ni-ic" style={{ '--ni-glow': 'rgba(90,100,120,0.45)' }}>
              <NavIcon name="search" size={37} sw={2.8} rim={iconFinish === 'flat' ? 4.8 : 6} colors={iconFinish === 'flat' ? ['#4a4a52', '#0c0c10'] : ['#3d4250', '#3d4250']} glow="rgba(90,100,120,0.42)" depth={capsuleDepth} finish={iconFinish} />
            </span>
            <span className="ni-tx">Search</span>
            <span className="ni-cur"><Icon name="chevron" size={16} sw={2.4} /></span>
          </button>
        )}
        <div className="rail-label">Menu</div>
        {NAV.map(n => (
          <button key={n.id} className={'nav-item' + (page === n.id ? ' on' : '')} onClick={() => setPage(n.id)}>
            <span className="ni-ic" style={{ '--ni-glow': n.glow }}>
              <NavIcon name={n.icon} size={40} sw={2.5} colors={n.colors} glow={n.glow} active={page === n.id} depth={capsuleDepth} finish="flat" material={n.id === 'Home' && homeMaterial === 'grey' ? 'moat' : 'color'} />
            </span>
            <span className="ni-tx">{n.id}</span>
            <span className="ni-cur"><Icon name="chevron" size={16} sw={2.4} /></span>
          </button>
        ))}
        <div className="rail-foot">© 2026 Nana</div>
        <div className="rail-grip" title="Drag right to expand"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span></span>
        </div>
      </div>
    </aside>
  );
}

/* ---- DOCK (colored glossy glyphs on frosted glass) ---- */
function Dock({ onSearch, onRandom }) {
  const items = [
    { id: 'search', icon: 'search', tip: 'Search topics',   colors: ['#4a4a52', '#0c0c10'], glow: 'rgba(20,20,30,0.4)', on: onSearch },
    { id: 'github', icon: 'github', tip: 'GitHub',          colors: ['#9b7bff', '#5a23c0'], glow: 'rgba(110,50,200,0.42)' },
    { id: 'coffee', icon: 'coffee', tip: 'Buy me a coffee', colors: ['#ffc24d', '#e0701f'], glow: 'rgba(240,130,30,0.45)' },
  ];
  return (
    <nav className="dock">
      {items.map(it => (
        <button key={it.id} className="di" onClick={it.on}>
          <GlyphIcon name={it.icon} size={32} sw={2.7} colors={it.colors} glow={it.glow} />
          <span className="tip">{it.tip}</span>
        </button>
      ))}
      <span className="sep" />
      <button className="di" onClick={onRandom}>
        <GlyphIcon name="sparkle" size={31} sw={2.7} colors={['#ff86c2', '#cf2f86']} glow="rgba(220,60,150,0.45)" />
        <span className="tip">Surprise me</span>
      </button>
    </nav>
  );
}

/* ---- TILE (topic or project) ---- */
function Tile({ item, idx, onOpen, selected }) {
  const isProj = item.kind === 'project';
  const data = isProj ? ZMATH_PByID[item.id] : ZMATH_TByID[item.id];
  const topic = isProj ? ZMATH_TByID[data.topic] : data;
  const ref = useRef(null);
  /* entrance stagger via state (NOT classList) so re-renders — e.g. selection —
     can't wipe the 'in' class and blank the tile */
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSeen(true), 60 + idx * 45);
    return () => clearTimeout(t);
  }, [idx]);
  const cls = 'tile' + (item.w === 2 ? ' w2' : '') + (item.h === 2 ? ' h2' : '') +
    (item.h === 2 ? ' t-lg' : item.w === 2 ? ' t-md' : ' t-sm') + (seen ? ' in' : '') + (selected ? ' sel' : '');

  return (
    <div ref={ref} className={cls} data-topic={topic.id} data-kind={item.kind} style={{ ...grad(topic), ...badgeGrad(topic), '--tglow': hexA(topic.grad[1], 0.21), '--ink': `var(--${topic.ink})` }}
      onClick={() => onOpen(isProj ? { type: 'project', data } : { type: 'topic', data })}>
      <span className="badge"><span>{topic.sym}</span></span>
      <div className="tile-art">
        <svg className="tile-cover" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href={isProj ? ZMATH_COMPOSED[topic.id].cart : ZMATH_COMPOSED[topic.id].tile} /></svg>
        <div className="tile-tx">
          {isProj
            ? <><div className="tile-kind">{data.kind}</div><div className="tile-name">{data.title}</div></>
            : <><div className="tile-kind">Topic {data.n}</div><div className="tile-name">{data.name}</div></>}
        </div>
      </div>
    </div>
  );
}

/* ---- shared About pieces (About screen + Help / About pop-up) ---- */
/* The official GitHub logo (Invertocat), solid — from GitHub_Invertocat_Logo.svg.
   A filled shape, so it's drawn here rather than in the line-icon set (icons.jsx). */
const GitHubMark = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 240 240" aria-hidden="true">
    <g transform="translate(0,240) scale(0.1,-0.1)" fill="#1f2328">
      <path d="M970 2301 c-305 -68 -555 -237 -727 -493 -301 -451 -241 -1056 143 -1442 115 -116 290 -228 422 -271 49 -16 55 -16 77 -1 24 16 25 20 25 135 l0 118 -88 -5 c-103 -5 -183 13 -231 54 -17 14 -50 62 -73 106 -38 74 -66 108 -144 177 -26 23 -27 24 -9 37 43 32 130 1 185 -65 96 -117 133 -148 188 -160 49 -10 94 -6 162 14 9 3 21 24 27 48 6 23 22 58 35 77 l24 35 -81 16 c-170 35 -275 96 -344 200 -64 96 -85 179 -86 334 0 146 16 206 79 288 28 36 31 47 23 68 -15 36 -11 188 5 234 13 34 20 40 47 43 45 5 129 -24 214 -72 l73 -42 64 15 c91 21 364 20 446 0 l62 -16 58 35 c77 46 175 82 224 82 39 0 39 -1 55 -52 17 -59 20 -166 5 -217 -8 -30 -6 -39 16 -68 109 -144 121 -383 29 -579 -62 -129 -193 -219 -369 -252 l-84 -16 31 -55 32 -56 3 -223 4 -223 25 -16 c23 -15 28 -15 76 2 80 27 217 101 292 158 446 334 590 933 343 1431 -145 293 -419 518 -733 602 -137 36 -395 44 -525 15z" />
    </g>
  </svg>
);
const REPO_URL = 'https://github.com/nasuak0/alphabetmath';
/* The desktop app serves this page at app://alphabetmath/ — Get Started closes the window there
   (the desktop app can't usefully download itself). */
const IN_DESKTOP_APP = typeof location !== 'undefined' && location.protocol === 'app:';
// Always the newest release's file (the release asset must be named AlphabetMath.dmg).
const DOWNLOAD_URL = 'https://github.com/nasuak0/alphabetmath/releases/latest/download/AlphabetMath.dmg';
// Shown in Help / About. Keep in step with the GitHub Release tag (v0.0.1) and
// "version" in AlphabetMath - Desktop/package.json.
const APP_VERSION = '0.0.1';

/* ---- MODAL (Zperiod element-modal) ---- */
function Modal({ entry, onClose }) {
  const open = !!entry;
  const last = useRef(null);
  if (entry) last.current = entry;
  const e = entry || last.current;
  const [shake, setShake] = useState(false);
  const shakeT = useRef(null);
  const refuse = () => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
    clearTimeout(shakeT.current);
    shakeT.current = setTimeout(() => setShake(false), 560);
  };
  useEffect(() => () => clearTimeout(shakeT.current), []);
  useEffect(() => {
    const h = (ev) => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  /* Help / About window: drawn at one fixed size (980px wide) and scaled down evenly
     to fit smaller screens — like the trays — so it stays side by side and never clips. */
  const aboutPopRef = useRef(null);
  const [aboutScale, setAboutScale] = useState(1);
  useEffect(() => {
    if (!e || e.type !== 'about') return;
    const fit = () => {
      const el = aboutPopRef.current; if (!el) return;
      const room = 56; // breathing space around the window (incl. the ✕ outside the corner)
      setAboutScale(Math.min(1, (window.innerWidth - room) / el.offsetWidth,
                                (window.innerHeight - room) / el.offsetHeight));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [e && e.type]);

  if (!e) return <div className="scrim" />;

  /* Help / About (About screen) — a wide white window with two sides (like Zperiod's intro):
     LEFT  AlphabetMath, tagline, short paragraph, big "[⬇] Get Started" button, version
           (button downloads the desktop app on the website; closes this window in the desktop app);
     RIGHT the creator card — name → role → info + contact panel.
     Always two sides, side by side; scaled down evenly on small screens (aboutScale above). */
  if (e.type === 'about') {
    return (
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose}>
        <div className="about-pop" ref={aboutPopRef} style={{ '--about-scale': aboutScale }}
             role="dialog" aria-modal="true" aria-labelledby="about-app-title"
             onClick={ev => ev.stopPropagation()}>
          <button className="about-close" onClick={onClose} aria-label="Close"><Icon name="x" size={18} sw={2.4} /></button>
          <div className="about-sheet">
            <div className="about-intro">
              <h2 id="about-app-title" className="ai-name">AlphabetMath</h2>
              <p className="ai-tag">Mathematics that moves.<br />Visually &amp; intuitively.</p>
              <p className="ai-desc">I build small interactive things that make a piece of mathematics click.
                 Most of what lives here started as a question I couldn’t answer with a static picture,
                 so I made it move instead.</p>
              {/* "[⬇] Get Started" everywhere: on the website it downloads the desktop app;
                  in the desktop app it just closes this window. */}
              {IN_DESKTOP_APP
                ? <button type="button" className="ai-cta" onClick={onClose}>
                    <Icon name="download" size={20} stroke="#1f2328" sw={2.2} />Get Started</button>
                : <a className="ai-cta" href={DOWNLOAD_URL}>
                    <Icon name="download" size={20} stroke="#1f2328" sw={2.2} />Get Started</a>}
              <div className="ai-ver">v{APP_VERSION}</div>
            </div>
            <div className="about-card">
              <h3 className="ab-name">Nana Kumi</h3>
              <div className="ab-role">Creative Developer</div>
              <div className="ab-panel">
                <div className="ab-info"><Icon name="cap" size={20} stroke="#4f5fe0" sw={1.8} /><span>SUNY · Upper-level undergraduate</span></div>
                <div className="ab-info"><Icon name="pin" size={20} stroke="#4f5fe0" sw={1.8} /><span>New York (USA)</span></div>
                <div className="ab-rule" />
                <a className="ab-row" href="mailto:nybkumi@gmail.com">
                  <span className="ab-ic"><Icon name="at" size={17} stroke="#4f5fe0" sw={1.9} /></span><span>nybkumi@gmail.com</span>
                </a>
                <a className="ab-row" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  <span className="ab-ic"><GitHubMark size={17} /></span><span>@nasuak0/alphabetmath</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isProj = e.type === 'project';
  const data = e.data;
  const topic = isProj ? ZMATH_TByID[data.topic] : data;
  return (
    <div className={'scrim' + (open ? ' open' : '')} onClick={onClose}>
      <div className={'modal' + (shake ? ' shake' : '')} onClick={ev => ev.stopPropagation()} style={grad(topic)}>
        <div className="modal-cover">
          <div className="mc-grad" />
          <svg className="tile-cover" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href={ZMATH_COMPOSED[topic.id].art} /></svg>
          <div className="modal-glyph" style={badgeGrad(topic)}><span>{topic.sym}</span></div>
          <button className="modal-close" onClick={onClose}><Icon name="x" size={18} sw={2.2} /></button>
        </div>
        <div className="modal-body">
          <div className="kicker">{isProj ? data.kind + ' · ' + data.year : 'Topic ' + topic.n}</div>
          <h3>{isProj ? data.title : topic.name}</h3>
          <div className="modal-tags">
            <span className="tg" style={{ background: `var(--${topic.color})`, color: `var(--${topic.ink})` }}>{topic.name}</span>
            {isProj && <span className="tg" style={{ background: 'var(--scrim)', color: 'var(--wii-ink-2)' }}>{data.kind}</span>}
          </div>
          <p>{isProj ? data.desc : topic.blurb}</p>
        </div>
        <div className="modal-foot">
          {isProj
            ? <><button className="btn-primary" onClick={refuse}><Icon name="play" size={16} stroke="#fff" sw={2} /> Open demo</button>
                <button className="btn-ghost" onClick={refuse}>Source</button></>
            : <button className="btn-primary" onClick={refuse}><Icon name="arrow" size={16} stroke="#fff" sw={2} /> Browse {topic.name}</button>}
          <button className="btn-lock" onClick={refuse} aria-label="Locked" title="Locked">
            <Icon name="lock" size={17} sw={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- NOTE READER (full article sheet) ---- */
function ParallelogramFig({ topic }) {
  const c1 = (topic && topic.grad && topic.grad[0]) || '#5b8def';
  const c2 = (topic && topic.grad && topic.grad[1]) || '#3147bc';
  // origin at (40,150); a = (110,0)-ish base vector, b = (70,-95) slanted vector
  const O = [44, 150], A = [184, 150], B = [114, 60], C = [254, 60];
  const pts = `${O[0]},${O[1]} ${A[0]},${A[1]} ${C[0]},${C[1]} ${B[0]},${B[1]}`;
  return (
    <svg className="fig-svg" viewBox="0 0 300 180" role="img" aria-label="Two vectors spanning a parallelogram whose area is the determinant">
      <defs>
        <linearGradient id="pgfill" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={c1} stopOpacity="0.30" />
          <stop offset="1" stopColor={c2} stopOpacity="0.30" />
        </linearGradient>
        <marker id="pgarrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--wii-ink)" />
        </marker>
      </defs>
      <polygon points={pts} fill="url(#pgfill)" stroke={c2} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1={O[0]} y1={O[1]} x2={A[0]} y2={A[1]} stroke="var(--wii-ink)" strokeWidth="2" markerEnd="url(#pgarrow)" />
      <line x1={O[0]} y1={O[1]} x2={B[0]} y2={B[1]} stroke="var(--wii-ink)" strokeWidth="2" markerEnd="url(#pgarrow)" />
      <text x={(O[0]+A[0])/2 - 4} y={O[1] + 18} className="fig-lab">a</text>
      <text x={B[0] - 20} y={(O[1]+B[1])/2 + 2} className="fig-lab">b</text>
      <text x={158} y={112} className="fig-area">area = det</text>
    </svg>
  );
}

function NoteBlock({ b, topic }) {
  if (b.sec) return (
    <div className="rd-sec">
      <h2 className="rd-sec-t"><span className="rd-sec-n">{b.sec}</span>{b.t}</h2>
    </div>
  );
  if (b.sub) return <h3 className="rd-sub">{b.sub}</h3>;
  if (b.h) return <h2 className="rd-h">{b.h}</h2>;
  if (b.p) return <p className="rd-p" dangerouslySetInnerHTML={{ __html: b.p }} />;
  if (b.box) return <div className="rd-box"><span className="eq" dangerouslySetInnerHTML={{ __html: b.box }} /></div>;
  if (b.math) return <div className="rd-math"><span className="eq" dangerouslySetInnerHTML={{ __html: b.math }} /></div>;
  if (b.table) return (
    <div className="rd-table-wrap">
      <table className="rd-table">
        <thead><tr>{b.table.cols.map((c, i) => <th key={i} dangerouslySetInnerHTML={{ __html: c }} />)}</tr></thead>
        <tbody>
          {b.table.rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  if (b.fig) {
    const F = ZFIGURES[b.fig];
    return (
      <figure className="rd-figure">
        <div className="rd-fig">{F ? <F topic={topic} /> : null}</div>
        {b.cap && <figcaption className="rd-cap" dangerouslySetInnerHTML={{ __html: b.cap }} />}
      </figure>
    );
  }
  if (b.note) return <aside className="rd-note" dangerouslySetInnerHTML={{ __html: b.note }} />;
  if (b.olist) return (
    <ol className="rd-olist">
      {b.olist.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li }} />)}
    </ol>
  );
  if (b.list) return (
    <ul className="rd-list">
      {b.list.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li }} />)}
    </ul>
  );
  return null;
}

function NoteReader({ entry, onClose }) {
  const open = !!entry;
  const last = useRef(null);
  if (entry) last.current = entry;
  const e = entry || last.current;
  useEffect(() => {
    const h = (ev) => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const bodyRef = useRef(null);
  useEffect(() => { if (open && bodyRef.current) bodyRef.current.scrollTop = 0; }, [open, e]);
  if (!e) return <div className="scrim reader-scrim" />;

  const note = e.data;
  const topic = ZMATH_TByID[note.topic];
  const g = (NOTE_GLYPH[topic.id]) || topic.grad;
  return (
    <div className={'scrim reader-scrim' + (open ? ' open' : '')} onClick={onClose}>
      <article className="reader" onClick={ev => ev.stopPropagation()} style={grad(topic)}>
        <div className="reader-cover">
          <div className="mc-grad" />
          <svg className="tile-cover" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href={ZMATH_COMPOSED[topic.id].art} /></svg>
          <div className="tile-sheen" />
          <button className="modal-close" onClick={onClose}><Icon name="x" size={18} sw={2.2} /></button>
          <div className="reader-cover-tx">
            <div className="reader-kicker">Field note</div>
            <h1 className="reader-title">{note.title}</h1>
          </div>
        </div>
        <div className="reader-scroll" ref={bodyRef}>
          <div className="reader-meta">
            <span className="note-glyph sm" style={{ background: `linear-gradient(155deg, ${g[0]}, ${g[1]})` }}>{topic.sym}</span>
            <span className="badge2" style={{ background: `var(--${topic.color})`, color: `var(--${topic.ink})` }}>{topic.name}</span>
            <span className="rm-dot">&middot;</span>
            <span className="rm-when">{note.date}</span>
            <span className="rm-dot">&middot;</span>
            <span className="rm-when">{note.read} read</span>
          </div>
          {note.dek && <p className="reader-dek">{note.dek}</p>}
          <div className="reader-prose">
            {(note.body || []).map((b, i) => <NoteBlock key={i} b={b} topic={topic} />)}
          </div>
        </div>
      </article>
    </div>
  );
}
Object.assign(ZFIGURES, { parallelogram: ParallelogramFig });

export { PixelLetter, Sidebar, Dock, Tile, Modal, ParallelogramFig, NoteBlock, NoteReader,
         GitHubMark, IN_DESKTOP_APP, REPO_URL, DOWNLOAD_URL, APP_VERSION };
