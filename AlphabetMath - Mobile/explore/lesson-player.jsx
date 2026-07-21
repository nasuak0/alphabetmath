/* Lesson Player — screen shell: left white panel (words) + right graph.
   Beats unlock pages; progress persists in localStorage. */
(function () {
  const { useState, useEffect, useMemo } = React;
  const SECTIONS = window.LESSON_SECTIONS;
  const LS_KEY = 'zmath-lp6';

  const load = () => { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); if (v && typeof v.idx === 'number') return v; } catch (e) { } return { idx: 0, unlocked: 0 }; };

  const IcoReset = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4" /><path d="M3 4v5h5" /></svg>;
  const IcoTag = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h7l9 9-7 7-9-9z" /><circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" /></svg>;

  function Controls({ section, s, setS }) {
    return <div className="lp-controls">
      {section.controls.map((c, i) => {
        if (c.kind === 'slider') {
          const red = c.var !== 'q' && c.var !== 'b';
          return <label key={i} className={'lp-ctl-lab ' + (red ? 'p' : 'q')}>
            <span className={red ? 'vr' : 'vb'} style={{ width: 16, fontStyle: 'italic' }}>{c.label}</span>
            <input type="range" className={'lp-slider' + (red ? '' : ' q')} min={c.min} max={c.max} value={s[c.var]}
              onChange={e => setS(v => ({ ...v, [c.var]: +e.target.value }))} />
            <span className="chip">{s[c.var]}</span>
          </label>;
        }
        if (c.kind === 'presets') return <div key={i}>
          <div className="lp-ctl-cap">{c.label}</div>
          <div className="lp-chips">{c.items.map(it =>
            <button key={it.n} type="button" className={'lp-chip' + (s.p === it.p && s.q === it.q ? ' on' : '')}
              onClick={() => setS(v => ({ ...v, p: it.p, q: it.q }))}>√{it.n}</button>)}
          </div>
        </div>;
        if (c.kind === 'toggle') return <button key={i} type="button" className="lp-toggle" onClick={() => setS(v => ({ ...v, [c.var]: !v[c.var] }))}>
          <span className="lp-tgl-tx"><span className="lp-tgl-t">{c.title}</span><span className="lp-tgl-s">{c.sub}</span></span>
          <span className={'lp-switch' + (s[c.var] ? ' on' : '')}><span /></span>
        </button>;
        if (c.kind === 'split') return <div key={i} className="lp-chips">
          {[['grid', 'Grid split'], ['tilted', 'Tilted split']].map(([v, t]) =>
            <button key={v} type="button" className={'lp-chip' + (s.split === v ? ' on' : '')} onClick={() => setS(st => ({ ...st, split: v }))}>{t}</button>)}
        </div>;
        return null;
      })}
    </div>;
  }

  function App() {
    const init = useMemo(load, []);
    const [idx, setIdx] = useState(Math.min(init.idx, SECTIONS.length - 1));
    const [unlocked, setUnlocked] = useState(init.unlocked);
    const [s, setS] = useState({ ...window.LESSON_INITIAL });
    const [labels, setLabels] = useState(true);
    const [help, setHelp] = useState(false);
    const [t, setTweak] = useTweaks({ unlockAll: false, palette: 'Notebook' });
    const sec = SECTIONS[idx];
    const gate = SECTIONS.length - 1;
    const done = sec.beat.test(s);

    useEffect(() => { if (done && idx >= unlocked && idx + 1 <= SECTIONS.length - 1) setUnlocked(idx + 1); }, [done]);
    useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify({ idx, unlocked })); } catch (e) { } }, [idx, unlocked]);
    useEffect(() => {
      const pal = { Notebook: ['#c8322f', '#2f4bce'], Warm: ['#b4552d', '#1f7a86'], Print: ['#a81e3c', '#3b3f9e'] }[t.palette] || ['#c8322f', '#2f4bce'];
      const r = document.documentElement.style;
      r.setProperty('--red-var', pal[0]); r.setProperty('--blue-var', pal[1]);
    }, [t.palette]);
    useEffect(() => { setHelp(false); }, [idx]);

    const go = (i) => { if (i <= gate) setIdx(i); };
    const reset = () => setS({ ...window.LESSON_INITIAL });

    return <div className="lp-sheet">
      <div className="lp-left">
        <div className="lp-head">
          <div className="lp-tag"><span>{sec.tag[0]}</span><span>{sec.tag[1]}</span></div>
          <div className="lp-headtx">
            <div className="lp-sym" dangerouslySetInnerHTML={{ __html: sec.sym }} />
            <div className="lp-name">{sec.name}</div>
          </div>
        </div>
        <div className="lp-body">
          <div className="lp-facts">{sec.facts(s).map((f, i) =>
            <div key={i} className="lp-fact"><span className="lp-fact-k">{f.k}</span><span className="lp-fact-v" dangerouslySetInnerHTML={{ __html: f.html }} /></div>)}
          </div>
          <p className="lp-lede" dangerouslySetInnerHTML={{ __html: sec.lede }} />
          {sec.note && <div className="lp-note" dangerouslySetInnerHTML={{ __html: sec.note }} />}
          <Controls section={sec} s={s} setS={setS} />
          <div className={'lp-beat' + (done ? ' done' : '')}>{sec.beat.text}<b>{done ? '✓' : '···'}</b></div>
        </div>
        <div className="lp-foot">
          <div className="lp-dots">{SECTIONS.map((x, i) =>
            <button key={i} type="button" aria-label={'Page ' + (i + 1)}
              className={'lp-dot' + (i === idx ? ' on' : ' done')}
              onClick={() => go(i)} />)}
          </div>
          <span className="lp-pageno">{idx + 1} / {SECTIONS.length}</span>
          <button type="button" className="lp-arrow" style={{ marginLeft: 'auto' }} aria-label="Previous page" disabled={idx === 0} onClick={() => go(idx - 1)}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5L8 12l6.5 6.5" /></svg>
          </button>
          <button type="button" className="lp-arrow" aria-label="Next page" disabled={idx >= SECTIONS.length - 1} onClick={() => go(idx + 1)}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 5.5L16 12l-6.5 6.5" /></svg>
          </button>
        </div>
      </div>
      <div className="lp-right" data-screen-label={'Section ' + (idx + 1)}>
        <LessonGraph mode={sec.mode} minQ={sec.trapMode ? 1 : 0} state={s} labels={labels} setState={setS} sectionId={sec.id} />
        <button type="button" className="lp-close" title="Close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="lp-cc l">
          <button type="button" className="lp-cbtn" title="Reset this page" onClick={reset}><IcoReset /></button>
          <button type="button" className={'lp-cbtn' + (labels ? ' on' : '')} title="Coordinates & labels" onClick={() => setLabels(l => !l)}><IcoTag /></button>
        </div>
        <div className="lp-cc r">
          <button type="button" className={'lp-cbtn' + (help ? ' on' : '')} title="Help" onClick={() => setHelp(h => !h)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9.2 9a3 3 0 1 1 4.6 2.5c-1 .7-1.8 1.2-1.8 2.5" /><circle cx="12" cy="18.2" r="0.5" fill="currentColor" /></svg>
          </button>
        </div>
        {help && <div className="lp-help">
          <b>How this page works</b>
          <p>The words on the left and the drawing here are the same thing — move a control and both follow.</p>
          <p>Each page has a little beat to try — <i>{sec.beat.text.toLowerCase()}</i>. ⟲ resets, the tag toggles coordinates.</p>
        </div>}
      </div>
      <TweaksPanel title="Lesson Player">
        <TweakSection label="Variables" />
        <TweakRadio label="Ink pair" value={t.palette} options={['Notebook', 'Warm', 'Print']} onChange={v => setTweak('palette', v)} />
        <TweakSection label="Review" />
        <TweakToggle label="Unlock all pages" value={t.unlockAll} onChange={v => setTweak('unlockAll', v)} />
      </TweaksPanel>
    </div>;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
