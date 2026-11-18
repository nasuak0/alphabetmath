/* AlphabetMath — desktop app (Electron).

   This file is a THIN READER, like AlphabetMath - App/src/main.jsx. It holds no
   app source of its own: it opens a window onto the Mobile reader
   (../AlphabetMath - Mobile/index.html), which runs the brain (zmath/).

   EDIT CODE IN "AlphabetMath - Mobile/zmath/", NEVER HERE.
   While developing (npm start) the window reads the project folder live, so an
   edit shows up after Cmd+R in the window.

   Why a custom "app://" address instead of opening the file directly:
   the Mobile loader fetch()es each .jsx module, and fetch() is blocked for
   file:// pages. The app:// scheme serves the Mobile folder from inside the
   app — the same job localhost:5500 does in the browser, with no server. */
const { app, BrowserWindow, WebContentsView, protocol, net, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// The folder the window shows: the Mobile reader (index.html + zmath/ + vendor/).
// While developing (npm start) that's the live project folder next door; in the
// packaged AlphabetMath.app it's the copy electron-builder puts in Resources/mobile
// (app only — explore/ drafts are left out; see "extraResources" in package.json).
const MOBILE_DIR = app.isPackaged
  ? path.join(process.resourcesPath, "mobile")
  : path.resolve(__dirname, "..", "AlphabetMath - Mobile");
const HOST = "alphabetmath";
const START_URL = `app://${HOST}/index.html`;

// Must run before the app is ready: let app:// behave like a normal https page
// (relative links, fetch(), ES modules, storage all work).
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

function serveMobileFolder() {
  protocol.handle("app", (request) => {
    const { pathname } = new URL(request.url);
    const filePath = path.normalize(path.join(MOBILE_DIR, decodeURIComponent(pathname)));
    // Never serve anything outside the Mobile folder.
    if (!filePath.startsWith(MOBILE_DIR + path.sep)) {
      return new Response("Not found", { status: 404 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

/* Window size (in points). The app hides itself behind a
   "needs a bigger screen" notice when the page is narrower than 700
   or not taller than 500 (the phone gate in Mobile/index.html). */
function windowSize() {
  // Opens at the iPad canvas the design was drawn on; can't shrink past the
  // point where the tiles get cramped (well above the 700 × 500 phone gate).
  return { width: 1180, height: 820, minWidth: 1024, minHeight: 700 };
}

/* The window has no grey title bar. Instead it has two layers:
   1. a thin TOP STRIP (STRIP_H tall, painted like the app's own ground) that holds the
      red/yellow/green buttons and is the handle to drag the window by;
   2. the APP, placed just below the strip — so nothing sits under the buttons,
      and the app measures its real (shorter) height and scales correctly.
   Desktop-only: the shared app code in zmath/ and the browser version are untouched. */
const STRIP_H = 10; // thin on purpose (user's choice); the window buttons hang just below it
const BG = "#f4f5fb"; // the loading-screen colour (window + app view background while loading)
// The strip paints the SAME ground as the app's .os (zmath/app.css + tokens.css): the white
// radial gradient, the faint pastel glows and the 22px dot grid — so there's no visible line
// where the strip meets the app. The dot grid is shifted (STRIP_H % 22) so it keeps its 22px
// rhythm across the seam. If the app's ground changes in app.css, mirror it here.
// The drag handle must cover ONLY the strip (STRIP_H tall). macOS applies a page's drag
// regions to the whole window, so a full-height handle here would swallow every click
// meant for the app layered on top of it.
const STRIP_CSS = `
  html,body{margin:0;height:100%;overflow:hidden}
  body{position:relative;background:radial-gradient(120% 90% at 50% -10%,#ffffff,#fcfdff 55%,#f6f7fb 100%)}
  body::before{content:"";position:absolute;inset:-15%;filter:blur(40px);background:
    radial-gradient(26% 24% at 14% 18%,rgba(160,110,224,0.09),transparent 70%),
    radial-gradient(24% 22% at 86% 14%,rgba(255,150,110,0.07),transparent 70%)}
  body::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,0.07) 1px,transparent 1.5px);
    background-size:22px 22px;background-position:0 ${STRIP_H % 22}px}
  .drag{position:relative;z-index:1;height:${STRIP_H}px;-webkit-app-region:drag}`;
const STRIP_PAGE =
  "data:text/html;charset=utf-8," +
  encodeURIComponent(
    `<!DOCTYPE html><html><head><title>AlphabetMath</title><style>${STRIP_CSS}</style></head>` +
    `<body><div class="drag"></div></body></html>`
  );

function createWindow() {
  const secure = { contextIsolation: true, nodeIntegration: false, sandbox: true };

  // Layer 1 — the window itself shows the top strip.
  const win = new BrowserWindow({
    ...windowSize(),
    title: "AlphabetMath",
    backgroundColor: BG, // no white flash while loading
    titleBarStyle: "hidden",
    // Buttons (~12px tall) are taller than the 10px strip, so they sit 4px from the top and
    // reach a few px into the app's own empty top margin (above the side bar).
    trafficLightPosition: { x: 14, y: Math.max(4, (STRIP_H - 12) / 2) },
    show: false,
    webPreferences: secure,
  });
  win.loadURL(STRIP_PAGE);
  win.once("ready-to-show", () => win.show());
  // Keep the window named "AlphabetMath" (Window menu, Mission Control).
  win.on("page-title-updated", (event) => event.preventDefault());

  // Layer 2 — the app, below the strip, resized with the window.
  const view = new WebContentsView({ webPreferences: secure });
  view.setBackgroundColor(BG);
  win.contentView.addChildView(view);
  const layout = () => {
    const [width, height] = win.getContentSize();
    view.setBounds({ x: 0, y: STRIP_H, width, height: height - STRIP_H });
  };
  layout();
  win.on("resize", layout);

  // Links that leave the app (e.g. GitHub in About) open in the normal browser.
  const appWeb = view.webContents;
  appWeb.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`app://${HOST}/`)) shell.openExternal(url);
    return { action: "deny" };
  });
  appWeb.on("will-navigate", (event, url) => {
    if (!url.startsWith(`app://${HOST}/`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  appWeb.loadURL(START_URL);
}

app.whenReady().then(() => {
  serveMobileFolder();
  createWindow();
  // macOS: clicking the Dock icon with no windows open makes a new one.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// macOS convention: closing the last window keeps the app in the Dock,
// except on other systems where it quits.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
