repo: nasuak0/alphabetmath
branch: main
path: AlphabetMath - Mobile/zmath

## Reference repos (read-only, not the source of this project)
- zhilips/zperiod@main — studied `script.js` (`isRealMobileDevice`) and `css/mobile-landing.css` for the phone-detection pattern and mobile-landing approach. Nothing copied.

## Last sync
date: 2026-08-01T14:34:19Z

### Updated in this project
- Drafted `AlphabetMath - Mobile/explore/Mobile Landing.html` — phone-first landing to show instead of the app.
- Detection reworked to read hardware (screen short side + coarse pointer + iPad exception) so an iPhone in landscape is still caught. Not yet wired into either shell.

## Sync history
### 2026-07-29T12:33:15Z
- Read-only diagnostic pass — no code changed.
- Traced the Safari-tab-bar tile resize/shift to the height-driven tray fit.
- Confirmed live deploy builds `AlphabetMath - App` from the `zmath` brain.

## Screen map
| Screen | Repo files |
| --- | --- |
| Home (shelves tray) | AlphabetMath - Mobile/zmath/picker-screens.jsx, picker.css, lab.css |
| Topics / Library (grid tray) | AlphabetMath - Mobile/zmath/picker-screens.jsx, picker.css, lab.css |
| Lab (spotlight tray) | AlphabetMath - Mobile/zmath/lab-screen.jsx, lab.css |
| App shell / fit modes | AlphabetMath - Mobile/zmath/app.jsx, app.css |
| Deploy | .github/workflows/deploy.yml → AlphabetMath - App/dist |
