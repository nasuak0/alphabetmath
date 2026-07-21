/* Zmath icons — thin rounded line icons (Lucide-style, ~1.9px, round caps).
   <Icon name="home" size={24}/> */
import React from "react";

const ZMATH_ICON_PATHS = {
  home:    '<path d="M12 3.2 20 11 20 20.5 15 20.5 15 14.5 9 14.5 9 20.5 4 20.5 4 11 Z"/>',
  shapes:  '<circle cx="7.5" cy="15.5" r="4"/><rect x="13" y="12" width="7" height="7" rx="1.2"/><path d="M9 3.5 13.5 11h-9z"/>',
  book:    '<path d="M12 6.5C9.3 5 5.2 5 3 6V18.4c2.2-1 6.3-1 9 .5Z"/><path d="M12 6.5C14.7 5 18.8 5 21 6V18.4c-2.2-1-6.3-1-9 .5Z"/>',
  layers:  '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  beaker:  '<path d="M9 3h6"/><path d="M10 3.5v5L5 19a1.3 1.3 0 0 0 1.2 1.9h11.6A1.3 1.3 0 0 0 19 19L14 8.5v-5Z"/><path d="M7.2 14.5h9.6"/>',
  note:    '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 9h6M9 13h6M9 17h5"/>',
  note2:   '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 11h6M9 15h4"/>',
  user:    '<circle cx="12" cy="6.6" r="3.2"/><path d="M5.5 19.8C5.5 16.2 8.4 14.6 12 14.6s6.5 1.6 6.5 5.2Z"/>',
  search:  '<circle cx="11" cy="11" r="6.5"/>',
  github:  '<path d="M9 19c-4 1.2-4-2-5.5-2.5M15 21v-3.2c0-1 .2-1.6-.4-2.2 2.8-.3 5.4-1.4 5.4-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6 2.2 5 2.5 5 2.5a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.6 9c0 4.5 2.6 5.6 5.4 6-.4.4-.5.9-.5 1.6V21"/>',
  coffee:  '<path d="M4 9h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z"/><path d="M17 10h2.2a2.3 2.3 0 0 1 0 4.6H17"/><path d="M7 3v2M11 3v2M15 3v2"/>',
  sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
  moon:    '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  arrow:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  x:       '<path d="M6 6l12 12M18 6 6 18"/>',
  sigma:   '<path d="M17 4H7l6 8-6 8h10"/>',
  external:'<path d="M14 5h5v5"/><path d="M19 5 10 14"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  play:    '<path d="M7 4.5 19 12 7 19.5Z"/>',
  bell:    '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2.4 2.4 0 0 0 4 0"/>',
  clock:   '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  lock:    '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  grid:    '<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  sparkle: '<path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
};

/* Thin sub-glyphs rendered as a SLIM solid stroke (≈ the visible ring border,
   not the full rim) on top of the capsule body — e.g. the magnifier handle. */
const ZMATH_ICON_THIN = {
  search:  '<path d="M19 19 21.2 21.2"/>',
};

function Icon({ name, size = 24, stroke = 'currentColor', sw = 1.9, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ZMATH_ICON_PATHS[name] || '' }} />
  );
}

/* GlyphIcon — chunky colored glyph for the glass dock/rail: a vertical
   gradient stroke (light top → deep bottom), a white top-edge highlight
   and a soft colored glow. Sits directly on frosted glass (no tile). */
function GlyphIcon({ name, size = 30, colors = ['#8a6bff', '#4a1fb0'], glow = 'rgba(74,31,176,0.45)', sw = 2.4 }) {
  const uid = React.useId().replace(/[:]/g, '');
  const gid = 'gly' + uid;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 -0.6px 0 rgba(255,255,255,0.75)) drop-shadow(0 1px 0 rgba(255,255,255,0.4)) drop-shadow(0 2.5px 3.5px ${glow})` }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gid})`} strokeWidth={sw} fill="none"
        dangerouslySetInnerHTML={{ __html: ZMATH_ICON_PATHS[name] || '' }} />
    </svg>
  );
}
export { Icon, GlyphIcon, CapsuleIcon };
/* _mix — shift a #rrggbb hex toward white (amt>0) or black (amt<0). */
function _mix(hex, amt) {
  const h = hex.replace('#', '');
  let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
  const to = v => ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2);
  return '#' + to(r) + to(g) + to(b);
}

/* SOFT glyphs — two nested filled paths from the flat-icon study (explore/):
   frame = the flat silhouette (glyph dilated 2.1u), ink = the glyph itself,
   every 90° vertex filleted — concentric contours, like the tile frame + label. */
const ZMATH_ICON_SOFT = {
  home: {
    frame: 'M10.515 1.715 Q12 0.23 13.485 1.715 L21.485 9.515 Q22.1 10.33 22.1 11 L22.1 20.5 Q22.1 22.6 20 22.6 L15 22.6 Q12.9 22.6 12.9 20.5 L12.9 16.9 Q12.9 16.6 12.6 16.6 L11.4 16.6 Q11.1 16.6 11.1 16.9 L11.1 20.5 Q11.1 22.6 9 22.6 L4 22.6 Q1.9 22.6 1.9 20.5 L1.9 11 Q1.9 10.33 2.515 9.515 Z',
    ink:   'M11.22 3.98 Q12 3.2 12.78 3.98 L19.77 10.77 Q20 11 20 11.33 L20 19.8 Q20 20.5 19.3 20.5 L15.7 20.5 Q15 20.5 15 19.8 L15 15.0 Q15 14.5 14.5 14.5 L9.5 14.5 Q9 14.5 9 15.0 L9 19.8 Q9 20.5 8.3 20.5 L4.7 20.5 Q4 20.5 4 19.8 L4 11.33 Q4 11 4.23 10.77 Z'
  }
};

