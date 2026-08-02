# Project rules (persistent)

- **One brain:** all app source lives in `AlphabetMath - Mobile/zmath/`. Edit code THERE, nowhere else.
- **Two readers, both alive:**
  - `AlphabetMath - Mobile/index.html` — the live product (no-build, in-browser loader). When the user says "the app", they mean this.
  - `AlphabetMath - App/` — the Vite build. It is a THIN READER (`src/main.jsx` imports the brain). Never copy brain source into it.
- `interactives/` + `AlphabetMath - Mobile/explore/` are the drafting table: pieces are built there, then transported into the live `index.html`.
- `uploads/`, `scraps/`, `_ds/` are studio-only — never ship to GitHub.
- **Workflow: the user requires a precise plan and explicit consent BEFORE any edit.** Think first, state exactly what will change, wait for a green light.
- Codespaces plan: the project ports to the `alphabetmath` GitHub repo via GitHub Desktop; the Codespace is run-only for now (user takes over editing later). See STATUS.md.
- **TRAY-CONTAINMENT RULE (permanent, do not break):** on Home and Topics, the tiles/cartridges live INSIDE the `.scr` tray as one scaling unit — exactly like the cartridges in the Lab screen. The structure is `lab-stage → heroScale → .scr → tiles`. Tiles must always be children of `.scr`; never a separate island layered on top of a differently-sized tray. Resizing tile/cartridge dimensions is fine and does NOT affect this rule. Never reintroduce a `.canvas1024` (or any) inner wrapper that decouples the tiles from the tray.
