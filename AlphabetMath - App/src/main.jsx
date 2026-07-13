/* AlphabetMath — App entry.

   This file is a THIN READER. It holds no app source of its own — the real,
   single-source code ("the brain") lives in the sibling folder:
       ../../AlphabetMath - Mobile/zmath/
   Both the desktop App (this Vite build) and the no-build Mobile preview read
   that one folder, so the two can never drift apart.

   What this does:
     1. pulls in the brain's single stylesheet entry (zmath/styles.css — it
        @imports the full list, so this file never changes when styles do), and
     2. pulls in the brain's entry (zmath/main.jsx), which draws the app into
        <div id="root"> via its own createRoot().

   EDIT CODE IN "AlphabetMath - Mobile/zmath/", NEVER HERE.

   Vite resolves these relative imports and follows the whole graph when building,
   so the production dist/ is fully self-contained. Dev-time serving of the
   sibling folder is permitted by server.fs.allow in vite.config.js. */
import "../../AlphabetMath - Mobile/zmath/styles.css";
import "../../AlphabetMath - Mobile/zmath/main.jsx";
