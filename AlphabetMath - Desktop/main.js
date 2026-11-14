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
const { app, BrowserWindow, protocol, net, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// The folder the window shows: the Mobile reader (index.html + zmath/ + vendor/).
const MOBILE_DIR = path.resolve(__dirname, "..", "AlphabetMath - Mobile");
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

function createWindow() {
  const win = new BrowserWindow({
    ...windowSize(),
    title: "AlphabetMath",
    backgroundColor: "#f4f5fb", // matches the loading screen, so no white flash
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  // Links that leave the app (e.g. GitHub in About) open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`app://${HOST}/`)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(`app://${HOST}/`)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadURL(START_URL);
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
