// Procedural SVG artwork for catalog earrings. Every design is drawn from the
// same building blocks: a metal "setting" per style and a motif drawn in a
// -50..50 unit box, coloured from a gem palette and a metal finish.

import { METALS, PALETTES, type Design, type Metal, type MotifId, type StyleId } from "./design";

type Paint = { metal: string; /** Flat metal colour for hairline parts (gradients vanish on zero-width lines). */ solid: string; gem: string; pearl: string; enamel: string; light: string; dark: string };

const f = (n: number) => +n.toFixed(2);

/** Wraps a motif (drawn in a -50..50 box) at (cx, cy) with the given size. */
const place = (body: string, cx: number, cy: number, size: number, rotate = 0) =>
  `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rotate}) scale(${f(size / 100)})">${body}</g>`;

const starPoints = (outer: number, inner: number, n = 5) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / n) * i - Math.PI / 2;
    return `${f(Math.cos(a) * r)},${f(Math.sin(a) * r)}`;
  }).join(" ");

const sparkle = (x: number, y: number, r = 5) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`;

// ---------------------------------------------------------------------------
// Motifs
// ---------------------------------------------------------------------------

const MOTIF_ART: Record<MotifId, (p: Paint) => string> = {
  heart: (p) =>
    `<path d="M0 40C-45 10-50-20-28-36-14-46 0-36 0-24 0-36 14-46 28-36 50-20 45 10 0 40Z" fill="${p.gem}" stroke="${p.metal}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M0-24 0 38M-30-30 0 8 30-30" stroke="#fff" stroke-width="2" opacity=".45" fill="none"/>${sparkle(-22, -22, 6)}`,

  star: (p) =>
    `<polygon points="${starPoints(50, 21)}" fill="${p.gem}" stroke="${p.metal}" stroke-width="6" stroke-linejoin="round"/>
     <g stroke="#fff" stroke-width="2" opacity=".5">${[0, 1, 2, 3, 4]
       .map((i) => {
         const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
         return `<line x1="0" y1="0" x2="${f(Math.cos(a) * 46)}" y2="${f(Math.sin(a) * 46)}"/>`;
       })
       .join("")}</g>${sparkle(-6, -14, 5)}`,

  moon: (p) =>
    `<path d="M8-45.3A46 46 0 1 0 8 45.3 50 50 0 0 1 8-45.3Z" fill="${p.metal}"/>
     ${[
       [-33, 0, 6],
       [-29, -19, 5.5],
       [-29, 19, 5.5],
       [-18, -33, 5],
       [-18, 33, 5],
       [-3, -41, 4],
       [-3, 41, 4],
     ]
       .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.gem}" stroke="${p.dark}" stroke-width=".8"/>`)
       .join("")}`,

  sun: (p) =>
    `<g fill="${p.metal}">${Array.from({ length: 12 }, (_, i) => `<polygon points="-6,-30 6,-30 0,-50" transform="rotate(${i * 30})"/>`).join("")}</g>
     <circle r="28" fill="${p.gem}" stroke="${p.metal}" stroke-width="5"/>${sparkle(-9, -10, 7)}`,

  flower: (p) =>
    `${Array.from({ length: 5 }, (_, i) => `<ellipse cy="-25" rx="15" ry="25" fill="${p.gem}" stroke="${p.metal}" stroke-width="4" transform="rotate(${i * 72})"/>`).join("")}
     <circle r="11" fill="${p.metal}"/>${sparkle(-3, -4, 3.5)}`,

  daisy: (p) =>
    `${Array.from({ length: 10 }, (_, i) => `<ellipse cy="-27" rx="9" ry="21" fill="#fffdf8" stroke="${p.metal}" stroke-width="3" transform="rotate(${i * 36})"/>`).join("")}
     <circle r="15" fill="${p.gem}" stroke="${p.metal}" stroke-width="3"/>${sparkle(-5, -5, 4)}`,

  butterfly: (p) =>
    `<g stroke="${p.metal}" stroke-width="3.5">
       <ellipse cx="-23" cy="-12" rx="22" ry="27" transform="rotate(-25 -23 -12)" fill="${p.enamel}"/>
       <ellipse cx="23" cy="-12" rx="22" ry="27" transform="rotate(25 23 -12)" fill="${p.enamel}"/>
       <ellipse cx="-17" cy="23" rx="14" ry="18" transform="rotate(25 -17 23)" fill="${p.enamel}"/>
       <ellipse cx="17" cy="23" rx="14" ry="18" transform="rotate(-25 17 23)" fill="${p.enamel}"/>
     </g>
     <ellipse cx="-23" cy="-14" rx="10" ry="14" transform="rotate(-25 -23 -14)" fill="${p.light}" opacity=".8"/>
     <ellipse cx="23" cy="-14" rx="10" ry="14" transform="rotate(25 23 -14)" fill="${p.light}" opacity=".8"/>
     <ellipse rx="5" ry="30" fill="${p.metal}"/>
     <path d="M-2-28C-6-40-12-44-16-46M2-28C6-40 12-44 16-46" stroke="${p.metal}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  bow: (p) =>
    `<g fill="${p.enamel}" stroke="${p.metal}" stroke-width="3.5" stroke-linejoin="round">
       <path d="M-5 10-22 48-12 43-5 50 3 12Z"/><path d="M5 10 22 48 12 43 5 50-3 12Z"/>
       <path d="M0 0C-20-32-50-26-47 0-50 26-20 32 0 0Z"/><path d="M0 0C20-32 50-26 47 0 50 26 20 32 0 0Z"/>
       <ellipse rx="10" ry="12"/>
     </g>
     <path d="M-36-6C-30-14-20-14-14-8M36-6C30-14 20-14 14-8" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`,

  cherry: (p) =>
    `<path d="M-16 18C-14-8-4-30 8-44M18 22C14-2 10-26 8-44" stroke="${p.metal}" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M8-44C20-50 34-44 38-34 26-30 14-34 8-44Z" fill="#5fbf7f" stroke="${p.metal}" stroke-width="2"/>
     <circle cx="-17" cy="27" r="19" fill="url(#cherry)" stroke="${p.metal}" stroke-width="2"/>
     <circle cx="19" cy="30" r="19" fill="url(#cherry)" stroke="${p.metal}" stroke-width="2"/>
     ${sparkle(-24, 20, 5)}${sparkle(12, 23, 5)}`,

  shell: (p) =>
    `<path d="M0 44-44-6C-44-38 44-38 44-6Z" fill="${p.gem}" stroke="${p.metal}" stroke-width="4" stroke-linejoin="round"/>
     <g stroke="${p.metal}" stroke-width="2.4" opacity=".75">${[-36, -22, -8, 8, 22, 36]
       .map((x) => `<line x1="0" y1="40" x2="${x}" y2="${f(-24 - (1 - Math.abs(x) / 44) * 10)}"/>`)
       .join("")}</g>
     <path d="M-12 44H12L8 50H-8Z" fill="${p.metal}"/>`,

  starfish: (p) =>
    `<polygon points="${starPoints(46, 22)}" fill="${p.enamel}" stroke="${p.enamel}" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="${starPoints(46, 22)}" fill="none" stroke="${p.dark}" stroke-width="2" stroke-linejoin="round" opacity=".5"/>
     <g fill="${p.light}">${[0, 1, 2, 3, 4]
       .map((i) => {
         const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
         return [14, 26, 36].map((r) => `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="3"/>`).join("");
       })
       .join("")}</g><circle r="5" fill="${p.metal}"/>`,

  pearl: (p) =>
    `<circle cy="8" r="36" fill="url(#pearl)"/>
     <path d="M-16-24Q0-38 16-24L11-17Q0-25-11-17Z" fill="${p.metal}"/>
     <circle cy="-30" r="5" fill="${p.gem}" stroke="${p.metal}" stroke-width="1.5"/>
     <ellipse cx="-12" cy="-6" rx="9" ry="6" fill="#fff" opacity=".8"/>`,

  teardrop: (p) =>
    `<path d="M0-48C20-18 36 4 36 18A36 36 0 0 1-36 18C-36 4-20-18 0-48Z" fill="${p.gem}" stroke="${p.metal}" stroke-width="6"/>
     <path d="M0-40 0 50M-30 10 30 10M0-40-30 10 0 50 30 10Z" stroke="#fff" stroke-width="1.8" opacity=".45" fill="none"/>${sparkle(-12, 2, 5)}`,

  leaf: (p) =>
    `<path d="M0-48C30-30 34 20 0 48-34 20-30-30 0-48Z" fill="${p.enamel}" stroke="${p.metal}" stroke-width="5"/>
     <path d="M0-40V44M0-14 16-28M0 6 18-8M0-14-16-28M0 6-18-8M0 26 14 14M0 26-14 14" stroke="${p.metal}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  cluster: (p) =>
    `<g stroke="${p.metal}" stroke-width="3">
       <circle cy="-24" r="17" fill="${p.gem}"/><circle cx="-21" cy="7" r="15" fill="${p.gem}"/>
       <circle cx="21" cy="7" r="15" fill="${p.gem}"/><circle cy="32" r="13" fill="${p.gem}"/>
     </g><circle cy="5" r="9" fill="url(#pearl)"/>${sparkle(-6, -30, 4)}${sparkle(-26, 2, 3.5)}`,

  halo: (p) =>
    `${Array.from({ length: 14 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 14;
      return `<circle cx="${f(Math.cos(a) * 38)}" cy="${f(Math.sin(a) * 38)}" r="6.5" fill="url(#crystal)" stroke="${p.metal}" stroke-width="1.6"/>`;
    }).join("")}
     <circle r="27" fill="${p.gem}" stroke="${p.metal}" stroke-width="4"/>
     <path d="M-19-19 19 19M19-19-19 19M0-27V27M-27 0H27" stroke="#fff" stroke-width="1.5" opacity=".4"/>${sparkle(-9, -10, 6)}`,

  hexagon: (p) =>
    `<polygon points="${starPoints(46, 46, 3)}" fill="none" stroke="${p.metal}" stroke-width="8" stroke-linejoin="round" transform="rotate(30)"/>
     <polygon points="${starPoints(26, 26, 3)}" fill="${p.gem}" stroke="${p.metal}" stroke-width="3" transform="rotate(30)"/>${sparkle(-6, -8, 4)}`,

  tassel: (p) =>
    `${Array.from({ length: 15 }, (_, i) => {
      const t = i / 14;
      return `<line x1="${f(-8 + t * 16)}" y1="-26" x2="${f(-24 + t * 48)}" y2="${46 - Math.abs(t - 0.5) * 8}" stroke="${i % 3 ? p.enamel : p.dark}" stroke-width="3.6" stroke-linecap="round"/>`;
    }).join("")}
     <rect x="-11" y="-48" width="22" height="20" rx="6" fill="${p.metal}"/><rect x="-13" y="-22" width="26" height="7" rx="3" fill="${p.metal}"/>`,
};

// ---------------------------------------------------------------------------
// Settings (one per style), drawn in a 100-wide single-earring space
// ---------------------------------------------------------------------------

type Setting = {
  /** Vertical extent of the artwork, used to crop and centre it. */
  top: number;
  bottom: number;
  /** Horizontal centre and width of the artwork (for laying out pairs). */
  cx: number;
  w: number;
  /** Where the earring meets the ear (used by the virtual try-on). */
  anchor: [number, number];
  draw: (motif: string, p: Paint) => string;
};

const chain = (x: number, y1: number, y2: number, solid: string) =>
  `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${solid}" stroke-width="2.6" stroke-dasharray="3 1.2"/>`;

