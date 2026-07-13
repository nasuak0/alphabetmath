# CLAUDE-CODE-HANDOFF.md — read me first

> **You (Claude Code) are running locally in VS Code. Your job in this folder is to
> RUN and BUILD the app — not to rewrite its source.** The actual app code lives in a
> sibling folder. Read the guardrails below before touching anything.

---

## What this folder is
`AlphabetMath - App/` is the **buildable desktop/web version** of AlphabetMath — a Vite +
React project you develop and ship from VS Code (the same workflow as zperiod.app).

**It holds almost no source of its own.** Its entire `src/` is a *thin reader*:
`src/main.jsx` imports the real code — "the brain" — from the sibling folder one level up:

```
AlphabetMath - App/            ← you are here (the reader / builder)
  src/main.jsx                 ← the ONLY app file here; ~20 lines; pulls in the brain
  vite.config.js               ← allows Vite to read the sibling brain (server.fs.allow)
  package.json                 ← react, react-dom, vite, @vitejs/plugin-react
AlphabetMath - Mobile/         ← the sibling
  zmath/                       ← ★ THE BRAIN — the single source of truth ★
    main.jsx app.jsx components.jsx icons.jsx coverart.jsx figkit.jsx
    figures.jsx figures-registry.js data.js tokens.css app.css
    tweaks-panel.jsx tweaks-overrides.css
```

Both this App **and** the no-build Mobile preview read from `AlphabetMath - Mobile/zmath/`.
That one folder is why the two versions can't drift apart. **Protect that.**

---

## ⛔ The one rule that must never break: DON'T DUPLICATE THE BRAIN
- **Never** recreate `app.jsx`, `components.jsx`, `data.js`, the CSS, etc. inside this
  folder's `src/`. The whole point of Phase 2 was deleting those duplicates. If you find
  yourself adding a `.jsx`/`.css` file under `AlphabetMath - App/src/`, **stop** — that is
  the bug, not the fix.
- `src/main.jsx` should stay tiny: three CSS imports + one entry import, all pointing at
  `../../AlphabetMath - Mobile/zmath/...`. Don't inline code into it.
- **Do not edit files in `AlphabetMath - Mobile/zmath/` from this session.** Source/content/
  design changes are made elsewhere (in the main design environment) and arrive here as
  updates. Your job is to run what's there, not to author it.
- If running reveals a genuine code bug in the brain, **report it** — quote the file, line,
  and error — and ask before changing it. Don't silently patch the brain to make a build pass.

✅ **You MAY freely:** run dev/build/preview, install dependencies, read any file to diagnose,
edit `package.json` scripts, edit `vite.config.js`, manage git, and fix App-level build/config
issues that don't involve copying brain source into this folder.

---

## How to run (do these in THIS folder)
First time only — install the toolchain (pulls react, react-dom, vite):
```bash
npm install
```

Start the live dev server (hot-reloads on save):
```bash
npm run dev          # prints http://localhost:5173/zmath-app/ — Ctrl/Cmd-click it
```

Build the self-contained production bundle, then preview it exactly as shipped:
```bash
npm run build        # outputs dist/  (Vite bundles the brain IN — dist/ is standalone)
npm run preview      # serves the built dist/ locally to sanity-check
```

Stop any server with `Ctrl + C`.

> **Windows / PowerShell snag:** if `npm` errors with *"running scripts is disabled on this
> system,"* either switch the VS Code terminal to **Command Prompt** (terminal panel ˅ →
> Select Default Profile → Command Prompt) or run once:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

---

## How to verify Phase 2 actually worked (the task at hand)
1. `npm install` completes with no red `npm ERR!`.
2. `npm run dev` serves the app and the browser shows the AlphabetMath home menu — side rail,
   tiles, and the Topics / Projects / Notes / About screens — with **no console errors** about
   a missing module from the `AlphabetMath - Mobile/zmath/` path.
3. `npm run build` succeeds and produces `dist/`. (This proves Vite can follow the import graph
   into the sibling brain and bake it in.) Optionally `npm run preview` to view the built app.

If all three pass, Phase 2 is verified — tell the user "it runs," nothing else to do here.

---

## If something breaks — likely causes, in order
- **`Failed to resolve import ".../AlphabetMath - Mobile/zmath/..."`** → the two folders got
  separated, OR `vite.config.js` is missing `server: { fs: { allow: ['..'] } }`. The brain
  must sit next to this folder. Don't fix this by copying the brain in — restore the sibling
  or the config.
- **Blank page, console error about React** → a dependency didn't install; re-run `npm install`.
- **Build fails on a specific brain file** → report the file + error to the user; do not edit
  the brain to force it through.
- **Wrong base path / 404 on assets when deployed** → `base: '/zmath-app/'` in `vite.config.js`
  must match the GitHub Pages sub-path. Adjust only if asked.

---

## Coordination (why this matters)
This project is edited in a separate design environment; **this local checkout is for running
and shipping.** To preserve the single-source-of-truth, treat the brain as read-only here.
When the user brings down an update, just re-run `npm run dev` / `npm run build` — no
`npm install` needed unless `package.json` changed.
