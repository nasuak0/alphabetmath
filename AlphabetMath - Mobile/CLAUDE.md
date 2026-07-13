# CLAUDE.md — orientation for Claude Code

This file is read automatically. It tells you (Claude Code) how this project is wired so you
can make changes safely without re-deriving the architecture each session.

> **Heads-up:** `GUIDE.md` in this folder is the human-oriented code map; this file is the
> Claude-oriented one. Both describe the same ESM architecture. Where anything disagrees
> with the code, the code wins.

## What this is — and the ONE big idea
A single-page **React** app — a math-portfolio "home menu" styled like a Nintendo 3DS / Wii U
OS. The important architectural fact:

**The folder `zmath/` here is THE SINGLE SOURCE OF TRUTH — "the brain."** Two different
"readers" run that exact same source, with no copy-paste between them:

```
AlphabetMath - Mobile/           ← you are here
  index.html                     ← Reader #1: no-build, runs the brain in the browser
  zmath/                         ← ★ THE BRAIN — the only real source ★
AlphabetMath - App/              ← Reader #2: a Vite build (sibling folder)
  src/main.jsx                   ← ~20-line thin reader; imports ../../AlphabetMath - Mobile/zmath/
```

- **Reader #1 (this folder, no build):** `index.html` carries an **import map** (bare `react`
  → esm.sh) plus a small **ESM+JSX import-graph loader** that fetches each `zmath/` module,
  Babel-transforms the JSX in the browser, and runs it. No `npm install`, no bundler.
- **Reader #2 (the App, real build):** Vite imports the same `zmath/` files natively and
  bundles them into a shippable `dist/`.

Because both read `zmath/`, the two versions **can't drift apart** — provided nobody copies
brain source into the App. Protect that (see Guardrails).

## How to run / preview THIS (Mobile) reader
The loader fetches `.jsx` over HTTP, so it must be **served**, not opened as a `file://`:
```bash
python3 -m http.server 5500        # then open http://localhost:5500
# or use the VS Code "Live Server" extension → right-click index.html → Open with Live Server
```
There is no test suite and nothing to compile here. Verify changes by reloading the page.
(To run the **App** reader instead, see `AlphabetMath - App/CLAUDE-CODE-HANDOFF.md`.)

## Display fit modes (`data-fit`, the "Desktop fit" tweak)
`App` sets `data-fit` on `<html>` from the `fit` tweak; `app.css` has a block per mode.
- **`desktop`** — THE DEFAULT. **It only SLIGHTLY expands the mobile / iPad design to fill a
  desktop monitor better — a touch wider, centred — keeping the SAME tile proportions and
  layout that mobile users see. It is NOT a fluid desktop reflow.** Mimic mobile, expand
  gently. Two rows of the Library must always fit the tray (tile bottoms never clip). When
  tuning it, nudge `stage-inner` max-width / `.grid-uniform` row height — do not switch it to
  auto-fill columns or width-driven aspect-ratios (both broke this before: cramped tiles, then
  clipped bottoms).
- **`ipad`** — the literal mobile design: a fixed 1180×820 canvas scaled to fit (letterboxed).
- **`native`** — fills the viewport like an ordinary responsive app (content capped ~1080).
- **`fluid`** — full reflow: auto-fill columns + type scale with the viewport (more, smaller
  tiles on big screens). The opposite philosophy to `desktop`.


## Architecture — the brain (`zmath/`)
ESM modules, each with explicit `import`/`export`. The dependency graph (entry last):

- `main.jsx` — **entry.** Imports `App`, wraps it in an `ErrorBoundary`, and mounts it into
  `#root` via `createRoot`. Both readers start here. Keep it thin.
- `data.js` — **all content** (topics, projects, notes) — `export const ZMATH_TOPICS`, etc.
  Single source of truth for copy. Most content changes happen here and nowhere else.
- `icons.jsx` — `Icon` (flat line) + `GlyphIcon` (glossy gradient) from one path dict.
- `coverart.jsx` — deterministic generative SVG "math scenes" per subject (`CoverArt`).
- `figures-registry.js` — exports the shared `ZFIGURES` registry object.
- `figures.jsx` — generative note diagrams; each **registers itself into `ZFIGURES`** (import
  this for its side effect so `NoteBlock` can render `{ fig:'name' }`).
