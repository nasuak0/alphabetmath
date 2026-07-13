# AlphabetMath — Current Status (v0.11)

_Snapshot of where the project stands right now and what's next._

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

## Folder map (now)
```
0.11/  (project root)
├── AlphabetMath - App/              ← Vite reader (thin; alive)
│   ├── index.html                   ← minimal shell
│   ├── src/main.jsx                 ← imports brain styles.css + main.jsx
│   └── vite.config.js               ← base:/alphabetmath/, fs.allow:['..']
├── AlphabetMath - Mobile/           ← the live product
│   ├── index.html                   ← minimal shell + no-build loader
│   ├── explore/                     ← design studies (ship to GitHub)
│   └── zmath/                       ← ★ THE BRAIN ★ (incl. styles.css entry)
├── interactives/                    ← playable lesson drafts (ship to GitHub)
├── uploads/ scraps/ _ds/            ← studio-only, NEVER ship
├── AlphabetMath - Codespaces Plan.html
├── CLAUDE.md · STATUS.md
```
