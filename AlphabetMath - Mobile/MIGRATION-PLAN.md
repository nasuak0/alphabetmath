# Zmath — Single-Source Migration Plan

> **✅ COMPLETE (2026-07-09).** All phases done — kept as historical record only.
> Folder names have since changed: `zmath-portable/` → `AlphabetMath - Mobile/`,
> `zmath-app/` → `AlphabetMath - App/`. The root `zmath/` folder is deleted.
> Current truth lives in the root `STATUS.md`.

> **Goal in one sentence:** Have ONE folder of code — `zmath-portable/zmath/` —
> that everything else *reads from* instead of *copying*, so nothing can ever
> drift again.

---

## Project structure — BEFORE → AFTER
### The difference between these two trees IS the task list. Every ⚠ resolves as a phase completes; every ★ is the survivor.

**BEFORE — three copies, drifting**
```
0.11/
├── zmath/                      ⚠ OLD root copy — only tokens.css is live (feeds interactives)
│   ├── app.jsx  components.jsx  coverart.jsx  icons.jsx   (dead — nothing runs them)
│   ├── data.js  app.css                                   (stale snapshot)
│   ├── tokens.css   ← the ONE live file here              logo.svg
├── zmath-portable/             ★ the good, complete copy → becomes the MASTER
│   ├── index.html              (loads files via <script> order + window globals)
│   └── zmath/
│       ├── data.js  icons.jsx  coverart.jsx
│       ├── figkit.jsx  figures.jsx          ← exist ONLY here
│       ├── components.jsx  app.jsx
│       ├── tokens.css  app.css  logo.svg
│       └── tweaks-panel.jsx  tweaks-overrides.css
├── zmath-app/                  ⚠ STALE Vite copy — ~1/4 the content, missing figures
│   ├── index.html  main.jsx  package.json  vite.config.js
│   └── src/  (app.jsx, components.jsx, data.js, logo.svg, styles/… — its OWN duplicate)
└── interactives/               → all 5 HTML + lab.css read  ../zmath/tokens.css   ⚠ repoint
```

**AFTER — one master, three readers**
```
0.11/
├── zmath-portable/             ★ THE ONLY SOURCE — the one place you ever edit
│   ├── index.html              (React import map + ONE module entry)
│   └── zmath/
│       ├── main.jsx            ← shared entry (mounts <App/>)        [NEW]
│       ├── data.js             (exports; now also holds NOTE_GLYPH)
│       ├── figures-registry.js ← shared ZFIGURES object             [NEW]
│       ├── tweak-env.js        ← the one per-environment shim        [NEW]
│       ├── icons.jsx  coverart.jsx  figkit.jsx  figures.jsx
│       ├── components.jsx  app.jsx        (all import/export now)
│       ├── tokens.css  app.css  logo.svg
│       └── tweaks-panel.jsx  tweaks-overrides.css
│
├── zmath-app/                  → reader: NO own source
│   ├── src/main.jsx            imports ../../zmath-portable/zmath/*
│   ├── package.json  vite.config.js   (fs.allow → portable)
│   └──  (src/*.jsx, data.js, logo.svg, styles/  ⚠ DELETED — duplicates gone)
│
├── interactives/               → reader: read ../zmath-portable/zmath/tokens.css
│
└── zmath/                      ⚠ DELETED entirely (its only live job moved to master)
```

> **Readers (consume, never copy):** portable preview · Vite app · interactives (tokens only).
> Change the master once → all three reflect it. Drift is structurally impossible.

---

## End state

```
            zmath-portable/zmath/   ← the ONE master. The only place you edit.
                     │
        ┌────────────┼─────────────────┐
        ▼            ▼                  ▼
  portable        Vite app        interactives
  preview page    (production)    (read tokens.css only)
  [I can run]     [you build]     [I can run]
```

Old `zmath-app/`'s own copy and the root `zmath/` folder both go away.

---

## ✅ PHASE 0 RESULT (proven 2026-06-29)

**Key finding that shapes Phase 1:** plain `@babel/standalone` in `data-type="module"`
mode does **NOT** transform relative-imported `.jsx` files — it only compiles the
script tag it owns. A bare `import "./icons.jsx"` makes the browser fetch the file
**raw** → `SyntaxError: Unexpected token '<'`. So a single Babel-module entry over a
graph of `.jsx` files **cannot work** without help.

**Mechanism that DOES work (verified end-to-end in `_spike.html`):** a tiny
in-browser **import-graph loader** — fetch each module, Babel-transform JSX,
rewrite relative specifiers to blob URLs, dynamic-import the entry. Three gotchas,
all solved:
1. **React** → resolved by a document-level **import map** (`react`,
   `react-dom/client` → esm.sh ESM builds). Blob modules honor the import map.
