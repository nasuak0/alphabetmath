/* Shared notebook state — the ONE pair of numbers a note owns.
   Everything (figure, formula, table, prose, exercises) reads from here, so
   nothing can drift out of sync. Pilot vars: p, q. */
(function () {
  const NBCtx = React.createContext(null);
  const useNotebook = () => React.useContext(NBCtx);

  /* eased mirror of the numbers — the figure glides, the numbers snap */
  function useEased(v) {
    const keys = Object.keys(v);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [d, setD] = React.useState(v);
    const ref = React.useRef(v), raf = React.useRef(0);
    React.useEffect(() => {
      cancelAnimationFrame(raf.current);
      if (reduce) { ref.current = v; setD(v); return; }
      const step = () => {
        const c = ref.current, next = {}; let done = true;
        for (const k of keys) {
          const n = c[k] + (v[k] - c[k]) * 0.28;
          if (Math.abs(v[k] - n) >= 0.0015) done = false;
          next[k] = done ? v[k] : n;
        }
        const out = done ? { ...v } : next;
        ref.current = out; setD(out);
        if (!done) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf.current);
    }, [JSON.stringify(v), reduce]);
    return d;
  }

  function NotebookProvider({ vars, children }) {
    const [v, setV] = React.useState(vars);
    const set = React.useCallback(
      (patch) => setV(o => ({ ...o, ...(typeof patch === 'function' ? patch(o) : patch) })), []);
    const disp = useEased(v);
    const value = React.useMemo(() => ({ v, set, disp }), [v, set, disp]);
    return <NBCtx.Provider value={value}>{children}</NBCtx.Provider>;
  }

  /* tiny expression evaluator over the notebook's numbers.
     Content is ours, so a compiled Function is fine — cached per expression. */
  const cache = new Map();
  function nbEval(expr, v) {
    const keys = Object.keys(v).sort(), sig = keys.join(',') + '|' + expr;
    let fn = cache.get(sig);
    if (!fn) {
      try { fn = new Function(...keys, 'return (' + expr + ')'); }
      catch (e) { fn = () => '?'; }
      cache.set(sig, fn);
    }
    try {
      const out = fn(...keys.map(k => v[k]));
      return typeof out === 'number' ? (Number.isInteger(out) ? out : +out.toFixed(3)) : out;
    } catch (e) { return '?'; }
  }

  /* {{expr}} inside an HTML string becomes a live, highlighted number */
  function nbFill(html, v) {
    return String(html).replace(/\{\{([^}]+)\}\}/g,
      (_, e) => '<b class="nb-live">' + nbEval(e.trim(), v) + '</b>');
  }

  Object.assign(window, { NBCtx, useNotebook, NotebookProvider, nbEval, nbFill });
})();
