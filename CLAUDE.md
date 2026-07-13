# Project rules (persistent)

- **One brain:** all app source lives in `AlphabetMath - Mobile/zmath/`. Edit code THERE, nowhere else.
- **Two readers, both alive:**
  - `AlphabetMath - Mobile/index.html` — the live product (no-build, in-browser loader). When the user says "the app", they mean this.
  - `AlphabetMath - App/` — the Vite build. It is a THIN READER (`src/main.jsx` imports the brain). Never copy brain source into it.
- `interactives/` + `AlphabetMath - Mobile/explore/` are the drafting table: pieces are built there, then transported into the live `index.html`.
- `uploads/`, `scraps/`, `_ds/` are studio-only — never ship to GitHub.
- **Workflow: the user requires a precise plan and explicit consent BEFORE any edit.** Think first, state exactly what will change, wait for a green light.
- Codespaces plan: the project ports to the `alphabetmath` GitHub repo via GitHub Desktop; the Codespace is run-only for now (user takes over editing later). See `AlphabetMath - Codespaces Handbook.html` + STATUS.md.
