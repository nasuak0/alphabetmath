/* Article blocks that read the notebook's numbers. Same block shapes as the
   live reader (sec / sub / p / box / table / kit) plus live tokens. */
(function () {
  /* prose + boxes: {{expr}} becomes a live number */
  function NBBlock({ b }) {
    const { v } = useNotebook();
    if (b.sec) return <div className="rd-sec"><h2 className="rd-sec-t"><span className="rd-sec-n">{b.sec}</span>{b.t}</h2></div>;
    if (b.sub) return <h3 className="rd-sub">{b.sub}</h3>;
    if (b.p) return <p className="rd-p" dangerouslySetInnerHTML={{ __html: nbFill(b.p, v) }} />;
    if (b.box) return (
      <div className="rd-box nb-box">
        <span className="eq" dangerouslySetInnerHTML={{ __html: b.box }} />
        {b.live && <span className="nb-boxlive" dangerouslySetInnerHTML={{ __html: nbFill(b.live, v) }} />}
      </div>
    );
    if (b.table) return <NBTable t={b.table} />;
    if (b.kit) return <NBStickyFigure cap={b.cap} />;
    return null;
  }

  /* the 8-row table: the row matching the current step lights up, and any row
     can be tapped to move the notebook there */
  function NBTable({ t }) {
    const { v, set } = useNotebook();
    return (
      <div className="rd-table-wrap nb-table-wrap">
        <table className="rd-table nb-table">
          <thead><tr>{t.cols.map((c, i) => <th key={i} dangerouslySetInnerHTML={{ __html: c }} />)}</tr></thead>
          <tbody>
            {t.rows.map((r, i) => {
              const on = r.pq[0] === v.p && r.pq[1] === v.q;
              return (
                <tr key={i} className={'nb-trow' + (on ? ' on' : '')} onClick={() => set({ p: r.pq[0], q: r.pq[1] })}
                    title={`Set the notebook to (${r.pq[0]}, ${r.pq[1]})`}>
                  {r.cells.map((c, j) => <td key={j} dangerouslySetInnerHTML={{ __html: c }} />)}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="nb-tablehint">Tap any row to move the figure there.</p>
      </div>
    );
  }

  /* the figure stays in view while its section scrolls past */
  function NBStickyFigure({ cap }) {
    const [expanded, setExpanded] = React.useState(false);
    return (
      <figure className="rd-figure nb-sticky">
        <div className="nb-figcard">
          <NBFigure expanded={expanded} />
          <button type="button" className="nb-expand" onClick={() => setExpanded(x => !x)}>
            {expanded ? 'Hide the working' : 'Show the working'}
          </button>
        </div>
        {cap && <figcaption className="rd-cap" dangerouslySetInnerHTML={{ __html: cap }} />}
      </figure>
    );
  }

  /* exercise whose answer is COMPUTED from the notebook, never typed in twice */
  function NBExercise({ ex, n }) {
    const { set } = useNotebook();
    const [val, setVal] = React.useState('');
    const [state, setState] = React.useState(null);
    const [reveal, setReveal] = React.useState(false);
    const answer = nbEval(ex.answerExpr, ex.at);
    const check = () => {
      const got = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
      setState(!isNaN(got) && got === answer ? 'right' : 'wrong');
    };
    return (
      <div className={'rail-ex' + (state ? ' ' + state : '')}>
        <div className="rail-ex-n">Exercise {n}</div>
        <div className="rail-ex-q" dangerouslySetInnerHTML={{ __html: ex.q }} />
        <button type="button" className="nb-showme" onClick={() => set(ex.at)}>
          Show me this &#8594; <i>({ex.at.p}, {ex.at.q})</i>
        </button>
        <div className="rail-ex-row">
          <input className="rail-ex-in" value={val} placeholder="your answer" inputMode="text"
                 onChange={e => { setVal(e.target.value); setState(null); }}
                 onKeyDown={e => { if (e.key === 'Enter') check(); }} />
          <button className="rail-ex-check" onClick={check}>Check</button>
        </div>
        {state === 'right' && <div className="rail-ex-fb ok">Correct &#10003;</div>}
        {state === 'wrong' && <div className="rail-ex-fb no">Not quite &mdash; try again.</div>}
        <button className="rail-ex-reveal" onClick={() => setReveal(r => !r)}>{reveal ? 'Hide solution' : 'Show solution'}</button>
        {reveal && <div className="rail-ex-sol" dangerouslySetInnerHTML={{ __html: nbFill(ex.sol, ex.at) }} />}
      </div>
    );
  }

  Object.assign(window, { NBBlock, NBTable, NBStickyFigure, NBExercise });
})();
