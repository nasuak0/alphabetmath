/* Zmath figure registry — ONE shared object that both figures.jsx and
   components.jsx populate, and NoteBlock reads to render { fig:'name' }.
   Replaces the old window.ZFIGURES global so the import graph has a single
   well-defined owner (no load-order dependence). */
export const ZFIGURES = {};
