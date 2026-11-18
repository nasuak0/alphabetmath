# AlphabetMath — Current Status (v0.11)

_Snapshot of where the project stands right now and what's next._

---

## NOW (2026-11-14) — becoming a desktop app

**Direction:** AlphabetMath is now a **desktop app** (Electron, like VS Code). It looks and works
exactly like the Mobile reader — no desktop-only design. Drafts (`explore/`, `interactives/`) stay
outside the app; only finished pieces are ported into `zmath/`. People will download it from a
download page on the website (later on our own domain, e.g. `alphabetmath.app`).

**Done today**
- **One project folder:** `~/Projects/alphabetmath`, linked to GitHub (`nasuak0/alphabetmath`) via
  GitHub Desktop. The drifted `~/IdeaProjects/AlphabetMath` copy was merged in and is retired.
  (Moved out of `~/Documents` because macOS privacy blocked the preview servers there.)
- **Branch `desktop-merge`** holds all of this; pushed to GitHub. `main` not merged yet.
- **Offline:** React 18.3.1, ReactDOM 18.3.1 and Babel 7.29.0 live in `AlphabetMath - Mobile/vendor/`;
  `Mobile/index.html` loads them from there (Babel integrity hash unchanged). Fonts still come from
  Google Fonts — to be saved locally at packaging.
- **`AlphabetMath - Desktop/`** (Step 1): `package.json` + `main.js`. Serves the Mobile folder at
  `app://alphabetmath/`, window 1180×820, min 1024×700 (above the 700×500 phone gate). External links
  open in the normal browser. Run: `cd "AlphabetMath - Desktop" && npm start`.
- **Page lists (studio):** root `index.html` (all pages, `localhost:5501`) and
  `Mobile/explore/index.html` (explore drafts, `localhost:5500/explore/`). Hand-written — add new pages.

**Done since (2026-11-14 → 17)**
- Packaged: `cd "AlphabetMath - Desktop" && npm run package` → `release/AlphabetMath.dmg`
  (app only: `index.html`, `zmath/`, `vendor/`; fonts in `zmath/fonts/`). Unsigned.
