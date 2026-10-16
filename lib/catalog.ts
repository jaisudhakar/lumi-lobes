// Generates the extended catalog: every compatible style × motif × colourway,
// shuffled with a fixed seed so the server build and the browser agree exactly.

import {
  MOTIFS,
  PALETTES,
  STYLES,
  type Category,
  type Design,
  type Mood,
  type MotifId,
  type PaletteId,
  type StyleId,
  type Tone,
} from "./design";

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  tone: Tone;
  /** Card image: a studio photo for the originals, generated artwork otherwise. */
  image: string;
  /** True when `image` is a real photo rather than generated artwork. */
  photo?: boolean;
  /** Larger, cut-out style shot used on the product page viewer. */
  heroImage?: string;
  /** Width / height of the image shown in the product viewer (heroImage, else image). */
  viewRatio?: number;
  /** Drives the artwork, the metal re-colouring and the virtual try-on. */
  design: Design;
  mood: Mood;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  /** Lower = more popular. Used by "Sort: Trending". */
  trending: number;
  isNew?: boolean;
};

export const CATALOG_SIZE = 1200;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const MOTIF_PHRASE: Record<MotifId, string> = {
  heart: "a faceted little heart",
  star: "a crystal-cut star",
  moon: "a pavé crescent moon",
  sun: "a radiant sunburst",
  flower: "a five-petal blossom",
  daisy: "an enamel daisy",
  butterfly: "a fluttering enamel butterfly",
  bow: "a sweet tied bow",
  cherry: "a pair of glossy cherries",
  shell: "a ridged seashell",
  starfish: "a speckled starfish",
  pearl: "a luminous pearl",
  teardrop: "a sparkling teardrop",
  leaf: "a veined enamel leaf",
  cluster: "a cluster of tiny gems",
  halo: "a centre stone framed by a crystal halo",
  hexagon: "a clean hexagon frame",
  tassel: "a swishy silk tassel",
};

const PALETTE_PHRASE: Record<PaletteId, string> = {
  blush: "soft blush pink",
  mint: "fresh mint",
  lilac: "dreamy lilac",
  peach: "warm peach",
  sky: "clear sky blue",
  lemon: "sunny lemon",
  ruby: "rich ruby",
  pearl: "pearly cream",
  midnight: "deep midnight blue",
  coral: "bright coral",
  sage: "calming sage",
  crystal: "ice-clear crystal",
};

const CLOSERS = [
  "Light enough to wear all day.",
  "Made in small batches and finished by hand.",
  "A tiny treat for you, or someone you love.",
  "Pairs beautifully with a messy bun.",
  "Nickel-free and gentle on sensitive ears.",
  "The kind of sparkle that makes Mondays better.",
  "Arrives in our signature keepsake box.",
  "Stack it, mix it, make it yours.",
];

const BADGES = ["Everyday favorite", "Handmade with love", "Gift pick", "Limited batch"];

const INCOMPATIBLE: Partial<Record<MotifId, StyleId[]>> = {
  tassel: ["stud", "huggie", "cuff", "climber", "clip-on"],
};

export function generateCatalog(reserved: Set<string>, startRank: number): Product[] {
  const rand = mulberry32(20261016);
  const combos: Design[] = [];
  for (const style of Object.keys(STYLES) as StyleId[]) {
    for (const motif of Object.keys(MOTIFS) as MotifId[]) {
      if (INCOMPATIBLE[motif]?.includes(style)) continue;
      for (const palette of Object.keys(PALETTES) as PaletteId[]) {
        if (palette === "pearl" && motif === "pearl") continue;
        combos.push({ style, motif, palette });
      }
    }
  }

  // Fisher-Yates with the seeded generator.
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }

  const out: Product[] = [];
  for (const design of combos) {
    if (out.length >= CATALOG_SIZE) break;
    const style = STYLES[design.style];
    const motif = MOTIFS[design.motif];
    const pal = PALETTES[design.palette];
    const name = `${pal.name} ${motif.label} ${style.plural}`;
    const slug = slugify(name);
    if (reserved.has(slug)) continue;

    const r = () => rand();
    out.push({
      slug,
      name,
      price: style.base + motif.bump + Math.floor(r() * 7),
      category: style.category,
      tone: pal.tone,
      // Pre-rendered at build time by app/art/[file]/route.ts.
      image: `/art/${slug}.svg`,
      design,
      mood: motif.mood,
      rating: Math.round((4.3 + r() * 0.7) * 10) / 10,
      reviews: 4 + Math.floor(r() * r() * 380),
      badge: r() < 0.22 ? BADGES[Math.floor(r() * BADGES.length)] : undefined,
      description: `${MOTIF_PHRASE[design.motif][0].toUpperCase()}${MOTIF_PHRASE[design.motif].slice(1)} in ${
        PALETTE_PHRASE[design.palette]
      } that ${style.blurb}. ${CLOSERS[Math.floor(r() * CLOSERS.length)]}`,
      trending: 0,
      isNew: r() < 0.08,
    });
  }

  // Popularity order is its own shuffle so "Trending" mixes styles nicely.
  const ranks = out.map((_, i) => i);
  for (let i = ranks.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  out.forEach((p, i) => (p.trending = startRank + ranks[i]));
  return out;
}
