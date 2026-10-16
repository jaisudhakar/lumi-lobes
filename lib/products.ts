import { generateCatalog, type Product } from "./catalog";
import { STYLES, type Category } from "./design";

export type { Product } from "./catalog";
export type { Category, Tone } from "./design";

const img = (name: string) => `/images/products/${name}.webp`;

const originals: Product[] = [
  {
    slug: "pearl-drop-earrings",
    design: { style: "drop", motif: "pearl", palette: "crystal" },
    mood: "elegant",
    photo: true,
    name: "Pearl Drop Earrings",
    price: 24,
    category: "danglers",
    tone: "peach",
    image: img("pearl-drop-earrings"),
    heroImage: img("pearl-drop-hero"),
    viewRatio: 270 / 465,
    rating: 4.8,
    reviews: 120,
    badge: "Handmade with love",
    description:
      "A little elegance for every day. These pearl drop earrings feature sparkling floral crystals and a luminous pearl, perfect for adding a touch of sweetness to any look.",
    trending: 1,
    isNew: true,
  },
  {
    slug: "star-studs",
    design: { style: "stud", motif: "star", palette: "crystal" },
    mood: "dreamy",
    photo: true,
    name: "Star Studs",
    price: 16,
    category: "studs",
    tone: "mint",
    image: img("star-studs"),
    viewRatio: 1,
    rating: 4.9,
    reviews: 214,
    badge: "Everyday favorite",
    description:
      "Tiny golden stars set with crystal shards that catch the light from every angle. Light enough to forget you are wearing them, bright enough that everyone else notices.",
    trending: 2,
  },
  {
    slug: "moon-and-star-studs",
    design: { style: "stud", motif: "moon", palette: "crystal" },
    mood: "dreamy",
    photo: true,
    name: "Moon and Star Studs",
    price: 18,
    category: "studs",
    tone: "pink",
    image: img("moon-star-studs"),
    rating: 4.7,
    reviews: 98,
    description:
      "A mismatched pair for dreamers: a pavé crescent moon and a faceted star. Wear them together, or split them up and share the sparkle.",
    trending: 3,
  },
  {
    slug: "cherry-hoops",
    design: { style: "huggie", motif: "cherry", palette: "ruby" },
    mood: "playful",
    photo: true,
    name: "Cherry Hoops",
    price: 20,
    category: "hoops",
    tone: "pink",
    image: img("cherry-hoops"),
    rating: 4.8,
    reviews: 156,
    description:
      "Glossy enamel cherries swinging from slim golden huggies. Sweet, playful and guaranteed to make you smile in the mirror.",
    trending: 4,
  },
  {
    slug: "lilac-butterfly-danglers",
    design: { style: "dangle", motif: "butterfly", palette: "lilac" },
    mood: "dreamy",
    photo: true,
    name: "Lilac Butterfly Danglers",
    price: 22,
    category: "danglers",
    tone: "lilac",
    image: img("lilac-butterfly-danglers"),
    rating: 4.6,
    reviews: 73,
    description:
      "Lilac enamel butterflies with crystal accents and a tiny pearl tail. They flutter with every turn of your head.",
    trending: 5,
  },
  {
    slug: "mint-daisy-hoops",
    design: { style: "huggie", motif: "daisy", palette: "mint" },
    mood: "playful",
    photo: true,
    name: "Mint Daisy Hoops",
    price: 21,
    category: "hoops",
    tone: "mint",
    image: img("mint-daisy-hoops"),
    rating: 4.7,
    reviews: 88,
    description:
      "White enamel daisies with a minty centre, hanging from chunky golden hoops. A little garden party you can take anywhere.",
    trending: 6,
  },
  {
    slug: "crystal-rain-danglers",
    design: { style: "chandelier", motif: "teardrop", palette: "crystal" },
    mood: "elegant",
    photo: true,
    name: "Crystal Rain Danglers",
    price: 28,
    category: "danglers",
    tone: "mint",
    image: img("crystal-rain-danglers"),
    rating: 4.9,
    reviews: 64,
    description:
      "Cascading marquise crystals that fall like a spring shower. Our most dazzling pair, made for weddings, dates and very good days.",
    trending: 7,
    isNew: true,
  },
  {
    slug: "mini-heart-studs",
    design: { style: "stud", motif: "heart", palette: "blush" },
    mood: "sweet",
    photo: true,
    name: "Mini Heart Studs",
    price: 14,
    category: "studs",
    tone: "lilac",
    image: img("mini-heart-studs"),
    rating: 4.8,
    reviews: 190,
    description:
      "Faceted pink hearts framed in warm gold. Small, sweet and the perfect little gift for someone you love (including you).",
    trending: 8,
  },
  {
    slug: "shell-hoops",
    design: { style: "huggie", motif: "shell", palette: "blush" },
    mood: "playful",
    photo: true,
    name: "Shell Hoops",
    price: 19,
    category: "hoops",
    tone: "peach",
    image: img("shell-hoops"),
    rating: 4.6,
    reviews: 57,
    description:
      "Pearlescent pink seashells and a tiny pearl on golden huggies. Summer by the sea, all year round.",
    trending: 9,
  },
  {
    slug: "pearl-necklace",
    design: { style: "drop", motif: "pearl", palette: "crystal" },
    mood: "elegant",
    photo: true,
    name: "Pearl Necklace",
    price: 34,
    category: "necklaces",
    tone: "pink",
    image: img("pearl-necklace"),
    viewRatio: 240 / 190,
    rating: 4.9,
    reviews: 41,
    description:
      "The perfect partner for our Pearl Drop Earrings: a single luminous pearl beneath a crystal flower on a fine golden chain.",
    trending: 10,
  },
];


const generated = generateCatalog(new Set(originals.map((o) => o.slug)), originals.length + 1);

export const products: Product[] = [...originals, ...generated];

export const giftBox = {
  id: "gift-box",
  name: "Gift box and note",
  price: 3,
  image: img("gift-box"),
};

/** Shop filter chips: every earring family (necklaces only appear on their own pages). */
export const categories: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All" },
  ...Object.values(STYLES).map((s) => ({ id: s.category, label: s.plural })),
];

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string) {
  return bySlug.get(slug);
}

/** Same family first, then same mood, picked deterministically from the slug. */
export function relatedProducts(slug: string, count = 3) {
  const product = getProduct(slug);
  if (!product) return [];
  if (product.photo) {
    const order = ["pearl-necklace", "star-studs", "mini-heart-studs", "cherry-hoops", "shell-hoops"];
    return order
      .filter((s) => s !== slug)
      .map((s) => getProduct(s)!)
      .slice(0, count);
  }
  const pool = products.filter(
    (p) => p.slug !== slug && p.category !== "necklaces" && (p.design.motif === product.design.motif || p.mood === product.mood),
  );
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, (_, i) => pool[(h + i * 97) % pool.length]);
}

export const countBy = (category: Category) => products.filter((p) => p.category === category).length;

export const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;
