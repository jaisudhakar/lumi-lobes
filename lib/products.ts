export type Category = "studs" | "hoops" | "danglers" | "clip-ons" | "necklaces";

export type Tone = "pink" | "mint" | "peach" | "lilac";

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  tone: Tone;
  image: string;
  /** Larger, cut-out style shot used on the product page viewer. */
  heroImage?: string;
  /** Width / height of the image shown in the product viewer (heroImage, else image). */
  viewRatio?: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  /** Lower = more popular. Used by "Sort: Trending". */
  trending: number;
  isNew?: boolean;
};

const img = (name: string) => `/images/products/${name}.webp`;

export const products: Product[] = [
  {
    slug: "pearl-drop-earrings",
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

export const giftBox = {
  id: "gift-box",
  name: "Gift box and note",
  price: 3,
  image: img("gift-box"),
};

export const categories: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "studs", label: "Studs" },
  { id: "hoops", label: "Hoops" },
  { id: "danglers", label: "Danglers" },
  { id: "clip-ons", label: "Clip-ons" },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function relatedProducts(slug: string, count = 3) {
  const order = ["pearl-necklace", "star-studs", "mini-heart-studs", "cherry-hoops", "shell-hoops"];
  return order
    .filter((s) => s !== slug)
    .map((s) => getProduct(s)!)
    .slice(0, count);
}

export const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;
