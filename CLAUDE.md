# Project rules (persistent)

- **One brain:** all app source lives in `AlphabetMath - Mobile/zmath/`. Edit code THERE, nowhere else.
- **The product is the desktop app** (`AlphabetMath - Desktop/`, Electron). It holds no app code: it opens a
  window onto the Mobile reader. Three readers, one brain:
  - `AlphabetMath - Desktop/` — **the product.** `main.js` serves the Mobile folder at `app://alphabetmath/`.
  - `AlphabetMath - Mobile/index.html` — the no-build reader the desktop app shows; also the browser preview
    at `localhost:5500`. When the user says "the app", they mean this app.
  - `AlphabetMath - App/` — the Vite build. A THIN READER (`src/main.jsx` imports the brain). Never copy brain
    source into it.
- **The desktop app is identical to the Mobile reader.** No desktop-only design or features.
- **Offline:** React, ReactDOM and Babel are kept in `AlphabetMath - Mobile/vendor/`. Never point them back at a CDN.
- **Drafts stay outside the app.** `interactives/` + `AlphabetMath - Mobile/explore/` are the drafting table;
  only finished pieces are ported into `zmath/`. The packaged app contains only `index.html`, `zmath/` and
  `vendor/` — never `explore/`.
- `uploads/`, `scraps/`, `_ds/` are studio-only — never ship to GitHub.
- **Workflow: the user requires a precise plan and explicit consent BEFORE any edit.** Think first, state exactly
  what will change, wait for a green light. Explain in plain, simple English.
- **Where the project lives:** `~/Projects/alphabetmath` — the ONLY copy (Git, linked to GitHub
  `nasuak0/alphabetmath` through GitHub Desktop). The old `~/IdeaProjects/AlphabetMath` is retired; never edit it.
- **Tools:** the user works only in the Claude app (no IntelliJ). They review changes in GitHub Desktop and push
  from there — Claude cannot push.
- **Website:** merging to `main` rebuilds the GitHub Pages site (`.github/workflows/deploy.yml`). Ask first.
- **TRAY-CONTAINMENT RULE (permanent, do not break):** on Home and Topics, the tiles/cartridges live INSIDE the
  `.scr` tray as one scaling unit — exactly like the cartridges in the Lab screen. The structure is
  `lab-stage → heroScale → .scr → tiles`. Tiles must always be children of `.scr`; never a separate island layered
  on top of a differently-sized tray. Resizing tile/cartridge dimensions is fine and does NOT affect this rule.
  Never reintroduce a `.canvas1024` (or any) inner wrapper that decouples the tiles from the tray.
