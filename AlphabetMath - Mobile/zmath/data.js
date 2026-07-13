/* Zmath home-menu — sample portfolio content.
   Topics reuse the design system's subject pastels; each gets a vivid
   "cover art" gradient + a generated math pattern scene. */

export const ZMATH_TOPICS = [
  { id:'algebra',  n:'01', sym:'Al', name:'Algebra',        color:'rose',   ink:'rose-ink',   scene:'symmetry', grad:['#ff7a9c','#c2326b'], blurb:'Groups, rings, and the shapes of symmetry.' },
  { id:'geometry', n:'02', sym:'Ge', name:'Geometry',       color:'peach',  ink:'peach-ink',  scene:'tiling',   grad:['#ffac5e','#e0702a'], blurb:'Curvature, tilings, and constructions.' },
  { id:'calculus', n:'03', sym:'Ca', name:'Calculus',       color:'butter', ink:'butter-ink', scene:'curves',   grad:['#ffce4d','#e0962a'], blurb:'Limits, flows, and the infinitely small.' },
  { id:'linalg',   n:'04', sym:'La', name:'Linear Algebra', color:'sky',    ink:'sky-ink',    scene:'vectors',  grad:['#5b8def','#3147bc'], blurb:'Vectors, matrices, transformations.' },
  { id:'numberth', n:'05', sym:'Nt', name:'Number Theory',  color:'mint',   ink:'mint-ink',   scene:'contour',  grad:['#2fd3b0','#159c7e'], blurb:'Primes, lattices, and Diophantine games.' },
  { id:'prob',     n:'06', sym:'Pr', name:'Probability',    color:'lilac',  ink:'lilac-ink',  scene:'lattice',  grad:['#a06ee0','#6a36b5'], blurb:'Randomness, chains, and expectation.' },
  { id:'analysis', n:'07', sym:'An', name:'Analysis',       color:'blush',  ink:'blush-ink',  scene:'epsilon',  grad:['#ff8e72','#d8512f'], blurb:'Rigor behind the calculus, made visual.' },
  { id:'logic',    n:'08', sym:'Lo', name:'Logic',          color:'coral',  ink:'coral-ink',  scene:'gates',    grad:['#f0686b','#c23035'], blurb:'Proof, computability, and paradox.' },
];

export const ZMATH_TByID = Object.fromEntries(ZMATH_TOPICS.map(t => [t.id, t]));

export const ZMATH_PROJECTS = [
  { id:'p7', topic:'analysis', title:'Riemann sum',       kind:'Interactive', year:'2026', desc:'Slice the area under a curve into rectangles and watch the sum sharpen into the integral as the partition shrinks.' },
  { id:'p1', topic:'geometry', title:'Knot Atlas',        kind:'Interactive', year:'2026', desc:'Drag the strands of every prime knot up to nine crossings and watch its invariants update live.' },
  { id:'p2', topic:'linalg',   title:'Matrix Playground', kind:'Interactive', year:'2026', desc:'Compose transformations on the plane and see eigenvectors snap into place in real time.' },
  { id:'p3', topic:'numberth', title:'Prime Spiral',      kind:'Demo',        year:'2025', desc:'The Ulam spiral, animated — pan across a million integers and find the hidden diagonals.' },
  { id:'p4', topic:'calculus', title:'Heat on a Wire',    kind:'Demo',        year:'2025', desc:'Set an initial temperature and watch the heat equation smooth it out, step by step.' },
  { id:'p5', topic:'geometry', title:'Penrose Studio',    kind:'Interactive', year:'2025', desc:'Lay down aperiodic tiles by hand and let the matching rules guide your next move.' },
  { id:'p6', topic:'prob',     title:'Random Walks',      kind:'Demo',        year:'2024', desc:'Race a thousand walkers and watch the bell curve assemble itself from pure chance.' },
];
export const ZMATH_PByID = Object.fromEntries(ZMATH_PROJECTS.map(p => [p.id, p]));

