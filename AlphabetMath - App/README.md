# Zmath — Vite + React

The Zmath home menu, converted from the browser/Babel build into a real
Vite + React app. Same UI and logic — just compiled ahead of time, with
real `import`/`export` instead of `window` globals.

## Run it locally

You need [Node.js](https://nodejs.org) 18+ installed. Then, in this folder:

```bash
npm install      # one time — downloads React, Vite, etc.
npm run dev      # start the live dev server (http://localhost:5173)
```

Edit any file in `src/` and the browser hot-reloads instantly.

## Build for production

```bash
npm run build    # outputs the finished site to dist/
npm run preview  # preview that production build locally
```

## Deploy to GitHub Pages (automatic)

1. Push this folder to a GitHub repo named **zmath-app**.
2. In the repo: **Settings → Pages → Source → "GitHub Actions"**.
3. Every push to `main` triggers `.github/workflows/deploy.yml`, which builds
   and publishes automatically. Your site lands at
   `https://YOUR-USERNAME.github.io/zmath-app/`.

> The `base` in `vite.config.js` is set to `/zmath-app/` to match that URL.
> If you later move to a custom domain (e.g. `zmath.com`), change `base` to `/`.

## What's inside `src/`

| File | Role |
|------|------|
| `main.jsx` | Entry point — mounts `<App>`, imports the CSS |
| `app.jsx` | App shell + screens (Home, Topics, Projects, Notes, About) |
| `components.jsx` | Sidebar, Dock, Tile, Modal |
| `icons.jsx` | Icon / GlyphIcon / CapsuleIcon |
| `coverart.jsx` | Generative SVG cover art per topic |
| `tweaks-panel.jsx` | The Tweaks panel + controls |
| `data.js` | Topics, projects, notes content |
| `styles/` | `tokens.css`, `app.css`, `tweaks-overrides.css` |
| `logo.svg` | Brand mark (imported by components/app) |

## Note on the Tweaks panel

The Tweaks panel only opens when a host environment activates it, which
doesn't happen on a plain deployed site — so on your live site it stays
hidden and the values in `TWEAK_DEFAULTS` (top of `app.jsx`) apply. To make
tweaks adjustable live, swap the host messaging in `useTweaks`
(`tweaks-panel.jsx`) for `localStorage`.