- `figkit.jsx` — reusable figure primitives (lattice/area widgets).
- `components.jsx` — `Sidebar` (rail), `Dock`, `Tile`, `Modal`, `NoteBlock`, screens chrome.
- `app.jsx` — the 5 screens + the `App` shell. Exports `App`.
- `tweaks-panel.jsx` / `tweaks-overrides.css` — the in-app Tweaks panel + its overrides.
- `styles.css` — **the one stylesheet entry** both readers load; @imports tokens.css →
  app.css → tweaks-overrides.css in order. Add future stylesheets here, never in the shells.
- `tokens.css` — brand foundation (palette, type, glass, radii, shadow, motion).
- `app.css` — all layout + component styling + reduced-motion fallbacks.

> Each reader pulls in ONLY `styles.css` (this folder's `index.html` `<link>`s it; the App's
> `src/main.jsx` `import`s it). The @import order inside it matters — tokens define the vars
> `app.css` consumes. `main.jsx` also sets `document.title`, so the shells carry only a
> placeholder title.

## State model
`App` (in `app.jsx`) owns exactly two state values:
- `page` — which screen is active (`Home/Topics/Projects/Notes/About`).
- `entry` — the open modal's `{type, data}`, or `null`.
Everything on screen is a function of those two plus `data.js`. Don't introduce a router, a
store, or new top-level state without a reason — keep this flat.

## Critical conventions (follow these or things silently break)
1. **It's ESM — share via `import`/`export`, NOT `window`.** A component is visible to another
   file only if you `export` it there and `import` it here. (The old "assign to `window`"
   pattern is gone — don't reintroduce it.) When you add a shared component, `export` it and
   `import` it where used.
2. **Bare specifiers stay bare.** Import React as `import React from "react"` and
   `import { createRoot } from "react-dom/client"` — never a CDN URL or relative path. The
   Mobile import map and the App's bundler each resolve `react` their own way; using the bare
   specifier is what keeps the SOURCE identical across both readers.
3. **Relative imports need the extension** (`"./icons.jsx"`, `"./figures-registry.js"`). The
   browser loader and Vite both rely on the explicit path.
4. **Keep `main.jsx` thin.** Logic lives in `app.jsx` and its imports; `main.jsx` is just
   mount + error boundary.
5. **Never name a global styles object `styles`.** Name per-component (`const modalStyles`) —
   though this app mostly styles via CSS classes; prefer that.
6. **Style with the design tokens.** Colors/type/radii/glass are `--*` vars in `tokens.css`
   (and the pastel `--rose`/`--rose-ink` names `data.js` points at). Reference those rather
   than hard-coding hex. Add a token if you need a new brand value.
7. **Honor `prefers-reduced-motion`.** Reduced-motion fallbacks live in `app.css`; `App` sets
   `body.reduce-motion`. Keep new motion gated the same way.
8. **Canonical HTML/JSX.** Close every element; double-quote attributes — the app is meant to
   stay directly editable.

## Common edits (where to go)
- Add/change a **topic, project, or note** → `data.js` (set `scene` if it's a topic).
- New tile **background art** → add an `else if (scene === '…')` branch in `coverart.jsx`.
- New **note figure** → add it in `figures.jsx` (it self-registers into `ZFIGURES`).
- **Nav** items → `NAV` array in `components.jsx`. **Dock** buttons → `Dock` `items`.
- New **icon** → add a path to the dict in `icons.jsx`.
- New **screen** → add a `*Screen` in `app.jsx`, register it in the `screens` map + add a `NAV`
  entry.
- **Brand** palette/type/glass → `tokens.css`. **How something looks/moves** → `app.css`.

## Guardrails
- **`zmath/` is the single source of truth. The App folder must NOT contain a copy of it.** If
  you ever see `app.jsx`/`components.jsx`/`data.js`/CSS appear inside `AlphabetMath - App/src/`,
  that's the bug — the App is supposed to be a thin reader. Don't duplicate the brain.
- Make changes in **small steps** and reload to verify; there's no CI to catch regressions.
- **Mobile reader:** don't change the pinned Babel tag or the import map in `index.html`
  without reason — they're the whole no-build runtime.
- Don't add a second copy of React or a new CDN/runtime dependency without asking.
- Internal identifiers stay `ZMATH_*` on purpose (rename is pure risk, zero user benefit).

## Design system
The visual language is warm paper + 10 pastel subjects, Inter/Fredoka/JetBrains Mono,
Liquid-Glass corners, glossy console tiles, springy motion — all baked into `tokens.css`, so
you don't need the external system to work here. Stay consistent: paper ground, pastel-on-ink
subjects, frosted glass for floating chrome only, large continuous radii, springy-but-quick
motion. No neon, no emoji in the UI, no colored-left-border accent cards.
