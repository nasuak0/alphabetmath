import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub repo name you publish under:
//   https://USERNAME.github.io/<repo>/   → set base to '/<repo>/'
// It is currently '/alphabetmath/' — CHANGE IT if your repo is named differently.
// When you move to a custom domain (e.g. alphabetmath.com), change this to '/'.
export default defineConfig({
  plugins: [react()],
  base: '/alphabetmath/',

  // The shared source ("the brain") lives in the sibling folder
  // "AlphabetMath - Mobile/zmath/", one level ABOVE this app. By default Vite's
  // dev server only serves files inside this app's own root, so it would refuse
  // to open the brain during `npm run dev`. Allowing one level up fixes that.
  // (Note: `npm run build` bundles the brain in no matter what, so the shipped
  // dist/ folder is still fully self-contained — this only affects dev serving.)
  server: {
    fs: { allow: ['..'] },
  },
})
