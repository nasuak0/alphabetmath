# Zmath — Home Menu

A personal mathematics portfolio, laid out like a Nintendo 3DS / Wii U **home menu**:
a left "Miiverse" rail, a scrolling stage of glossy tiles, and a floating glass dock.
Built as a single-page React app with **no build step** — everything runs in the browser
straight from these files.

> **New here? Read [`GUIDE.md`](./GUIDE.md).** It walks every file line-by-line and maps
> each piece of code to exactly what it draws on screen. [`CLAUDE.md`](./CLAUDE.md) tells
> Claude Code how the project is wired and how to make changes safely.

---

## Run it (30 seconds)

The app loads `.jsx` files through Babel in the browser. Browsers block that over
`file://`, so **you must serve the folder over HTTP** — double-clicking `index.html`
will show a blank page.

### Option A — VS Code Live Server (recommended)
1. Open this folder in VS Code (`File → Open Folder…`).
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions panel.
3. Right-click `index.html` → **"Open with Live Server."**
4. Your browser opens at `http://127.0.0.1:5500` and the app loads. Edits to any file
   reload automatically.

### Option B — one terminal command
From this folder:
```bash
python3 -m http.server 5500      # then open http://localhost:5500
# or:  npx serve .
```

That's the whole toolchain. No `npm install`, no bundler, no config.

---

## File map

```
zmath-portable/
├── index.html          ← the only HTML file. Loads CSS, then React + Babel, then the app.
├── zmath/
│   ├── tokens.css      ← design tokens: colors, type, glass, radii, shadows, motion.
│   ├── app.css         ← all layout + component styling (rail, tiles, dock, modal…).
│   ├── data.js         ← the CONTENT: topics, projects, notes. Edit this to change copy.
│   ├── icons.jsx       ← line-icon set (<Icon>) + glossy dock glyphs (<GlyphIcon>).
│   ├── coverart.jsx    ← generative SVG "math scenes" painted on every tile.
│   ├── components.jsx  ← Sidebar, Dock, Tile, Modal, the pixel-letter brand mark.
│   ├── app.jsx         ← the 5 screens (Home/Topics/Projects/Notes/About) + app shell.
│   └── logo.svg        ← pixel-grid "Z" used as the avatar / signature mark.
├── GUIDE.md            ← deep code→screen walkthrough (start here to learn the code).
├── CLAUDE.md           ← orientation for Claude Code + common-edit recipes.
└── README.md           ← this file.
```

### Load order (set in `index.html`)
The scripts run top-to-bottom, and later files depend on earlier ones:

```
React → ReactDOM → Babel          (CDN, pinned versions)
data.js        → window.ZMATH_TOPICS / ZMATH_PROJECTS / ZMATH_NOTES
icons.jsx      → window.Icon, window.GlyphIcon
coverart.jsx   → window.CoverArt
components.jsx → window.Sidebar / Dock / Tile / Modal
app.jsx        → defines App and calls ReactDOM.createRoot(...).render(<App/>)
```

Because each `<script type="text/babel">` gets its own scope, shared pieces are hung on
`window.*` so the next file can see them. That's why you'll see `window.Icon = Icon;` at
the bottom of files. Keep that pattern when you add new shared components.

---

## What's *not* in this folder
The original project carried ~200 working screenshots and photo references used while
designing. They're development artifacts, not part of the app, so they're left out to keep
this clean. The app is complete and runnable as-is.

The visual style (colors, type, glass, radii) was lifted from a separate **Zmath Design
System**; its values already live in `zmath/tokens.css`, so you don't need the design
system to run or edit this.

---

© 2026 Nana · Zmath. Educational / portfolio use.
