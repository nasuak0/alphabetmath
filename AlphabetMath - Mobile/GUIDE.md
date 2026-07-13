# AlphabetMath — Code Guide

A **map between the code and the screen.** Read it once top-to-bottom to build a mental
model, then use the **"Change X → edit Y"** table at the end as a lookup. Every file
reference here is real and current.

---

## 1. The 30-second mental model

The app is a fake **operating-system home menu** for a math portfolio. Three fixed pieces
of "chrome" frame one swappable middle:

```
┌──────────────────────────────────────────────────────────┐
│ ┌──────┐  ┌────────────────────────────────────────────┐ │
│ │      │  │                                            │ │
│ │ RAIL │  │   STAGE  (the active screen renders here)  │ │  ← swaps between
│ │ left │  │                                            │ │    Home / Topics /
│ │ nav  │  │                                            │ │    Projects / Notes /
│ │      │  │                                            │ │    About
│ └──────┘  └────────────────────────────────────────────┘ │
│                       ┌────────────┐                       │
│                       │    DOCK     │  ← floating, fixed    │
│                       └────────────┘                       │
└──────────────────────────────────────────────────────────┘
   MODAL opens centered over everything when you click a tile.
```

- **Rail** (left) = `Sidebar` — brand rank-wheel, profile, 5 nav buttons. Drag to expand.
- **Stage** (center) = whichever screen is active. Only this part changes on navigation.
- **Dock** (bottom) = `Dock` — three glossy glass icons + a "surprise me."
- **Modal** = `Modal` — the detail card that animates in over a dimmed backdrop.

