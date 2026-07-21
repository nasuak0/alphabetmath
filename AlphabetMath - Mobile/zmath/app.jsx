/* Zmath app — screens + shell. */
import React from "react";
import { createPortal } from "react-dom";
import { Sidebar, Tile, Modal, NoteBlock } from "./components.jsx";
import { Icon } from "./icons.jsx";
import { ZMATH_TOPICS, ZMATH_PROJECTS, ZMATH_TByID, ZMATH_PByID, ZMATH_NOTES, NOTE_GLYPH } from "./data.js";
import { LabSpotlight } from "./lab-screen.jsx";
import { HomeTray, TopicsTray } from "./picker-screens.jsx";
import { ZMATH_COMPOSED } from "./tile-covers.js";
import { useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakRadio } from "./tweaks-panel.jsx";
const { useState: uS, useEffect: uE } = React;

/* System / OS-flavored eyebrow label sets. n = the live count. */
const OS_LABEL_STYLES = {
  menu:     { label: 'Menu · Library · Lab', home: 'Menu',           topics: (n) => 'Library',                  projects: (n) => 'Lab',                    notes: 'Notebook',     about: 'Contact' },
  original: { label: 'Original',  home: 'Home · Browse by Interest', topics: (n) => `Explore · ${n} Topics`,     projects: (n) => `Build · ${n} Interactive Demos`, notes: 'Read · Field Notes', about: 'About · Get in Touch' },
  channels: { label: 'Channels',  home: 'MENU',                      topics: (n) => `CHANNELS · ${n}`,          projects: (n) => `SOFTWARE · ${n}`,        notes: 'NOTEBOOK',     about: 'PROFILE' },
  library:  { label: 'Library',   home: 'HOME LIBRARY',              topics: (n) => `${n} TILES`,               projects: (n) => `${n} CARTRIDGES`,        notes: 'NOTEBOOK',     about: 'ABOUT' },
  disc:     { label: 'Disc tray', home: 'MAIN MENU',                 topics: (n) => `DISC LIBRARY · ${n}`,      projects: (n) => `NOW PLAYING · ${n}`,     notes: 'NOTEBOOK',     about: 'OWNER' },
  storage:  { label: 'Storage',   home: 'SYSTEM',                    topics: (n) => `${n} INSTALLED`,           projects: (n) => `${n} RUNNABLE`,          notes: 'NOTEBOOK',     about: 'ACCOUNT' },
  console:  { label: 'Console',   home: '\u25B8 HOME',               topics: (n) => `\u25B8 EXPLORE · ${n} CH`, projects: (n) => `\u25B8 BUILD · ${n} APPS`, notes: '\u25B8 NOTEBOOK', about: '\u25B8 PROFILE' },
};

/* ---- ORIENTATION GUARD ----
   AlphabetMath is landscape-only. This overlay is portalled to <body> (NOT into
   #root) so the pure-CSS portrait rule `body:has(#rotate-guard) #root{display:none}`
   in app.css can hide the app behind it. Living here in the brain means BOTH
   readers — the no-build Mobile page and the Vite App — get the guard from one
   source and can never drift. Styled by the #rotate-guard / .rg-* rules in app.css. */
function RotateGuard() {
  return createPortal(
    <div id="rotate-guard" role="alertdialog" aria-live="assertive">
      <div className="rg-card">
        <div className="rg-phone"><span className="rg-phone-arc"></span></div>
        <h2 className="rg-title">Please rotate your device</h2>
        <p className="rg-text">AlphabetMath is designed for landscape. Turn your device sideways to continue.</p>
      </div>
    </div>,
    document.body
  );
}

