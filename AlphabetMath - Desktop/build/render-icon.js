/* Redraws build/icon.png (the λ app icon) from icon-source.html using the app's own fonts.
   Run from "AlphabetMath - Desktop":  ./node_modules/.bin/electron build/render-icon.js */
const { app, BrowserWindow } = require("electron");
const fs = require("fs"), path = require("path");
app.whenReady().then(async () => {
  const w = new BrowserWindow({ width: 1024, height: 1024, show: false, transparent: true, frame: false,
    webPreferences: { offscreen: true } });
  w.webContents.setZoomFactor(1);
  await w.loadFile(path.join(__dirname, "icon-source.html"));
  await w.webContents.executeJavaScript("document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,300)))");
  const img = await w.webContents.capturePage({ x: 0, y: 0, width: 1024, height: 1024 });
  fs.writeFileSync(path.join(__dirname, "icon.png"), img.resize({ width: 1024, height: 1024 }).toPNG());
  app.quit();
});