const jump = (x: number, y: number, metal: string, r = 3.2) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${metal}" stroke-width="2"/>`;

const SETTINGS: Record<StyleId, Setting> = {
  stud: { top: 10, bottom: 70, cx: 50, w: 62, anchor: [50, 40], draw: (m) => place(m, 50, 40, 58) },

  "clip-on": {
    top: 8,
    bottom: 92, cx: 50, w: 86,
    anchor: [50, 50],
    draw: (m, p) =>
      `<circle cx="50" cy="50" r="39" fill="none" stroke="${p.metal}" stroke-width="5" stroke-dasharray="0.1 9" stroke-linecap="round"/>` +
      place(m, 50, 50, 62),
  },

  huggie: {
    top: 12,
    bottom: 84, cx: 50, w: 44,
    anchor: [50, 18],
    draw: (m, p) =>
      `<circle cx="50" cy="31" r="14" fill="none" stroke="${p.metal}" stroke-width="6.5"/>
       <path d="M40 41A14 14 0 0 0 60 41" fill="none" stroke="${p.gem}" stroke-width="2.6" stroke-dasharray="0.1 4.4" stroke-linecap="round"/>` +
      jump(50, 48, p.metal) +
      place(m, 50, 66, 36),
  },

  hoop: {
    top: 18,
    bottom: 136, cx: 50, w: 88,
    anchor: [50, 22],
    draw: (m, p) =>
      `<circle cx="50" cy="62" r="40" fill="none" stroke="${p.metal}" stroke-width="5.5"/>
       <path d="M22 90A40 40 0 0 0 78 90" fill="none" stroke="${p.gem}" stroke-width="3" stroke-dasharray="0.1 6" stroke-linecap="round"/>` +
      jump(50, 105, p.metal) +
      place(m, 50, 120, 30),
  },

  drop: {
    top: 9,
    bottom: 88, cx: 50, w: 54,
    anchor: [50, 18],
    draw: (m, p) =>
      `<circle cx="50" cy="18" r="7.5" fill="${p.gem}" stroke="${p.metal}" stroke-width="2.5"/>` +
      chain(50, 26, 34, p.solid) +
      place(m, 50, 60, 52),
  },

  dangle: {
    top: 2,
    bottom: 130, cx: 53, w: 62,
    anchor: [50, 10],
    draw: (m, p) =>
      `<path d="M50 22C50 10 56 4 62 6 67 8 66 16 62 18" fill="none" stroke="${p.metal}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<circle cx="50" cy="25" r="3.5" fill="${p.metal}"/>` +
      chain(50, 28, 66, p.solid) +
      place(m, 50, 98, 60),
  },

  chandelier: {
    top: 6,
    bottom: 140, cx: 50, w: 72,
    anchor: [50, 14],
    draw: (m, p) => {
      const drops = [20, 35, 50, 65, 80]
        .map((x) => {
          const y = 42 + (1 - Math.abs(x - 50) / 30) * 12;
          return `<line x1="${x}" y1="${f(y)}" x2="${x}" y2="${f(y + 10)}" stroke="${p.solid}" stroke-width="1.6"/>
            <path d="M${x} ${f(y + 9)}c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12Z" fill="url(#gem)" stroke="${p.metal}" stroke-width="1.4"/>`;
        })
        .join("");
      return (
        `<circle cx="50" cy="14" r="6.5" fill="${p.gem}" stroke="${p.metal}" stroke-width="2.4"/>` +
        `<path d="M50 20V30M18 40Q50 64 82 40" fill="none" stroke="${p.metal}" stroke-width="3.2"/>` +
        `<path d="M50 30 18 40M50 30 82 40" stroke="${p.metal}" stroke-width="1.6"/>` +
        drops +
        chain(50, 54, 90, p.solid) +
        place(m, 50, 114, 46)
      );
    },
  },

  threader: {
    top: 4,
    bottom: 156, cx: 50, w: 44,
    anchor: [50, 32],
    draw: (m, p) =>
      `<line x1="50" y1="6" x2="50" y2="16" stroke="${p.solid}" stroke-width="3" stroke-linecap="round"/>` +
      chain(50, 16, 100, p.solid) +
      place(m, 50, 124, 42) +
      chain(50, 145, 154, p.solid),
  },

  cuff: {
    top: 18,
    bottom: 132, cx: 40, w: 64,
    anchor: [42, 70],
    draw: (m, p) =>
      `<path d="M38 24C12 52 18 104 62 126" fill="none" stroke="${p.metal}" stroke-width="8" stroke-linecap="round"/>
       <path d="M38 24C12 52 18 104 62 126" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45" transform="translate(-2 -1)"/>` +
      place(m, 24, 56, 22, -20) +
      place(m, 22, 82, 24) +
      place(m, 34, 106, 22, 20),
  },

  climber: {
    top: 10,
    bottom: 160, cx: 64, w: 56,
    anchor: [48, 144],
    draw: (m, p) => {
      const pts: [number, number, number][] = [
        [48, 144, 28],
        [54, 116, 24],
        [62, 90, 20],
        [70, 66, 17],
        [76, 44, 14],
        [80, 26, 12],
      ];
      const line = `<path d="M48 144C52 110 66 78 80 26" fill="none" stroke="${p.metal}" stroke-width="3"/>`;
      return line + pts.map(([x, y, s]) => place(m, x, y, s)).join("");
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function defs(design: Design, metal: Metal) {
  const pal = PALETTES[design.palette];
  const [m0, m1, m2, m3] = METALS[metal].stops;
  return `<defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${m0}"/><stop offset=".35" stop-color="${m1}"/>
      <stop offset=".7" stop-color="${m2}"/><stop offset="1" stop-color="${m3}"/>
    </linearGradient>
    <radialGradient id="gem" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${pal.light}"/>
      <stop offset=".65" stop-color="${pal.mid}"/><stop offset="1" stop-color="${pal.dark}"/>
    </radialGradient>
    <radialGradient id="enamel" cx=".35" cy=".3" r=".9">
      <stop offset="0" stop-color="${pal.light}"/><stop offset=".55" stop-color="${pal.mid}"/><stop offset="1" stop-color="${pal.dark}"/>
    </radialGradient>
    <radialGradient id="pearl" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fbf6f2"/>
      <stop offset=".75" stop-color="#e6d8cf"/><stop offset="1" stop-color="#c9b6ab"/>
    </radialGradient>
    <radialGradient id="crystal" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#eef3ff"/><stop offset="1" stop-color="#b9c6e6"/>
    </radialGradient>
    <radialGradient id="cherry" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#ffd0d8"/><stop offset=".35" stop-color="#f0476a"/><stop offset="1" stop-color="#a3123a"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#5a3fb0" flood-opacity=".22"/>
    </filter>
  </defs>`;
}

function single(design: Design, metal: Metal) {
  const pal = PALETTES[design.palette];
  const paint: Paint = {
    metal: "url(#metal)",
    solid: METALS[metal].stops[2],
    gem: "url(#gem)",
    pearl: "url(#pearl)",
    enamel: "url(#enamel)",
    light: pal.light,
    dark: pal.dark,
  };
  return SETTINGS[design.style].draw(MOTIF_ART[design.motif](paint), paint);
}

const PAD = 6;

/** Size info for a single earring: width/height ratio and anchor (0..1) within the cropped artwork. */
export function earringGeometry(style: StyleId) {
  const s = SETTINGS[style];
  const top = s.top - PAD;
  const h = s.bottom - s.top + PAD * 2;
  return {
    ratio: 100 / h,
    anchor: { x: s.anchor[0] / 100, y: (s.anchor[1] - top) / h },
  };
}

/** One earring, cropped tightly, transparent background (product viewer & try-on). */
export function singleSvg(design: Design, metal: Metal = "gold") {
  const s = SETTINGS[design.style];
  const top = s.top - PAD;
  const h = s.bottom - s.top + PAD * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} 100 ${h}" width="300" height="${f((300 * h) / 100)}">${defs(design, metal)}<g filter="url(#shadow)">${single(design, metal)}</g></svg>`;
}

/** A mirrored pair on a transparent 260×200 canvas (cards, cart, thumbnails). */
export function pairSvg(design: Design, metal: Metal = "gold") {
  const s = SETTINGS[design.style];
  const h = s.bottom - s.top;
  const k = Math.min(164 / h, 104 / s.w, 1.5);
  const y = 100 - (s.top + h / 2) * k;
  const art = single(design, metal);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="520" height="400">${defs(design, metal)}
    <g filter="url(#shadow)">
      <g transform="translate(${f(74 - s.cx * k)} ${f(y)}) scale(${f(k)})">${art}</g>
      <g transform="translate(${f(186 + s.cx * k)} ${f(y)}) scale(${f(-k)} ${f(k)})">${art}</g>
    </g></svg>`;
}

const cache = new Map<string, string>();

const toUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s{2,}/g, " "))}`;

/** Memoised data: URI so the artwork can be used anywhere an <img src> is. */
export function artUri(design: Design, opts: { metal?: Metal; single?: boolean } = {}) {
  const metal = opts.metal ?? "gold";
  const key = `${design.style}|${design.motif}|${design.palette}|${metal}|${opts.single ? 1 : 0}`;
  let uri = cache.get(key);
  if (!uri) {
    uri = toUri(opts.single ? singleSvg(design, metal) : pairSvg(design, metal));
    cache.set(key, uri);
  }
  return uri;
}