function useClock() {
  const [now, setNow] = uS(new Date());
  uE(() => { const t = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const h = now.getHours();
  const tod = h >= 6 && h < 11 ? 'morning' : h >= 11 && h < 17 ? 'midday' : h >= 17 && h < 21 ? 'evening' : 'night';
  return { time, date, tod };
}

function TopBar({ title, sub }) {
  const { time, date, tod } = useClock();
  return (
    <div className="topbar">
      <div>
        <div className="title">{title}</div>
        <div className="sub">{sub}</div>
      </div>
      <div className="status-pill" data-tod={tod}>
        <span className="g"><Icon name="clock" size={17} sw={2.4} /></span>
        <span className="clock">{time}</span>
        <span className="sep" />
        <span className="date">{date}</span>
      </div>
    </div>
  );
}

/* ---- HOME (one paper tray, two shelf-less rows: topic tiles + project cartridges) ---- */
function HomeScreen({ onOpen, go, eyebrows }) {
  /* Design Lab port: study-exact shelves tray (picker-screens.jsx), scaled to the Lab-tray footprint. */
  return (
    <div className="fade picker-home lab-spot">
      <HeroWidget compact pillEyebrow eyebrow={eyebrows.home} />
      <HomeTray onOpen={onOpen} />
    </div>
  );
}

/* ---- shared glass hero widget (frosted panel + brand glow + clock pill) ---- */
function HeroWidget({ eyebrow, title, sub, compact, pillEyebrow, children }) {
  const { time, date, tod } = useClock();
  return (
    <div className={'topics-hero' + (compact ? ' compact' : '')}>
      <div className="th-main">
        {pillEyebrow
          ? <div className="th-eyebrow-pill"><span className="th-eyebrow">{eyebrow}</span></div>
          : <div className="th-eyebrow">{eyebrow}</div>}
        {title && <div className="title">{title}</div>}
        {sub && <div className="sub">{sub}</div>}
        {children}
      </div>
      <div className="status-pill th-pill" data-tod={tod}>
        <span className="g"><Icon name="clock" size={17} sw={2.4} /></span>
        <span className="clock">{time}</span>
        <span className="sep" />
        <span className="date">{date}</span>
      </div>
    </div>
  );
}

/* ---- TOPICS ---- */
function TopicsScreen({ onOpen, eyebrows }) {
  /* Design Lab port: study-exact 4×2 grid tray (picker-screens.jsx). */
  return (
    <div className="fade picker-topics lab-spot">
      <HeroWidget compact pillEyebrow eyebrow={eyebrows.topics} />
      <TopicsTray onOpen={onOpen} />
    </div>
  );
}

/* ---- PROJECTS ---- */
/* The Lab tray — the Design Lab study's spotlight cartridge-rail screen
   (lab-screen.jsx). The old tile mosaic was retired in its favor. */
function ProjectsScreen({ onOpen, eyebrows }) {
  return (
    <div className="fade projects-screen lab-spot">
      <HeroWidget compact pillEyebrow eyebrow={eyebrows.projects} />
      <LabSpotlight onOpen={onOpen} />
    </div>
  );
}

/* ---- NOTES ---- */
/* note glyph palettes (NOTE_GLYPH) now live in data.js — imported above. */
function Exercise({ ex, n }) {
  const [val, setVal] = uS('');
  const [state, setState] = uS(null);   // null | 'right' | 'wrong'
  const [reveal, setReveal] = uS(false);
  const check = () => {
    const got = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
    setState(!isNaN(got) && got === ex.answer ? 'right' : 'wrong');
  };
  return (
    <div className={'rail-ex' + (state ? ' ' + state : '')}>
      <div className="rail-ex-n">Exercise {n}</div>
      <div className="rail-ex-q" dangerouslySetInnerHTML={{ __html: ex.q }} />
      <div className="rail-ex-row">
        <input className="rail-ex-in" value={val} placeholder="your answer" inputMode="text"
               onChange={e => { setVal(e.target.value); setState(null); }}
               onKeyDown={e => { if (e.key === 'Enter') check(); }} />
        <button className="rail-ex-check" onClick={check}>Check</button>
      </div>
      {state === 'right' && <div className="rail-ex-fb ok">Correct &#10003;</div>}
      {state === 'wrong' && <div className="rail-ex-fb no">Not quite — try again.</div>}
      <button className="rail-ex-reveal" onClick={() => setReveal(r => !r)}>
        {reveal ? 'Hide solution' : 'Show solution'}
      </button>
      {reveal && <div className="rail-ex-sol" dangerouslySetInnerHTML={{ __html: ex.sol }} />}
    </div>
  );
}

function NotesScreen({ onOpen, eyebrows }) {
  const [reading, setReading] = uS(null);
  const lastRef = React.useRef(null);
  if (reading) lastRef.current = reading;
  const shown = reading || lastRef.current;
  const shownTopic = shown ? ZMATH_TByID[shown.topic] : null;
  const sg = shownTopic ? (NOTE_GLYPH[shownTopic.id] || shownTopic.grad) : null;
  const NB = NoteBlock;
  const bodyRef = React.useRef(null);
  uE(() => { if (reading && bodyRef.current) bodyRef.current.scrollTop = 0; }, [reading]);

  return (
    <div className={'fade notes-screen' + (reading ? ' reading' : '')}>
      {/* top strip — NOTEBOOK hero (list mode only; hidden while reading) */}
      <div className="notes-topstrip">
        <div className="nts-hero-layer">
          <HeroWidget compact pillEyebrow eyebrow={eyebrows.notes} />
        </div>
      </div>

      {/* tray — list slides out left, article card slides in from right */}
      <div className="notes-tray">
        <div className="notes-list-pane">
          <div className="notes">
            {ZMATH_NOTES.map(n => {
              const topic = ZMATH_TByID[n.topic];
              const g = NOTE_GLYPH[topic.id] || topic.grad;
              const hasArticle = Array.isArray(n.body) && n.body.length > 0;
              return (
                <div key={n.id} className="note-row"
                     onClick={() => hasArticle ? setReading(n) : onOpen({ type: 'topic', data: topic })}>
                  <span className="note-glyph" style={{ background: `linear-gradient(155deg, ${g[0]}, ${g[1]})` }}>{topic.sym}</span>
                  <span className="nt">{n.title}</span>
                  <span className="badge2" style={{ background: `var(--${topic.color})`, color: `var(--${topic.ink})` }}>{topic.name}</span>
                  <span className="when">{n.read}</span>
                  <span className="when">{n.date}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="notes-reader-pane" aria-hidden={!reading}
             style={shownTopic ? { '--c1': shownTopic.grad[0], '--c2': shownTopic.grad[1] } : null}>
          {/* merged sticky header: blue cover with back + title */}
          <div className="reader-header">
            <div className="mc-grad" />
            {shownTopic && <svg className="tile-cover" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href={ZMATH_COMPOSED[shownTopic.id].art} /></svg>}
            <div className="tile-sheen" />
            <button className="nts-back" onClick={() => setReading(null)} aria-label="Back to Notebook">
              <Icon name="arrowLeft" size={17} sw={2.4} />
            </button>
            <h1 className="nts-title">{shown ? shown.title : ''}</h1>
          </div>
          <div className="reader-scroll" ref={bodyRef}>
            {shown && shownTopic && (
              <div className="reader-grid">
                <div className="reader-main">
                  {shown.dek && <p className="reader-dek">{shown.dek}</p>}
                  <div className="reader-prose">
                    {(shown.body || []).map((b, i) => <NB key={i} b={b} topic={shownTopic} />)}
                  </div>
                </div>
                {Array.isArray(shown.exercises) && shown.exercises.length > 0 && (
                  <aside className="reader-rail">
                    <div className="rail-head">Exercises</div>
                    {shown.exercises.map((ex, i) => <Exercise key={shown.id + '-' + i} ex={ex} n={i + 1} />)}
                  </aside>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- ABOUT ---- */
function AboutScreen({ eyebrows }) {
  const links = [
    { t: 'GitHub', s: '@nasuak0/alphabetmath', icon: 'github', c: ['#7a8290', '#3a4150'] },
  ];
  return (
    <div className="fade">
      <HeroWidget compact pillEyebrow eyebrow={eyebrows.about} />
      <div className="about-grid">
        <div className="card">
          <h3>Hello — I’m Nana.</h3>
          <p>I build small interactive things that make a piece of mathematics click. Most of
             what lives here started as a question I couldn’t answer with a static picture, so I
             made it move instead.</p>
          <p>This site is laid out like a home-menu on purpose: every topic is a tile, every demo
             a little cartridge you can pop in. Tap around — there’s no wrong order.</p>
          <div className="sig"><span>Nana · 2026</span></div>
        </div>
        <div>
          {links.map(l => (
            <a key={l.t} className="link-card">
              <span className="link-ic" style={{ background: `linear-gradient(155deg, ${l.c[0]}, ${l.c[1]})` }}>
                <Icon name={l.icon} size={20} stroke="#fff" sw={1.9} />
              </span>
              <span className="link-tx"><b>{l.t}</b><span>{l.s}</span></span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- APP ---- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "navLabels": "menu",
  "ambience": "day",
  "material": "liquid",
  "energy": "lively",
  "capsuleDepth": "raised",
  "capsuleShape": "plain",
  "homeMaterial": "color",
  "fit": "fluid",
  "iconMat": "flat"
}/*EDITMODE-END*/;

/* Optional deep-link overrides (read from the URL once):
     ?fit=native|ipad|fluid|desktop  → force a display fit, ignoring the saved tweak
     ?page=Home|Topics|Projects|Notes|About → boot straight to that screen
   Used by the Library Fit Comparison page to render the same screen in several
   fits side by side. Harmless in normal use (no params → normal behaviour). */
const _URLP = (typeof location !== 'undefined') ? new URLSearchParams(location.search) : new URLSearchParams();
const FIT_OVERRIDE = _URLP.get('fit');
const PAGE_OVERRIDE = _URLP.get('page');
const _PAGES = ['Home', 'Topics', 'Projects', 'Notes', 'About'];

function App() {
  const [page, setPage] = uS(_PAGES.includes(PAGE_OVERRIDE) ? PAGE_OVERRIDE : 'Home');
  const [entry, setEntry] = uS(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  uE(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      document.body.classList.add('reduce-motion');
  }, []);
  // Scale the fixed 1180×820 iPad canvas to fit the viewport (contain), so a
  // desktop monitor renders an upscaled copy of the iPad layout — same proportions.
  uE(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / 1180, window.innerHeight / 820);
      document.documentElement.style.setProperty('--ipad-scale', s);
      // same mechanism for the fixed 1920×1080 HD canvas fit
      const h = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      document.documentElement.style.setProperty('--hd-scale', h);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  uE(() => {
    const r = document.documentElement;
    r.setAttribute('data-ambience', 'day');
    r.setAttribute('data-material', t.material);
    r.setAttribute('data-energy', 'lively');
    r.setAttribute('data-capsule', 'plain');
    r.setAttribute('data-fit', FIT_OVERRIDE || t.fit || 'fluid');
    /* Phase 5: flat-composed is THE look (shiny retired). Flat Lab-paper tray on Topics + Home + Projects (Lab). */
    r.setAttribute('data-tilemat', 'flat-composed');
    r.setAttribute('data-traymat', (page === 'Topics' || page === 'Home' || page === 'Projects') ? 'flat' : 'glass');
  }, [t.material, t.fit, page]);

  const onOpen = (e) => setEntry(e);
  const nav = (p) => { setPage(p); document.querySelector('.stage')?.scrollTo(0, 0); };
  const onRandom = () => { const p = ZMATH_PROJECTS[Math.floor(Math.random() * ZMATH_PROJECTS.length)]; setEntry({ type: 'project', data: p }); };
  const screens = { Home: HomeScreen, Topics: TopicsScreen, Projects: ProjectsScreen, Notes: NotesScreen, About: AboutScreen };
  const Screen = screens[page];
  const navStyle = OS_LABEL_STYLES.menu;
  const eyebrows = {
    home: navStyle.home,
    topics: navStyle.topics(ZMATH_TOPICS.length),
    projects: navStyle.projects(ZMATH_PROJECTS.length),
    notes: navStyle.notes,
    about: navStyle.about,
  };

  return (
    <div className="os">
      <RotateGuard />
      <Sidebar page={page} setPage={(p) => { setPage(p); document.querySelector('.stage')?.scrollTo(0, 0); }}
               searchInRail={true} onSearch={() => nav('Topics')} capsuleDepth="raised" homeMaterial="color" homeIconFinish="glossy" iconFinish={t.iconMat} />
      <main className="stage">
        <div className="stage-inner">
          <Screen key={page} onOpen={onOpen} go={nav} eyebrows={eyebrows} />
        </div>
      </main>
      <Modal entry={entry && entry.type !== 'note' ? entry : null} onClose={() => setEntry(null)} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Display size" />
        <TweakRadio label="Fit" value={t.fit}
                    options={['ipad', 'fluid', 'desktop', 'hd']}
                    onChange={(v) => setTweak('fit', v)} />
        <TweakSection label="Material" />
        <TweakRadio label="Chrome" value={t.material}
                    options={['liquid', 'frosted']}
                    onChange={(v) => setTweak('material', v)} />
        <TweakRadio label="Icons" value={t.iconMat}
                    options={['glossy', 'flat']}
                    onChange={(v) => setTweak('iconMat', v)} />
      </TweaksPanel>
    </div>
  );
}

export { App };