export const ZMATH_NOTES = [
  { id:'n6', title:'Square Roots, Geometric Areas & the Pythagorean Theorem', topic:'geometry', date:'Apr 18, 2026', read:'12 min',
    dek:'',
    body:[
      { sec:'1', t:'Drawing Squares: What Is a Square Root?' },
      { sub:'The central idea' },
      { p:'Every positive integer <i>n</i> is the area of some square, and that square&rsquo;s <em>side length</em> is, by definition, &#8730;<i>n</i>. So a square root is never just a number off a calculator &mdash; it is a <em>length you can draw</em>. The only real question is how to draw a square of area <i>n</i> when <i>n</i> is awkward.' },
      { sub:'Every square is a step (p, q)' },
      { p:'One move handles all of them at once. Choose a <em>step</em> &mdash; <i>p</i> units across and <i>q</i> units up &mdash; and let that be one side of the square. Its four corners always land on grid points, and its area always comes out to <i>p</i>&sup2; + <i>q</i>&sup2;. A perfect square is simply the flat case <i>q</i> = 0: no tilt, area <i>p</i>&sup2;. Raise <i>q</i> and the same square tilts, reaching the in-between values 2, 5, 8, 13&hellip; There are not two kinds of square &mdash; there is one rule, seen from two angles.' },
      { fig:'tiltedSquares', cap:'<b>Figure 1.</b> One square, one step (<i>p</i>, <i>q</i>). Drag <i>q</i> down to 0 and it lies flat &mdash; a perfect square of area <i>p</i>&sup2;; raise <i>q</i> and it tilts to area <i>p</i>&sup2; + <i>q</i>&sup2;. The corners track the step.' },
      { sub:'Trap and peel: why the area is p² + q²' },
      { p:'To measure a tilted square, <em>trap</em> it inside the smallest upright square that contains it &mdash; that bounding square has side <i>p</i> + <i>q</i>. Four identical right triangles fill the corners, each with legs <i>p</i> and <i>q</i>, so each has area &frac12;<i>pq</i>. <em>Peel</em> all four away and only the tilted square is left:' },
      { box:'(<i>p</i>+<i>q</i>)&sup2; &minus; 4&middot;&frac12;<i>pq</i> = (<i>p</i>+<i>q</i>)&sup2; &minus; 2<i>pq</i> = <i>p</i>&sup2; + <i>q</i>&sup2;' },
      { p:'Flatten the square back to <i>q</i> = 0 and the four corners shrink to nothing &mdash; the bounding square <em>is</em> the square, and the formula collapses to plain <i>p</i>&sup2;. Same identity, no special case. The table below reads straight off the step: the first three rows are flat (<i>q</i> = 0, whole-number sides), then the square tilts.' },
      { table:{ cols:['<i>n</i>', 'Step (<i>p</i>,<i>q</i>)', 'Side', 'Area check'], rows:[
        ['1', '(1, 0)', '&#8730;1 = 1', '(1+0)&sup2; &minus; 2(1)(0) = 1'],
        ['4', '(2, 0)', '&#8730;4 = 2', '(2+0)&sup2; &minus; 2(2)(0) = 4'],
        ['9', '(3, 0)', '&#8730;9 = 3', '(3+0)&sup2; &minus; 2(3)(0) = 9'],
        ['2', '(1, 1)', '&#8730;2', '(1+1)&sup2; &minus; 2(1)(1) = 2'],
        ['5', '(1, 2)', '&#8730;5', '(1+2)&sup2; &minus; 2(1)(2) = 5'],
        ['8', '(2, 2)', '&#8730;8', '(2+2)&sup2; &minus; 2(2)(2) = 8'],
        ['13', '(2, 3)', '&#8730;13', '(2+3)&sup2; &minus; 2(2)(3) = 13'],
        ['25', '(3, 4)', '&#8730;25 = 5', '(3+4)&sup2; &minus; 2(3)(4) = 25'],
      ] } },
      { sub:'The exponent law behind the notation' },
      { box:'<i>x</i><sup>1/2</sup> &middot; <i>x</i><sup>1/2</sup> = <i>x</i><sup>1/2+1/2</sup> = <i>x</i><sup>2/2</sup> = <i>x</i><sup>1</sup> = <i>x</i>' },
      { p:'Squaring <i>x</i><sup>1/2</sup> returns <i>x</i>, so <i>x</i><sup>1/2</sup> is precisely the square root. The notation is not cosmetic — it is forced by the exponent-addition rule.' },

      { sec:'2', t:'Smoke and Mirrors: Area as a Cross Product' },
      { sub:'Two perpendicular vectors' },
      { p:'Take <strong>b</strong> = (&minus;6, 4) and <strong>a</strong> = (2, 3). Their dot product (&minus;6)(2) + (4)(3) = &minus;12 + 12 = 0, so they are <strong>perpendicular</strong>. Two perpendicular vectors span a <em>rectangle</em>, so their cross product gives the rectangle&rsquo;s area directly.' },
      { fig:'crossVectors', cap:'<b>Figure 2.</b> The perpendicular vectors <strong>b</strong> and <strong>a</strong> (note the right angle at the origin) span a blue rectangle of area 26.' },
      { sub:'The cross product formula' },
      { box:'<strong>b</strong>&times;<strong>a</strong> = <i>b</i><sub>1</sub><i>a</i><sub>2</sub> &minus; <i>b</i><sub>2</sub><i>a</i><sub>1</sub> = (&minus;6)(3) &minus; (4)(2) = &minus;18 &minus; 8 = &minus;26' },
      { p:'The magnitude 26 is the rectangle&rsquo;s area. The sign records orientation — here <strong>a</strong> lies clockwise from <strong>b</strong>.' },
      { sub:'The machine in the background' },
      { p:'Beside the vectors the notebook draws an (<i>a</i>+<i>b</i>)&times;(<i>a</i>+<i>b</i>) square split into four right triangles (each of area &frac12;<i>ab</i>) around a central tilted square of area <i>a</i>&sup2; + <i>b</i>&sup2;. This is the same structure that will drive the Pythagorean proof.' },
      { fig:'machineSquare', cap:'<b>Figure 3.</b> The &ldquo;machine in the background&rdquo;: four congruent right triangles packed around a central tilted square inside an (<i>a</i>+<i>b</i>)&sup2; envelope.' },

      { sec:'3', t:'Three Ways to Count 26' },
      { sub:'The partial-product grid' },
      { p:'Expanding <strong>b</strong>&times;<strong>a</strong> as a 2&times;2 table of partial products (with <i>b</i><sub>1</sub> = &minus;6, <i>b</i><sub>2</sub> = 4, <i>a</i><sub>1</sub> = 2, <i>a</i><sub>2</sub> = 3) lands on the same value as the determinant. The cross term is what survives once the diagonal products cancel against the rectangle&rsquo;s offcuts.' },
      { note:'<em>Three routes, one number.</em> The determinant (&minus;26), the bounding-box-minus-four-triangles area, and the partial-product grid all compute the same 26. The whole point is to hold the algebra and the picture in view simultaneously.' },

      { sec:'4', t:'Proving \u221a2 \u00d7 \u221a2 = 2' },
      { sub:'The geometric argument' },
      { p:'Inscribe a tilted square inside a 2&times;2 grid by connecting the midpoints of the four sides. Each corner piece is a right isosceles triangle with legs of length 1.' },
      { fig:'inscribedSqrt2', cap:'<b>Figure 4.</b> The red square is inscribed in a 2&times;2 grid. Removing four isosceles triangles (each of area &frac12;) leaves area = 4 &minus; 2 = 2.' },
      { box:'Area = 2&sup2; &minus; 4&middot;&frac12;(1)(1) = 4 &minus; 2 = 2' },
      { p:'The inscribed square has area 2, so by definition its side is &#8730;2 — and therefore &#8730;2 &times; &#8730;2 = 2.' },
      { sub:'Three routes to the same answer' },
      { table:{ cols:['Route', 'Reasoning', 'Result'], rows:[
        ['Area argument', 'inscribed square has area 2', 'side = &#8730;2'],
        ['Pythagorean theorem', '&#8730;(1&sup2; + 1&sup2;) = &#8730;2', 'side = &#8730;2'],
        ['Exponent law', '(1&sup2; + 1&sup2;)<sup>1/2</sup> = 2<sup>1/2</sup>', '&#8730;2 &middot; &#8730;2 = 2'],
      ] } },

      { sec:'5', t:'Pythagoras\u2019 Theorem: The Proof' },
      { sub:'Two subdivisions of the same square' },
      { p:'Both diagrams below are (<i>a</i>+<i>b</i>)&times;(<i>a</i>+<i>b</i>) squares — the same total area — split in two different ways.' },
      { fig:'pythagTwoSubdiv', cap:'<b>Figure 5.</b> Left: the grid subdivision gives <i>a</i>&sup2; + 2<i>ab</i> + <i>b</i>&sup2;. Right: four triangles plus the inner square give <i>c</i>&sup2; + 2<i>ab</i>. Set them equal and cancel 2<i>ab</i>.' },
      { sub:'The algebra' },
      { box:'<i>a</i>&sup2; + 2<i>ab</i> + <i>b</i>&sup2; = <i>c</i>&sup2; + 2<i>ab</i> &nbsp;&rArr;&nbsp; <i>a</i>&sup2; + <i>b</i>&sup2; = <i>c</i>&sup2;' },
      { sub:'Why the inner quadrilateral is a square, not just a rhombus' },
      { p:'All four triangles are congruent (same <i>a</i>, <i>b</i>, <i>c</i>), so the inner shape has four equal sides — a rhombus. To confirm each angle is 90&deg;, label the two acute angles of a right triangle <i>x</i> and <i>y</i>. Then 90 + <i>x</i> + <i>y</i> = 180, so <i>x</i> + <i>y</i> = 90.' },
      { note:'At each vertex of the inner square, angles <i>x</i> and <i>y</i> from two adjacent triangles meet. Since <i>x</i> + <i>y</i> = 90&deg;, every interior angle is a right angle — confirming the inner quadrilateral is a <em>true square</em>.' },

      { sec:'6', t:'Cheat Sheet: Five Building Blocks' },
      { p:'The notebook distils everything into five lemmas — each one a picture you can redraw from memory.' },
      { sub:'(1) Length adds' },
      { p:'If a segment is composed of sub-lengths <i>a</i> and <i>b</i>, the whole is <i>a</i> + <i>b</i>. The Pythagorean proof uses exactly this for the side of the outer square.' },
      { sub:'(2 & 3) Rectangle and right-triangle area' },
      { fig:'rectTriangle', cap:'<b>Figure 6.</b> Area = base &times; height defines the rectangle; a right triangle is exactly half of an <i>a</i>&times;<i>b</i> rectangle, so its area is &frac12;<i>ab</i>.' },
      { box:'area = <i>a</i> &times; <i>b</i> &nbsp;&middot;&nbsp; &frac12;<i>ab</i> = &frac12; &times; <i>a</i> &times; <i>b</i>' },
      { sub:'(4) Square root from area' },
      { p:'If a square has area <i>x</i>, each side is <i>x</i><sup>1/2</sup> because squaring it returns <i>x</i>. That is what &#8730;<i>x</i> = <i>x</i><sup>1/2</sup> means.' },
      { sub:'(5) Expanding (a + b)\u00b2' },
      { fig:'abSquare', cap:'<b>Figure 7.</b> The (<i>a</i>+<i>b</i>)&sup2; square partitions into <i>a</i>&sup2;, two copies of <i>ab</i>, and <i>b</i>&sup2;.' },
      { box:'(<i>a</i> + <i>b</i>)&sup2; = <i>a</i>&sup2; + 2<i>ab</i> + <i>b</i>&sup2;' },

      { sub:'Summary' },
      { olist:[
        '<strong>Square root = side length.</strong> Every &#8730;<i>n</i> is the side of a square of area <i>n</i>; non-perfect squares are drawn tilted.',
        '<strong>Cross product = signed area.</strong> Perpendicular vectors span a rectangle; the 2&times;2 determinant gives its area.',
        '<strong>Three methods, one answer.</strong> Area 26 confirmed by determinant, bounding-box subtraction, and partial-product analysis.',
        '<strong>&#8730;2 &times; &#8730;2 = 2</strong> follows from the area of the inscribed tilted square inside a 2&times;2 grid.',
        '<strong><i>a</i>&sup2; + <i>b</i>&sup2; = <i>c</i>&sup2;</strong> follows from equating two subdivisions of the same (<i>a</i>+<i>b</i>)&sup2; square and cancelling 2<i>ab</i>.',
        '<strong>Five lemmas suffice:</strong> length, rectangle area, triangle area, &#8730;<i>x</i> = <i>x</i><sup>1/2</sup>, and (<i>a</i>+<i>b</i>)&sup2; = <i>a</i>&sup2; + 2<i>ab</i> + <i>b</i>&sup2;.',
      ] },
    ],
    exercises:[
      { q:'A lattice square is drawn with step (<i>p</i>,<i>q</i>) = (3, 4). What is its area <i>n</i>?', answer:25, sol:'<i>n</i> = <i>p</i>&sup2; + <i>q</i>&sup2; = 9 + 16 = <strong>25</strong>, so the side is &#8730;25 = 5.' },
      { q:'Compute the cross product <span class="ex-mtx">b&times;a</span> for <strong>b</strong> = (1, 3), <strong>a</strong> = (4, 2).', answer:-10, sol:'<i>b</i><sub>1</sub><i>a</i><sub>2</sub> &minus; <i>b</i><sub>2</sub><i>a</i><sub>1</sub> = (1)(2) &minus; (3)(4) = 2 &minus; 12 = <strong>&minus;10</strong>.' },
      { q:'Join the midpoints of a 3&times;3 grid to inscribe a tilted square. What is its area?', answer:4.5, sol:'3&sup2; &minus; 4&middot;&frac12;(1.5)(1.5) = 9 &minus; 4.5 = <strong>4.5</strong>.' },
      { q:'A right triangle has legs <i>a</i> = 6 and <i>b</i> = 8. What is the hypotenuse <i>c</i>?', answer:10, sol:'<i>c</i> = &#8730;(6&sup2; + 8&sup2;) = &#8730;100 = <strong>10</strong>.' },
      { q:'In (<i>a</i> + <i>b</i>)&sup2; with <i>a</i> = 3, <i>b</i> = 5, what is the middle term 2<i>ab</i>?', answer:30, sol:'2<i>ab</i> = 2(3)(5) = <strong>30</strong>.' },
    ] },
  { id:'n4', title:'The determinant is just signed volume',      topic:'linalg',   date:'Mar 02, 2026', read:'5 min',
    dek:'Forget the checkerboard of plus and minus signs. There is one picture underneath all of it — a box, and how much space it fills.',
    body:[
      { p:'Most courses introduce the determinant as a formula: a checkerboard of plus and minus signs you memorize and never quite trust. Here is the idea it is hiding — <strong>the determinant of a matrix is the signed volume of the box its columns span.</strong> Almost everything else follows from that one sentence.' },
      { h:'Start in two dimensions' },
      { p:'Take a 2&times;2 matrix and read its columns as two vectors in the plane, <i>a</i>&nbsp;=&nbsp;(<i>a</i>,&nbsp;<i>c</i>) and <i>b</i>&nbsp;=&nbsp;(<i>b</i>,&nbsp;<i>d</i>). Together they span a parallelogram, and the determinant is its area — with a sign.' },
      { math:'<span class="fn">det</span><span class="mtx"><span><i>a</i></span><span><i>b</i></span><span><i>c</i></span><span><i>d</i></span></span><span class="rel">=</span><i>a</i><i>d</i><span class="op">&minus;</span><i>b</i><i>c</i>' },
      { fig:'parallelogram' },
      { p:'If you have ever wondered where <i>ad</i>&nbsp;&minus;&nbsp;<i>bc</i> comes from, that is it: the area of the parallelogram, found by taking the enclosing rectangle and subtracting the slivers. The formula is bookkeeping. The area is the meaning.' },
      { h:'Where the sign comes from' },
      { p:'Area is never negative, so what is the minus sign doing? It records <em>orientation.</em> Sweep from the first column to the second: counter-clockwise gives a positive determinant, clockwise gives a negative one. Swap the two columns and you reverse the sweep — which is exactly why swapping columns flips the determinant&rsquo;s sign.' },
      { note:'A negative determinant means the transformation flips the plane over, like turning a page. A determinant of <em>zero</em> means the parallelogram has collapsed to a line — the columns point the same way and enclose no area at all.' },
      { h:'Three dimensions, and beyond' },
      { p:'Three columns in space span a parallelepiped — a slanted box — and its volume is the 3&times;3 determinant. The same story runs in every dimension: <i>n</i> columns in <i>n</i>-dimensional space span an <i>n</i>-box, and the determinant is its signed <i>n</i>-volume. There is nothing special about 2 or 3; the geometry just gets harder to draw.' },
      { h:'Why the hard theorems become obvious' },
      { p:'Read this way, the determinant&rsquo;s famous properties stop being rules to memorize and start being things you can see:' },
      { list:[
        '<strong>det&nbsp;=&nbsp;0</strong> exactly when the columns are linearly dependent. A flattened box has no volume.',
        '<strong>Scaling a column by <i>k</i></strong> scales the volume by <i>k</i>. Multilinearity is just &ldquo;stretch one edge, stretch the box.&rdquo;',
        '<strong>det(<i>AB</i>)&nbsp;=&nbsp;det(<i>A</i>)&middot;det(<i>B</i>).</strong> Apply two transformations in a row and their volume-scalings multiply.'
      ] },
      { p:'So the next time you compute a determinant, do not picture the cofactor expansion. Picture a box — and ask how much space it fills, and which way it is facing.' }
    ],
    exercises:[
      { q:'Compute the area of the parallelogram spanned by the columns of <span class="ex-mtx">det&#8201;[[2,&nbsp;1],&nbsp;[1,&nbsp;3]]</span>.', answer:5, sol:'2&middot;3 &minus; 1&middot;1 = <strong>5</strong>. The determinant <em>is</em> that area.' },
      { q:'Swap the columns: <span class="ex-mtx">det&#8201;[[1,&nbsp;2],&nbsp;[3,&nbsp;1]]</span>. What is its value?', answer:-5, sol:'1 &minus; 6 = <strong>&minus;5</strong>. The minus sign records the reversed (clockwise) orientation after the swap.' },
      { q:'Find the value of <i>k</i> that collapses the box to a line: <span class="ex-mtx">det&#8201;[[2,&nbsp;4],&nbsp;[1,&nbsp;<i>k</i>]] = 0</span>.', answer:2, sol:'2<i>k</i> &minus; 4 = 0 &rarr; <i>k</i> = <strong>2</strong>. The columns become parallel and enclose no area.' },
      { q:'If det(<i>A</i>) = 3 and det(<i>B</i>) = &minus;2, what is det(<i>AB</i>)?', answer:-6, sol:'det(<i>AB</i>) = det(<i>A</i>)&middot;det(<i>B</i>) = <strong>&minus;6</strong>. The volume-scalings multiply and the orientation flips once.' }
    ] },
];