/* CapsuleIcon — built like the TILES: a thick colored-gradient rim around a generous white
   interior (gradient stroke UNDER, white fill OVER so white reaches the path edge and the
   gradient only shows as an outer border). Rounded joins + soft drop-shadow = the iisu look.
   material='grey' swaps the colored rim for the cool-grey badge-tray material and renders
   it flatter / more 2D (no extrude, no colored glow). */
function CapsuleIcon({ name, size = 36, colors = ['#8a6bff', '#4a1fb0'], glow = 'rgba(74,31,176,0.45)', sw = 2.4, active = false, depth = 'raised', material = 'color', rim = 4.2, finish = 'glossy' }) {
  const uid = React.useId().replace(/[:]/g, '');
  const gid = 'cap' + uid;
  const softGeo = finish === 'soft' ? ZMATH_ICON_SOFT[name] : null;
  const flatLook = finish === 'flat' || (finish === 'soft' && !softGeo);
  const grey = material === 'grey';
  const moat = material === 'moat';
  const paths = ZMATH_ICON_PATHS[name] || '';
  const thin = ZMATH_ICON_THIN[name] || '';
  /* FLAT study imports (explore/Design Icons.html): Notes' flat build is the
     dog-eared ruled sheet, not the plain rect — doc rim + white ink + fold seam. */
  const flatNote = flatLook && (name === 'note' || name === 'note2');
  const NOTE_DOC = 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z';
  const NOTE_FOLD = 'M14 2.2v4.3a1.5 1.5 0 0 0 1.5 1.5h4.3';
  // grey: crisp embossed light-grey stroke (badge-tray border tone).
  // moat: the glyph LINES are cut from the cool-grey moat-ring material itself —
  //   an engraved look (dark cool-grey top edge in shadow, lighter cool-grey below
  //   catching light, plus a thin white under-rim like the moat groove).
  const c0 = moat ? '#c3cad9' : grey ? '#eef1f7' : colors[0];
  const c1 = moat ? '#e7eaf1' : grey ? '#bcc3d3' : colors[1];
  const deep = grey || moat ? '#aab1c4' : colors[1];
  const filter = (softGeo || flatLook)
    // flat / soft finish — neutral contact shadow + the glossy's 1px deep extrude
    ? `drop-shadow(0 1px 0 ${deep}) drop-shadow(0 1.5px 2.5px rgba(0,0,0,0.16))`
    : moat
    // moat: flat 2D — no bevel, just the clean grey glyph (single solid piece)
    ? 'none'
    : grey
    // grey: tight bevel only — hairline white top edge + hairline grey under-edge
    ? `drop-shadow(0 -0.5px 0 rgba(255,255,255,0.85)) drop-shadow(0 0.7px 0 rgba(150,160,185,0.5))`
    : depth === 'embedded'
    // embedded: the raised shadow, vertically reversed (cast upward)
    ? `drop-shadow(0 -1px 0 ${deep}) drop-shadow(0 ${active ? -3 : -2}px ${active ? 5 : 3.5}px ${glow}) drop-shadow(0 -0.5px 0.5px rgba(20,12,40,0.22))`
    : depth === 'flat'
    // flat: no depth at all
    ? 'none'
    // raised: extruded sticker popping off the surface
    : `drop-shadow(0 1px 0 ${deep}) drop-shadow(0 ${active ? 3 : 2}px ${active ? 5 : 3.5}px ${glow}) drop-shadow(0 0.5px 0.5px rgba(20,12,40,0.22))`;
  // SOFT — two nested filled paths (frame + molded white inset), like the tile's
  // frame + label boxes. Only glyphs redrawn in ZMATH_ICON_SOFT; others render flat.
  if (softGeo) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
        style={{ filter, overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
        </defs>
        <path d={softGeo.frame} fill={`url(#${gid})`} />
        <path d={softGeo.ink} fill="#ffffff" />
      </svg>
    );
  }
  if (flatNote) {
    /* seam gradient anchored to the doc's y-range so the fold color matches the rim */
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
        strokeLinecap="round" strokeLinejoin="round" style={{ filter, overflow: 'visible' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
          <linearGradient id={gid + 's'} gradientUnits="userSpaceOnUse" x1="0" y1="3" x2="0" y2="21">
            <stop offset="0" stopColor={c0} />
            <stop offset="1" stopColor={c1} />
          </linearGradient>
        </defs>
        <path d={NOTE_DOC} fill="none" stroke={`url(#${gid})`} strokeWidth={rim} />
        <path d={NOTE_DOC} fill="#ffffff" stroke="none" />
        <path d={NOTE_FOLD} fill="none" stroke={`url(#${gid}s)`} strokeWidth="2.2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ filter, overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c0} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      {/* gradient rim — thick stroke, sits underneath */}
      <g fill="none" stroke={`url(#${gid})`} strokeWidth={rim}
        dangerouslySetInnerHTML={{ __html: paths }} />
      {/* white interior — fills to the path edge, covering the inner half of the rim */}
      <g fill="#ffffff" stroke="none"
        dangerouslySetInnerHTML={{ __html: paths }} />
      {/* thin sub-glyph (e.g. magnifier handle) — the flat study draws the
          handle at FULL rim width (stubby bold handle) */}
      {thin && (
        <g fill="none" stroke={`url(#${gid})`} strokeWidth={flatLook ? rim : rim / 2}
          dangerouslySetInnerHTML={{ __html: thin }} />
      )}
    </svg>
  );
}