All state lives in **one place**: the `App` component (`app.jsx`) holds two values —
`page` (which screen) and `entry` (which tile's modal is open, or `null`). Everything on
screen is a function of those two plus the content in `data.js`.

---

## 2. How it boots — two readers, one entry

The app's code ("the brain") lives in `zmath/` and is **standard ESM** — every file uses
`import`/`export`. Two different "readers" run that same source:

**Reader A — `index.html` here (no build).** A tiny page that:
1. **Loads ONE stylesheet** in `<head>`: `zmath/styles.css`, which @imports `tokens.css`
   (the variables) then `app.css` (the layout that consumes them), then
   `tweaks-overrides.css`. Add future stylesheets inside `styles.css`, never in the shell.
2. **Declares an import map** so the bare specifier `react` / `react-dom/client` resolves to
   esm.sh (`?external=react` keeps a single React instance — don't remove it).
3. **Runs a small in-page ESM+JSX loader**: it walks the import graph from
   `./zmath/main.jsx`, fetches each relative module, Babel-transforms the JSX in the browser,
   rewrites relative specifiers to blob URLs, and runs the entry. No `npm`, no bundler. Don't
   touch the pinned Babel tag or the import map — they are the whole runtime.

**Reader B — the Vite App** (sibling `AlphabetMath - App/`). Its `src/main.jsx` simply
`import`s the same `zmath/` files; Vite resolves and bundles them natively.

`<div id="root"></div>` is the single mount point in both. `zmath/main.jsx` is the shared
entry: it imports `App`, wraps it in an error boundary, sets `document.title`, and
`createRoot(...).render(<App/>)`.

> **Files share code through `import`/`export` — NOT `window`.** A component is visible to
> another file only if you `export` it there and `import` it where used. (An older version of
> this app hung everything on `window`; that's gone. Don't reintroduce it.) Relative imports
> need the extension — `"./icons.jsx"`, `"./figures-registry.js"`. Import React as the bare
> `import React from "react"`, never a CDN URL, so the source stays identical across both
> readers.

---

## 3. The content — `zmath/data.js`

Plain JavaScript, **no React.** This is the single source of truth for everything you read
on screen.

### `ZMATH_TOPICS` (10 items) — the subjects
```js
{ id:'algebra', n:'01', sym:'Al', name:'Algebra', color:'rose', ink:'rose-ink',
  scene:'symmetry', grad:['#ff7a9c','#c2326b'], blurb:'Groups, rings, and the shapes of symmetry.' }
```
| Field | Where it shows on screen |
|---|---|
| `sym` (`"Al"`) | two-letter **badge** in the tile corner; the big glyph on the modal cover; the note-row chip |
| `n` (`"01"`) | the "Topic 01" kicker on topic tiles + modal |
| `name` | tile title, modal title, the colored pill/badge |
| `grad` | the tile's **gradient frame** + the cover-art tint + badge gradient |
| `color` / `ink` | pastel pill fill + its readable ink (CSS vars defined in `tokens.css`) |
| `scene` | which **generative SVG drawing** fills the tile (see §5) |
| `blurb` | the description paragraph in the modal |

### `ZMATH_PROJECTS` (6 items) — the interactive demos
```js
{ id:'p1', topic:'topology', title:'Knot Atlas', kind:'Interactive', year:'2026', desc:'…' }
```
`topic` links a project to a topic, so it **borrows that topic's color, gradient, badge
letters, and cover art.** `title`/`kind`/`year`/`desc` fill the wide project tiles + modal.

### `ZMATH_NOTES` (5 items) — the write-ups
`{ id, title, topic, date, read }` — each becomes one row on the **Notes** screen.

### Lookup maps
`ZMATH_TByID` / `ZMATH_PByID` are `{id → object}` maps built from the arrays so components
resolve a topic/project by id in one step. `ZMATH_HOME` at the bottom is a leftover layout
spec the current Home screen no longer uses — safe to ignore.

> **To change any copy, or add a topic/project/note, you edit only this file.** Everything
> else reads from it.

---

## 4. The icons — `zmath/icons.jsx`

Two components, both reading one dictionary `ZMATH_ICON_PATHS` (name → raw SVG path markup
on a `0 0 24 24` viewBox).

- **`<Icon name size stroke sw />`** — flat single-color line icon (~1.9px rounded stroke).
  Small UI marks: the clock in the status pill, the chevron on nav items, the close ✕ and
  play ▶ in the modal, the link icons on About.
- **`<GlyphIcon name colors glow sw />`** — the **glossy colored** version. Same path data,
  but stroked with a top-to-bottom **gradient** plus a white top-edge highlight and a soft
  colored drop-shadow. This is the candy-button look on the **rail nav icons** and the
  **dock icons.** The gradient is a per-instance `<linearGradient>` whose id is made unique
  with `React.useId()` so multiple glyphs on the page don't collide.

Add an icon: add one entry to `ZMATH_ICON_PATHS`, then reference it by name. Both
`Icon` and `GlyphIcon` are `export`ed and `import`ed where used.

---

## 5. The tile artwork — `zmath/coverart.jsx`

The most "mathematical" file. Every tile carries a faint **generative line drawing** behind
its title — a different abstract scene per subject. Pure deterministic SVG (no randomness,
no images), so it always renders identically and scales cleanly.

- **`scenePaths(scene, rgb)`** is a big `if/else` returning an array of shape descriptors
  (`{d, poly, c, rect, stroke, fill, sw…}`). Each branch hand-builds one scene with trig:

  | `scene` | Topic | What it draws |
  |---|---|---|
  | `symmetry` | Algebra | radial orbit of petals (rotational symmetry) |
  | `tiling` | Geometry | scattered aperiodic rhombi |
  | `curves` | Calculus | layered sine curves + an area fill |
  | `vectors` | Linear Algebra | a sheared grid of little arrows (vector field) |
  | `contour` | Number Theory | nested wobbling contour rings |
  | `weave` | Combinatorics | a branching binary tree (counting paths) |
  | `bell` | Probability | bell curve + histogram bars |
  | `knot` | Topology | a depth-sorted 3-strand braid weaving over/under |
  | `epsilon` | Analysis | nested shrinking intervals |
  | `gates` | Logic | a truth-table grid of filled/hollow dots |

- **`CoverArt({topic, color})`** converts the topic's hex to an `r,g,b` string, calls
  `scenePaths`, then maps each descriptor to a real `<path>/<polygon>/<circle>/<rect>`.
  `preserveAspectRatio="xMidYMid slice"` makes the 200×200 art cover-fill any tile box.

On screen it renders inside every `Tile` (behind the title) and inside the `Modal` cover
banner. White lines sit at low opacity so the colored gradient shows through.

> New subject artwork → add an `else if (scene === 'yourname')` branch returning shape
> descriptors, then set `scene:'yourname'` on the topic in `data.js`.

---

## 6. The building blocks — `zmath/components.jsx`

Five exported pieces. Most on-screen UI lives here.

### `PixelLetter` (helper, not in the active layout)
Renders a 5×7 **pixel-grid letter** from the bitmap font `PIXFONT`, each "on" pixel filled
with a slice of the brand spectrum so the letter reads as one gradient. Available but the
rail currently uses the rank-wheel instead. Keep it if you want the pixel-Z wordmark back.

### `Sidebar` → the **left rail** (the most interactive component)
Top to bottom of what it renders:
- **Brand rank-wheel** (`brand-wheel`) — a vertical strip of letters Z→A you **scroll or
  drag** to pick a "rank." `rank` state (0–25) maps to a letter; the strip slides via a CSS
  `--rank` variable. The `(Z)math` wordmark beside it (visible only when expanded) is
  painted in the brand gradient.
- **Profile** — the pixel-Z avatar (`logo.svg`) + "Nana · Rank X · Mathematician." That rank
  letter is the *same* `rank` state, so spinning the wheel updates it live.
- **Nav buttons** — built from the `NAV` array (`Home/Topics/Projects/Notes/About`), each a
  `GlyphIcon` in its own color. The active one (`page === n.id`) gets a white pill + a
  chevron. Clicking calls `setPage`.
- **Drag-to-expand** — the rail is 90px collapsed / 248px expanded. The `rail-grip` handle
  uses pointer events: a quick tap (`moved < 4`) toggles open/closed; a drag resizes live
  and **snaps** to whichever end is nearer (`MID` threshold). Open state toggles a
  `body.rail-open` class so the rest of the page can react.

### `Dock` → the **bottom dock**
A frosted-glass pill of four glossy `GlyphIcon` squircles: search (→ jumps to Topics),
GitHub, coffee, and a separated **"Surprise me"** sparkle that opens a random project's
modal. Each has a `tip` tooltip. Wired to `onSearch` / `onRandom` passed from `App`.

### `Tile` → the **glossy cards** (topics *and* projects)
Given `{kind, id, w, h}` it resolves the data + topic, builds a className for size
(`t-sm/t-md/t-lg`, `w2` for double-wide projects), and renders: the corner **badge**
(`sym`), the **CoverArt**, and the text block (project → `kind`+`title`; topic →
`Topic n`+`name`). The colored frame/glow come from CSS vars set inline from the topic's
gradient. A `setTimeout` keyed on `idx` adds an `.in` class for a **staggered entrance.**
Clicking calls `onOpen(...)` → opens the modal.

### `Modal` → the **detail card**
Driven by `entry` from `App`. It keeps a `last` ref of the previous entry so the card can
**animate out** with its content intact after `entry` becomes `null`. Renders a cover
(CoverArt + sheen + glyph + close), a body (kicker, title, colored tags, the blurb/desc),
and a footer of buttons (projects → "Open demo" + "Source"; topics → "Browse {name}").
Closes on backdrop click, the ✕, or the **Escape** key (a `keydown` listener).

---

## 7. The screens — `zmath/app.jsx`

Holds the app shell, the five screens, and small shared widgets.

- **`useClock()`** — a hook ticking every 20s; returns formatted `time`/`date` for the
  status pills.
- **`TopBar` / `HeroWidget`** — two header styles. `TopBar` is the plain title+subtitle+clock
  used by Notes/About. `HeroWidget` is the frosted glass panel with a brand glow + clock
  pill used by Home/Topics/Projects (it can hold children, e.g. the Topics filter).
- **`HomeScreen`** — the landing tray: a hero, then a horizontal rail of topic tiles above a
  horizontal rail of project cartridges, merged on one glass tray.
- **`TopicsScreen`** — a `seg` segmented pill (All / Pure / Applied) filtering the 10 topics
  into a uniform grid. The slider position is driven by a `--seg` CSS var.
- **`ProjectsScreen`** — the 6 projects in a wide mosaic.
- **`NotesScreen`** — rows from `ZMATH_NOTES`; each row's left chip uses the `NOTE_GLYPH`
  accent palette (falls back to the topic gradient). Clicking a row opens that topic's modal.
- **`AboutScreen`** — a bio card + three link cards (GitHub / Field notes / Coffee).
- **`App`** — owns `page` + `entry`. Renders `Sidebar`, the active `Screen` (looked up from a
  `{name: Component}` map, re-keyed on `page` so it remounts + replays entrance), `Dock`, and
  `Modal`. `onRandom` picks a random project; navigation also scrolls the stage to top. On
  mount it adds `body.reduce-motion` when the OS prefers reduced motion.

---

## 8. The styling — `tokens.css` then `app.css`

- **`zmath/tokens.css`** — the **foundation**, lifted from the AlphabetMath Design System. Defines
  the warm-paper palette, the 10 pastel subject colors + their inks (the `--rose`,
  `--rose-ink` vars that `data.js` references by name), the brand spectrum, type scale, glass
  recipe, radii, shadows, and motion curves. Change a brand value here and it propagates
  everywhere.
- **`zmath/app.css`** — **all layout + component styling**: the `.os` flex shell, the `.rail`
  and its open/drag states, `.stage`, the `.tile` gloss/frame/badge/entrance, `.dock`,
  `.scrim`/`.modal` animation, the screen layouts (`.home`, `.grid-uniform`, `.mosaic`,
  `.notes`, `.about-grid`), and the `prefers-reduced-motion` fallbacks. This is where you
  tune *how things look and move*; `tokens.css` is *what the brand values are.*

---

## 9. "Change X → edit Y" lookup

| You want to change… | Edit | Notes |
|---|---|---|
| Any topic/project/note **text**, or add one | `data.js` | the only content file |
| A subject's **color** | `data.js` `grad` + `color`/`ink` | inks/pastels are defined in `tokens.css` |
| A tile's **background drawing** | `coverart.jsx` (`scene`) + set `scene` in `data.js` | add an `else if` branch |
| **Nav items** (label, icon, color) | `components.jsx` `NAV` array | |
| **Dock buttons** | `components.jsx` `Dock` `items` | |
| An **icon's shape** / add an icon | `icons.jsx` `ZMATH_ICON_PATHS` | |
| **Modal** content/buttons | `components.jsx` `Modal` | |
| A **screen's** layout/copy | `app.jsx` (the relevant `*Screen`) | |
| Brand **palette / type / glass / radii** | `tokens.css` | propagates everywhere |
| How something **looks or animates** | `app.css` | search the class name from the component |
| Add a **new screen** | `app.jsx`: add a `*Screen`, add to the `screens` map + `NAV` | |
| Add a **new shared component** | define it, `export` it, then `import` it where used | no `window`, no load-order edits |

---

## 10. Working with Claude Code

Once this folder is open in VS Code with Claude Code running in it, good first prompts:

- *"Read GUIDE.md and CLAUDE.md, then summarize the architecture back to me."* — confirms it
  has the model before editing.
- *"Add a new topic 'Cryptography' with a lattice cover-art scene."* — touches `data.js` +
  `coverart.jsx`; a good first end-to-end change.
- *"Walk me through what happens, file by file, when I click a topic tile."* — great for
  building your own intuition.

Make changes in small steps, refresh the browser (Live Server auto-reloads), and read the
diffs. Because there's no build, what you edit is exactly what runs.