- λ app icon: `AlphabetMath - Desktop/build/icon.png`, redrawn from `build/icon-source.html`.
- No title bar: a thin 10px top strip (painted like the app's own background, dot grid lined up)
  is the drag handle; the window buttons sit at its edge and the app sits below it (`main.js`).
  The drag region covers ONLY the strip — a full-height one swallowed every click (fixed).
- **The website stays the web version of the app** (no download page, publisher unchanged).
  About screen = two rows on the left (original row width): **Help / About** (blue ⓘ) and **GitHub**
  (official solid logo on a white square → repo). Help / About opens a wide white pop-up (Modal type
  `about`, `components.jsx`), scaled down evenly to fit small screens: left = AlphabetMath, tagline,
  short paragraph, big white **[⬇] Get Started** button and the version; right = creator card
  (Nana Kumi · Creative Developer · SUNY · New York · email · GitHub). On the website Get Started
  downloads `releases/latest/download/AlphabetMath.dmg`; in the desktop app
  (`location.protocol === 'app:'`) it closes the window. (Tried and dropped: a Download row, a
  collapsible intro, an arrow-and-expand section, and the original intro card with GitHub under it.)
- **Loader fetches with `cache: "no-cache"`** (`Mobile/index.html`) so Safari can't mix stale and new
  modules (it once showed "Importing binding name 'GitHubMark' is not found").
- **Version 0.0.1** — `APP_VERSION` in `components.jsx` and `version` in `AlphabetMath - Desktop/package.json`;
  keep both in step with the GitHub Release tag.

**Next**
1. User: commit + push; publish Release `v0.0.1` with `AlphabetMath.dmg`; then merge to `main`.
2. Archive the old IdeaProjects copy. 3. Own domain (`alphabetmath.app`), later.
4. The function-modeling tool (vectors + matrices; algebra steps animated as geometry) — drafted in
   `interactives/`, ported when ready.

_Everything below is history._

---

## The goal (one sentence)
Have **ONE master copy of the code** — `AlphabetMath - Mobile/zmath/` ("the brain") — that
every version reads from, so the copies can't drift apart. **This is now true.**

## The two versions (both alive)
- **`AlphabetMath - Mobile/`** — the no-build live product. Its `index.html` runs the brain
  directly in the browser. This is what people see.
- **`AlphabetMath - App/`** — the buildable Vite version. `src/main.jsx` is a thin reader
  that imports the brain from the sibling folder. Holds no source of its own.

Everything that can drift now lives in the brain:
- `zmath/styles.css` is the ONE stylesheet entry (@imports tokens → app → tweaks). Both
  readers load only it. New stylesheets get added there, never in the shells.
- The title is set by `zmath/main.jsx` (`document.title`). Both `index.html` shells are
  minimal and identical apart from their loaders (splash div is byte-identical).

---

## Migration — COMPLETE
- **Phases 0–2 — DONE** (loader proven; brain converted to ESM; App repointed to the brain).
- **Phase 3 — DONE (2026-07-09).** Interactives + `lab.css` repointed to the brain's
  `tokens.css` (`../AlphabetMath - Mobile/zmath/tokens.css`); root `zmath/` deleted; orphaned
  root `kit-directions.jsx` deleted.
- **Shell-sync fix — DONE (2026-07-09).** `styles.css` entry + title-in-brain (see above).
  The App inherits brain changes with zero hand-syncing.
- `MIGRATION-PLAN.md` is now historical record only.

## Doc cleanup — DONE (2026-07-09)
- Deleted the two obsolete local-setup guides (Windows Setup, App Build Instructions) —
  superseded by the Codespaces plan.
- Root `CLAUDE.md` corrected (the App is alive, not dead).
- `Mobile/GUIDE.md` was already ESM-accurate; stylesheet description updated.

---

## Next: the GitHub / Codespaces port (Phase D)
Decisions locked with the user:
- Port the whole project root to the existing **`alphabetmath`** repo (matches the App's
  `base: '/alphabetmath/'`) via **GitHub Desktop** (clone empty repo → drop files → commit
  → push).
- **Codespace is run-only for now**; the user takes over editing there later, at which point
  the studio steps back. Never edit in both places during the same stretch.
- `uploads/`, `scraps/`, `_ds/` **never ship** to GitHub. `interactives/` + `explore/` DO go in.

Remaining to-dos:
1. ~~Root `.gitignore`~~ — DONE.
2. ~~`.devcontainer`~~ — DONE (Node 20, auto `npm install`, ports 5173/5500).
3. ~~Codespaces Handbook~~ — DONE (`AlphabetMath - Codespaces Handbook.html`, Parts 0–4).
4. The port itself — USER ACTION: follow Handbook Part 1 (clone repo → drop zip → commit → push).
5. ~~Public link~~ — DONE: root `.github/workflows/deploy.yml` builds the App version to
   GitHub Pages on every push (`https://<username>.github.io/alphabetmath/`). One-time user
   setting: repo → Settings → Pages → Source: GitHub Actions (Handbook Part 3). The old
   workflow inside `AlphabetMath - App/.github/` was moved to root + paths fixed.

---

## Open follow-ups (not urgent)
1. **Visible "Zmath" strings** remain in places (render-error text, About GitHub handle,
   internal `ZMATH_*` identifiers — the identifiers stay by decision).
2. `AlphabetMath - App/CLAUDE-CODE-HANDOFF.md` predates the Codespaces decision — review
   during the port.

---

## Folder map (updated 2026-11-14)
```
~/Projects/alphabetmath/  (project root — the only copy)
├── AlphabetMath - Desktop/          ← ★ THE PRODUCT ★ Electron window (main.js, package.json)
├── AlphabetMath - App/              ← Vite reader (thin; alive)
│   ├── index.html                   ← minimal shell
│   ├── src/main.jsx                 ← imports brain styles.css + main.jsx
│   └── vite.config.js               ← base:/alphabetmath/, fs.allow:['..']
├── AlphabetMath - Mobile/           ← the reader the desktop app shows (localhost:5500)
│   ├── index.html                   ← minimal shell + no-build loader
│   ├── vendor/                      ← local React, ReactDOM, Babel (offline)
│   ├── explore/                     ← design studies (+ index.html page list) — never in the app
│   └── zmath/                       ← ★ THE BRAIN ★ (incl. styles.css entry)
├── interactives/                    ← playable lesson drafts — never in the app
├── index.html                       ← studio page list (localhost:5501)
├── .github/workflows/deploy.yml     ← GitHub Pages publisher (runs on push to main)
├── CLAUDE.md · STATUS.md
```

---

## 2026-11-11 — moved out of the canvas to a local project
- **Mobile reader no longer uses esm.sh.** `AlphabetMath - Mobile/index.html` loads the
  React 18.3.1 UMD builds from unpkg, and its loader swaps the bare `react` /
  `react-dom` / `react-dom/client` imports for small shims over `window.React` /
  `window.ReactDOM`. The import map is gone. Brain source files are unchanged.
- **Default Screen fit is now `poster`** (`TWEAK_DEFAULTS` in `zmath/app.jsx`); Tray stays
  `aligned`.
- (IntelliJ run buttons were added here; IntelliJ is no longer used — see NOW at the top.)
- _Superseded 2026-11-14:_ React/ReactDOM/Babel now load from `Mobile/vendor/`, not unpkg.
- **Left behind in the canvas (studio-only):** `uploads/`, `scraps/`, `_ds/`, `_download/`,
  `gate-fix/`.
- This folder is now the working copy. Do not keep editing the canvas copy.