2. **Assets / `import.meta.url`** → inside a blob module `import.meta.url` is the
   (unresolvable) blob URL, so the loader rewrites `import.meta.url` → each file's
   **real absolute URL** string. `new URL("./logo.svg", import.meta.url)` then works
   in BOTH portable (loader) and Vite (untouched source). This is the chosen logo form.
3. **Cross-file JSX** → handled by the recursive transform above.

**The proven loader (drop into portable's `index.html` in Phase 1):**
```js
async function loadGraph(entryUrl) {
  const cache = new Map();
  const RELATIVE = /(\bfrom\s*|\bimport\s*)(["'])(\.[^"']+)\2/g;
  async function build(absUrl) {
    if (cache.has(absUrl)) return cache.get(absUrl);
    const src = await (await fetch(absUrl)).text();
    const deps = []; src.replace(RELATIVE, (m,_k,_q,s)=>{deps.push(s);return m;});
    const map = {};
    for (const spec of deps) map[spec] = await build(new URL(spec, absUrl).href);
    let code = Babel.transform(src, { presets:["react"], filename: absUrl.split("/").pop() }).code;
    code = code.replace(RELATIVE, (m,kw,q,spec)=> map[spec] ? `${kw}${q}${map[spec]}${q}` : m);
    code = code.replace(/import\.meta\.url/g, JSON.stringify(absUrl));
    const blob = URL.createObjectURL(new Blob([code], { type:"text/javascript" }));
    cache.set(absUrl, blob); return blob;
  }
  return build(new URL(entryUrl, location.href).href);
}
// usage: loadGraph("./zmath/main.jsx").then(b => import(b));
```
**Consequence for the gate:** mechanism PROVEN → proceed to Phase 1. The conversion
is now low-risk because every converted file is verifiable in the portable preview.

---

## ✅ PHASE 1 RESULT (done 2026-06-29)

`zmath-portable/zmath/` is now the **single ESM master** and the portable preview
runs entirely off it (no globals, no per-file script tags). Verified in preview:
Home 14 tiles · Topics 8 · Projects 6 · Notes list + article (7 figures, 2 tables,
5 exercises) · About · all navigation · zero console errors.

**What changed**
- All 8 files converted globals→`import`/`export`. `window.X = X` removed everywhere.
- New files: `figures-registry.js` (shared `ZFIGURES`), `main.jsx` (entry + a small
  `ErrorBoundary`).
- Tangles fixed: `NOTE_GLYPH` moved to `data.js`; `ZFIGURES` is now the shared
  registry module (figures.jsx registers via side-effect `import "./figures.jsx"`
  in components.jsx; NoteBlock reads it). Arrows point one way now.
- `index.html` rewired: import map + `?external=react` + the loader + one `main.jsx`
  entry. `figkit.jsx` converted for parity but still **not in the runtime graph**.

**Two gotchas worth remembering for the app promotion (Phase 2):**
1. **`?external=react` is mandatory.** Without it esm.sh gives react-dom its OWN
   React → two instances → hooks crash intermittently. (Vite avoids this naturally.)
2. **Every identifier must be imported.** The conversion missed `ZMATH_NOTES` in
   app.jsx → only the Notes screen crashed ("Can't find variable"). Globals hid
   missing refs; imports surface them. Sweep each file's used names vs its imports.

---

## Plain-language glossary

- **Globals (old portable style):** each file leaves its work on a shared
  whiteboard (`window.X = X`) and the files find each other by being loaded in
  the right order.
- **Imports (the app's style — and our target):** each file hands out labeled
  envelopes (`export`) and asks for them by name (`import`). Order-independent.
- **Reader:** anything that runs the code. We'll have three (see diagram).
- **Spike:** a tiny throwaway test to prove a risky trick works before
  committing to it.

---

## The 3 mechanism seams (the only genuinely tricky bits) + chosen fix

1. **Where React comes from.** Every file will say `import React from "react"`.
   - App: Vite finds React in `node_modules`. ✓
   - Portable: add an **import map** in `index.html` pointing `"react"` /
     `"react-dom/client"` at a CDN ESM build. ✓
2. **The logo asset.** Replace `import logoUrl from "./logo.svg"` with
   `new URL("./logo.svg", import.meta.url).href` — works in BOTH Vite and the
   browser's native modules.
3. **Running modules + JSX with no build step (portable).** Portable loads the
   entry with Babel-standalone in **module mode**
   (`<script type="text/babel" data-type="module">`), which fetches and
   transforms the whole import graph in the browser. → proven in Phase 0.

---

## Tangles to untangle during conversion

- **Backwards reach:** `NOTE_GLYPH` is *defined* in `app.jsx` but *read* in
  `components.jsx`. Move it into `data.js` (no dependencies) and import from
  both, so arrows only point one way.
- **Figure registry:** `window.ZFIGURES` is a shared sign-up sheet. Replace with
  a `figures-registry.js` that exports one object; `figkit` / `figures` /
  `components` import it and add to it; `NoteBlock` imports it and reads.
- **Tweaks oddball:** `tweaks-panel.jsx` talks to its environment (postMessage
  in portable). Keep the panel shared; move only its save/transport wire into a
  small `tweak-env` file — the one intentional per-environment piece.

---

## Phases & tasks

### Phase 0 — Prove the mechanism  ·  GATE  ·  [verifiable in preview]
- [ ] 0.1 In a COPY of `index.html`, add the React import map + a temporary
      single `text/babel` `data-type="module"` entry.
- [ ] 0.2 Convert ONE leaf file (`icons.jsx`) to import/export form.
- [ ] 0.3 Use the `new URL(... import.meta.url)` logo pattern in the test.
- [ ] 0.4 Open in preview; confirm icons render + React resolves + no console
      errors.
- [ ] **GATE:** all good → Phase 1. Any blocker → STOP, report, fall back to
      "keep two copies + a sync checklist" (Option B).

### Phase 1 — Convert `portable/zmath` into the master  ·  [verifiable in preview]
Convert **leaves → root**, re-checking the preview after EACH file.
- [ ] 1.1 `data.js`: globals → named exports; add `NOTE_GLYPH` here.
- [ ] 1.2 Create `figures-registry.js` (exports `ZFIGURES = {}`).
- [ ] 1.3 `icons.jsx` → exports (finalize from the spike).
- [ ] 1.4 `coverart.jsx` → exports.
- [ ] 1.5 `figkit.jsx`: IIFE → `export ZFIGKIT`.
- [ ] 1.6 `figures.jsx`: import registry + figkit, add figures to registry.
- [ ] 1.7 `components.jsx`: imports (icons, coverart, data incl. NOTE_GLYPH,
      registry); export components; register `parallelogram` into registry.
- [ ] 1.8 `app.jsx`: imports; delete its `NOTE_GLYPH` definition; replace
      `window.NoteBlock` with an import.
- [ ] 1.9 Implement the Tweaks env split (`tweak-env`).
- [ ] 1.10 Logo → `new URL` pattern wherever used.
- [ ] 1.11 Create `zmath/main.jsx` entry (imports App, mounts to `#root`).
- [ ] 1.12 Rewrite `zmath-portable/index.html`: React import map + ONE
      `text/babel` `data-type="module"` entry; remove the old per-file tags.
- [ ] 1.13 Full preview check: every screen, modal, note reader, figures,
      tweaks — matches today. Screenshot pass.
- [ ] **DONE** when portable runs entirely off ESM masters, zero console
      errors, no visual change.

### Phase 2 — Point the Vite app at the master  ·  HANDOFF (you build)
- [ ] 2.1 Delete the app's duplicate source (`src/*.jsx`, `data.js`, `logo.svg`,
      CSS copies).
- [ ] 2.2 Repoint `zmath-app/src/main.jsx` to import from
      `../../zmath-portable/zmath/...` (or add a Vite path alias).
- [ ] 2.3 vite.config: allow imports outside the app root for dev
      (`server.fs.allow`); the build follows imports fine.
- [ ] 2.4 **HANDOFF:** you run `npm install && npm run build` + preview once and
      report errors; I fix by inspection.
- [ ] **NOTE:** I cannot run Vite in my environment — this phase is verified by
      you, which is exactly why the shared code is proven in portable first.

### Phase 3 — Collapse tokens & retire root `zmath/`  ·  [verifiable in preview]
- [ ] 3.1 Repoint the 5 interactives + `lab.css` from `../zmath/tokens.css` to
      `../zmath-portable/zmath/tokens.css`.
- [ ] 3.2 Open each interactive in preview; confirm styling intact.
- [ ] 3.3 Delete the root `zmath/` folder.

### Phase 4 — Document & lock
- [ ] 4.1 Write a short "how this is wired / how to add a file" note in
      portable's README.
- [ ] 4.2 Final full verification.

---

## Safety / rollback
- Old `zmath-app/` and root `zmath/` stay UNTOUCHED until their own phase —
  they are the fallback.
- Stop and show the user at each phase boundary.
- Nothing is deleted before its replacement is proven in the preview.

## If interrupted — how to resume
Find the first unchecked box above. Phases 0, 1, 3 are verifiable in the preview;
Phase 2 is the user's build step. Re-read this file +
`zmath-portable/index.html` + the file named in the task, then continue.