/* Home mosaic layout — Wii-U mixed-size grid.
   ref = {kind:'project'|'topic', id}, w/h = grid span (cols/rows). */
export const ZMATH_HOME = [
  { kind:'project', id:'p1', w:2, h:2 },   /* featured: Knot Atlas */
  { kind:'topic',   id:'algebra',  w:1, h:1 },
  { kind:'topic',   id:'geometry', w:1, h:1 },
  { kind:'project', id:'p2', w:2, h:1 },   /* Matrix Playground (wide) */
  { kind:'topic',   id:'calculus', w:1, h:1 },
  { kind:'topic',   id:'linalg',   w:1, h:1 },
  { kind:'project', id:'p3', w:2, h:1 },   /* Prime Spiral (wide) */
  { kind:'topic',   id:'numberth', w:1, h:1 },
  { kind:'topic',   id:'prob',     w:1, h:1 },
];

/* Notes far-left glyph-chip palettes (light → deep, glossy). Lives here
   (dependency-free) so both app.jsx and components.jsx import it — it used to
   be defined in app.jsx and read via window.NOTE_GLYPH from components. */
export const NOTE_GLYPH = {
  algebra:  ['#f0564a', '#dc2626'],   // red
  geometry: ['#f5a623', '#d97706'],   // amber
  calculus: ['#f5a623', '#d97706'],   // amber
  linalg:   ['#3d9bff', '#007aff'],   // blue
  numberth: ['#3ddca0', '#10b981'],   // green
  combin:   ['#3ddca0', '#10b981'],   // green
  prob:     ['#9168bf', '#764ba2'],   // violet
  analysis: ['#ff7a45', '#ff4500'],   // reddit
  logic:    ['#ff7a45', '#ff4500'],   // reddit
};
