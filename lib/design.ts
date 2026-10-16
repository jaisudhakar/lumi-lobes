// Design taxonomy for the catalog. Earring families follow common jewelry-guide
// classifications (studs, huggies, hoops, drops, dangles, chandeliers, threaders,
// ear cuffs, climbers, clip-ons); motifs follow current charm trends.

export type Tone = "pink" | "mint" | "peach" | "lilac";

export type StyleId =
  | "stud"
  | "huggie"
  | "hoop"
  | "drop"
  | "dangle"
  | "chandelier"
  | "threader"
  | "cuff"
  | "climber"
  | "clip-on";

export type MotifId =
  | "heart"
  | "star"
  | "moon"
  | "sun"
  | "flower"
  | "daisy"
  | "butterfly"
  | "bow"
  | "cherry"
  | "shell"
  | "starfish"
  | "pearl"
  | "teardrop"
  | "leaf"
  | "cluster"
  | "halo"
  | "hexagon"
  | "tassel";

export type PaletteId =
  | "blush"
  | "mint"
  | "lilac"
  | "peach"
  | "sky"
  | "lemon"
  | "ruby"
  | "pearl"
  | "midnight"
  | "coral"
  | "sage"
  | "crystal";

export type Metal = "gold" | "silver" | "rose";

export type Design = { style: StyleId; motif: MotifId; palette: PaletteId };

export type Category =
  | "studs"
  | "huggies"
  | "hoops"
  | "drops"
  | "danglers"
  | "chandeliers"
  | "threaders"
  | "ear-cuffs"
  | "climbers"
  | "clip-ons"
  | "necklaces";

export const STYLES: Record<
  StyleId,
  { label: string; plural: string; category: Category; base: number; blurb: string }
> = {
  stud: { label: "Stud", plural: "Studs", category: "studs", base: 12, blurb: "sits neatly on the lobe" },
  huggie: { label: "Huggie", plural: "Huggies", category: "huggies", base: 16, blurb: "hugs the lobe on a snug hinged hoop" },
  hoop: { label: "Hoop", plural: "Hoops", category: "hoops", base: 18, blurb: "swings from a slim golden hoop" },
  drop: { label: "Drop", plural: "Drops", category: "drops", base: 17, blurb: "drops just below the lobe" },
  dangle: { label: "Dangler", plural: "Danglers", category: "danglers", base: 19, blurb: "dangles and sways as you move" },
  chandelier: { label: "Chandelier", plural: "Chandeliers", category: "chandeliers", base: 26, blurb: "cascades in a tiered chandelier" },
  threader: { label: "Threader", plural: "Threaders", category: "threaders", base: 18, blurb: "threads through on a fine chain" },
  cuff: { label: "Ear Cuff", plural: "Ear Cuffs", category: "ear-cuffs", base: 15, blurb: "wraps the ear, no piercing needed" },
  climber: { label: "Climber", plural: "Climbers", category: "climbers", base: 20, blurb: "climbs up the curve of the ear" },
  "clip-on": { label: "Clip-On", plural: "Clip-Ons", category: "clip-ons", base: 15, blurb: "clips on comfortably, no piercing needed" },
};

export const MOTIFS: Record<MotifId, { label: string; mood: Mood; bump: number }> = {
  heart: { label: "Heart", mood: "sweet", bump: 0 },
  star: { label: "Star", mood: "dreamy", bump: 0 },
  moon: { label: "Moon", mood: "dreamy", bump: 1 },
  sun: { label: "Sun", mood: "playful", bump: 1 },
  flower: { label: "Blossom", mood: "sweet", bump: 2 },
  daisy: { label: "Daisy", mood: "playful", bump: 1 },
  butterfly: { label: "Butterfly", mood: "dreamy", bump: 2 },
  bow: { label: "Bow", mood: "sweet", bump: 1 },
  cherry: { label: "Cherry", mood: "playful", bump: 1 },
  shell: { label: "Seashell", mood: "playful", bump: 1 },
  starfish: { label: "Starfish", mood: "playful", bump: 0 },
  pearl: { label: "Pearl", mood: "elegant", bump: 3 },
  teardrop: { label: "Teardrop", mood: "elegant", bump: 3 },
  leaf: { label: "Leaf", mood: "everyday", bump: 0 },
  cluster: { label: "Cluster", mood: "elegant", bump: 4 },
  halo: { label: "Halo", mood: "elegant", bump: 5 },
  hexagon: { label: "Hexagon", mood: "everyday", bump: 0 },
  tassel: { label: "Tassel", mood: "playful", bump: 2 },
};

export type Mood = "sweet" | "dreamy" | "playful" | "elegant" | "everyday";

export const MOODS: { id: Mood; label: string; emoji: string; text: string }[] = [
  { id: "sweet", label: "Sweet", emoji: "♥", text: "Hearts, bows and blossoms" },
  { id: "dreamy", label: "Dreamy", emoji: "☾", text: "Stars, moons and butterflies" },
  { id: "playful", label: "Playful", emoji: "✿", text: "Cherries, daisies and seashells" },
  { id: "elegant", label: "Elegant", emoji: "✦", text: "Pearls, halos and teardrops" },
  { id: "everyday", label: "Everyday", emoji: "◇", text: "Leaves and clean geometry" },
];

export const PALETTES: Record<
  PaletteId,
  { name: string; light: string; mid: string; dark: string; tone: Tone }
> = {
  blush: { name: "Blush", light: "#ffe1ea", mid: "#f6a5c0", dark: "#d9668e", tone: "pink" },
  mint: { name: "Mint", light: "#dcfaef", mid: "#8fdcc4", dark: "#3fa88a", tone: "mint" },
  lilac: { name: "Lilac", light: "#efe6ff", mid: "#c5b1f5", dark: "#8e6fe0", tone: "lilac" },
  peach: { name: "Peach", light: "#ffe9df", mid: "#f8b59c", dark: "#e07f62", tone: "peach" },
  sky: { name: "Sky", light: "#e3f3ff", mid: "#9fd0f5", dark: "#4f95d6", tone: "mint" },
  lemon: { name: "Lemon", light: "#fff9d6", mid: "#ffe27a", dark: "#e3b62a", tone: "peach" },
  ruby: { name: "Ruby", light: "#ffd6df", mid: "#ef5f7f", dark: "#b7224a", tone: "pink" },
  pearl: { name: "Pearly", light: "#ffffff", mid: "#f3ece6", dark: "#cdbdb2", tone: "lilac" },
  midnight: { name: "Midnight", light: "#dfe3ff", mid: "#6f7fe0", dark: "#2c3a9e", tone: "lilac" },
  coral: { name: "Coral", light: "#ffe0d8", mid: "#ff8f78", dark: "#d9553f", tone: "peach" },
  sage: { name: "Sage", light: "#eef6e4", mid: "#b5d39a", dark: "#6f9a4e", tone: "mint" },
  crystal: { name: "Crystal", light: "#ffffff", mid: "#e9f1ff", dark: "#b9c6e6", tone: "lilac" },
};

export const METALS: Record<Metal, { label: string; stops: [string, string, string, string] }> = {
  gold: { label: "Gold", stops: ["#fff4c7", "#f2cd62", "#d29f33", "#a8761a"] },
  silver: { label: "Silver", stops: ["#ffffff", "#e3e6ec", "#b4b9c5", "#8c919e"] },
  rose: { label: "Rose", stops: ["#ffeae2", "#f1bfae", "#d69683", "#b07060"] },
};
