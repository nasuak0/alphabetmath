/* Lesson Player — content model for note n6
   ("Square Roots, Geometric Areas & the Pythagorean Theorem").

   ONE shared state object drives both the left panel and the right graph:
     { p, q, n, a, b, showTrap, showRoutes, split, showParts }
   Each section reads the fields it needs. Colour convention throughout:
     RED  = p / a / first leg / vector a      (var --red-var, class .r)
     BLUE = q / b / the square / area / hyp    (var --blue-var, class .b)

   Every section declares:
     tag    [top,bottom]  — the stacked "55/25" badge (here: step / total)
     sym    HTML          — the big symbol header (variables coloured)
     name                 — section title (like "Manganese")
     mode                 — which graph renderer to use
     lede   HTML          — the concise paragraph (main idea only)
     facts(s) -> [{k,html}]  live fact rows
     controls             — control descriptors the panel renders
     beat   {text, test(s)}  the one action that unlocks the next page
   Exposes window.LESSON_SECTIONS. */
(function () {
  const R = (t) => `<span class="r">${t}</span>`;
  const B = (t) => `<span class="b">${t}</span>`;
  const N = (t) => `<span class="n">${t}</span>`;
  const rad = (t) => `&#8730;<span style="border-top:1.5px solid currentColor;padding:0 2px">${t}</span>`;
  const sq = '<sup>2</sup>';

  const SECTIONS = [
    /* ---------- 1 · the step ---------- */
    {
      id: 'step', mode: 'step', name: 'Every square is a step',
      tag: ['01', '06'],
      sym: `(${R('p')},&#8202;${B('q')})`,
      lede: `Pick a <b>step</b> — ${R('p')} across, ${B('q')} up — and make it one side of a square. Its corners land on grid points and its area is always ${R('p')}${sq} + ${B('q')}${sq}. A perfect square is just the flat case ${B('q')} = 0.`,
      facts: (s) => [
        { k: 'Step (p, q)', html: `(${R(s.p)}, ${B(s.q)})` },
        { k: 'Side', html: `${rad(`${R(s.p)}${sq}+${B(s.q)}${sq}`)}` },
        { k: 'Area', html: `${R(s.p)}${sq} + ${B(s.q)}${sq} = <b>${s.p * s.p + s.q * s.q}</b>` },
      ],
      controls: [
        { kind: 'slider', var: 'p', label: 'p', min: 1, max: 4 },
        { kind: 'slider', var: 'q', label: 'q', min: 0, max: 4 },
        { kind: 'presets', label: 'Jump to area', items: [{ p: 1, q: 1, n: 2 }, { p: 1, q: 2, n: 5 }, { p: 2, q: 3, n: 13 }] },
      ],
      beat: { text: 'Drag q to 0 — flatten it', test: (s) => s.q === 0 },
    },

    /* ---------- 2 · trap & peel ---------- */
    {
      id: 'trap', mode: 'step', name: 'Trap and peel', trapMode: true,
      tag: ['02', '06'],
      sym: `${R('p')}${sq}+${B('q')}${sq}`,
      lede: `Trap the tilted square in the smallest upright square — side ${R('p')}+${B('q')}. Four right triangles fill the corners, each ½${R('p')}${B('q')}. Peel them off and only the tilt is left.`,
      note: `(${R('p')}+${B('q')})${sq} − 4·½${R('p')}${B('q')} = ${R('p')}${sq} + ${B('q')}${sq}`,
      facts: (s) => [
        { k: 'Bounding square', html: `(${R(s.p)}+${B(s.q)})${sq} = <b>${(s.p + s.q) ** 2}</b>` },
        { k: 'Four corners', html: `4·½·${R(s.p)}·${B(s.q)} = <b>${2 * s.p * s.q}</b>` },
        { k: 'What remains', html: `${(s.p + s.q) ** 2} − ${2 * s.p * s.q} = <b>${s.p * s.p + s.q * s.q}</b>` },
      ],
      controls: [
        { kind: 'slider', var: 'p', label: 'p', min: 1, max: 4 },
        { kind: 'slider', var: 'q', label: 'q', min: 1, max: 4 },
        { kind: 'toggle', var: 'showTrap', title: 'Show the trap', sub: 'Bounding square & four offcuts' },
      ],
      beat: { text: 'Toggle the trap on', test: (s) => s.showTrap === true },
    },

    /* ---------- 3 · cross product = signed area ---------- */
    {
      id: 'cross', mode: 'cross', name: 'Area as a cross product',
      tag: ['03', '06'],
      sym: `${B('b')}&#8202;&times;&#8202;${R('a')}`,
      lede: `The vectors ${B('b')} = (−6, 4) and ${R('a')} = (2, 3) are perpendicular, so they span a rectangle. Its area is the cross product — and three different counts all land on <b>26</b>.`,
      note: `${B('b')}&times;${R('a')} = (−6)(3) − (4)(2) = −26`,
      facts: (s) => [
        { k: 'Dot product', html: `(−6)(2)+(4)(3) = <b>0</b>` },
        { k: 'Cross product', html: `(−6)(3) − (4)(2) = <b>−26</b>` },
        { k: 'Rectangle area', html: `<b>26</b>` },
      ],
      controls: [
        { kind: 'toggle', var: 'showRoutes', title: 'Show the count', sub: 'Determinant · box · grid' },
      ],
      beat: { text: 'Reveal how 26 is counted', test: (s) => s.showRoutes === true },
    },

    /* ---------- 4 · √2 from the inscribed square ---------- */
    {
      id: 'inscribe', mode: 'inscribe', name: 'Why √2 × √2 = 2',
      tag: ['04', '06'],
      sym: rad('2'),
      lede: `Join the midpoints of an ${R('n')}×${R('n')} grid to inscribe a tilted square. Peel four triangles and its area is ${R('n')}${sq} − ${R('n')}${sq}/2. At ${R('n')} = 2 that area is exactly <b>2</b> — so its side is ${rad('2')}.`,
      facts: (s) => {
        const area = s.n * s.n / 2;
        const nice = Number.isInteger(area) ? area : area.toFixed(1);
        return [
          { k: 'Grid', html: `${R(s.n)} × ${R(s.n)}` },
          { k: 'Inscribed area', html: `${R(s.n)}${sq} − ${R(s.n)}${sq}/2 = <b>${nice}</b>` },
          { k: 'Side', html: `${rad(`<b>${nice}</b>`)}` },
        ];
      },
      controls: [
        { kind: 'slider', var: 'n', label: 'n', min: 2, max: 4 },
      ],
      beat: { text: 'Slide n to 2 — the √2 case', test: (s) => s.n === 2 },
    },

    /* ---------- 5 · the Pythagorean proof ---------- */
    {
      id: 'pythag', mode: 'pythag', name: 'Pythagoras, proved',
      tag: ['05', '06'],
      sym: `${R('a')}${sq}+${B('b')}${sq}=${N('c')}${sq}`,
      lede: `The same (${R('a')}+${B('b')})${sq} square, split two ways. As a grid it is ${R('a')}${sq} + 2${R('a')}${B('b')} + ${B('b')}${sq}; as four triangles round a tilt it is ${N('c')}${sq} + 2${R('a')}${B('b')}. Cancel the triangles.`,
      note: `${R('a')}${sq} + ${B('b')}${sq} = ${N('c')}${sq}`,
      facts: (s) => [
        { k: 'Legs', html: `a = ${R(s.a)}, &nbsp;b = ${B(s.b)}` },
        { k: 'Hypotenuse', html: `${N('c')} = ${rad(`${s.a}${sq}+${s.b}${sq}`)} = <b>${round(Math.hypot(s.a, s.b))}</b>` },
        { k: 'c²', html: `${s.a * s.a} + ${s.b * s.b} = <b>${s.a * s.a + s.b * s.b}</b>` },
      ],
      controls: [
        { kind: 'slider', var: 'a', label: 'a', min: 1, max: 4 },
        { kind: 'slider', var: 'b', label: 'b', min: 1, max: 4 },
        { kind: 'split' },
      ],
      beat: { text: 'Flip to the tilted split', test: (s) => s.split === 'tilted' },
    },

    /* ---------- 6 · (a+b)² cheat sheet ---------- */
    {
      id: 'expand', mode: 'expand', name: 'The building block',
      tag: ['06', '06'],
      sym: `(${R('a')}+${B('b')})${sq}`,
      lede: `Everything rested on one picture: an (${R('a')}+${B('b')})${sq} square cuts into ${R('a')}${sq}, two copies of ${R('a')}${B('b')}, and ${B('b')}${sq}. Reveal the four regions to read the identity straight off the grid.`,
      note: `(${R('a')} + ${B('b')})${sq} = ${R('a')}${sq} + 2${R('a')}${B('b')} + ${B('b')}${sq}`,
      facts: (s) => [
        { k: 'a² + b²', html: `${s.a * s.a} + ${s.b * s.b} = <b>${s.a * s.a + s.b * s.b}</b>` },
        { k: '2ab', html: `2·${R(s.a)}·${B(s.b)} = <b>${2 * s.a * s.b}</b>` },
        { k: 'Total (a+b)²', html: `<b>${(s.a + s.b) ** 2}</b>` },
      ],
      controls: [
        { kind: 'slider', var: 'a', label: 'a', min: 1, max: 4 },
        { kind: 'slider', var: 'b', label: 'b', min: 1, max: 4 },
        { kind: 'toggle', var: 'showParts', title: 'Reveal the four regions', sub: 'a², ab, ab, b²' },
      ],
      beat: { text: 'Reveal the four regions', test: (s) => s.showParts === true },
    },
  ];

  function round(x) { return Number.isInteger(x) ? x : x.toFixed(2); }

  // one shared state; sections read what they need
  const INITIAL_STATE = { p: 2, q: 1, n: 3, a: 3, b: 4, showTrap: false, showRoutes: false, split: 'grid', showParts: false };

  window.LESSON_SECTIONS = SECTIONS;
  window.LESSON_INITIAL = INITIAL_STATE;
})();
