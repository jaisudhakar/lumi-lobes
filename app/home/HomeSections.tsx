import Link from "next/link";
import { ArrowRight, CubeIcon } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { MOODS, STYLES, type Design, type Mood } from "@/lib/design";
import { artUri, earringGeometry } from "@/lib/earringArt";
import { products, type Product } from "@/lib/products";
import { PHOTO_MODEL as MODEL } from "@/lib/sampleModels";
import { STYLE_LENGTH } from "@/lib/tryon";
import styles from "./home.module.css";

const earrings = products.filter((p) => p.category !== "necklaces");
const byTrend = (a: Product, b: Product) => a.trending - b.trending;
const popularity = (p: Product) => p.rating * Math.log10(p.reviews + 10);

export const homeData = {
  newArrivals: earrings.filter((p) => p.isNew).sort(byTrend).slice(0, 12).map((p) => p.slug),
  // Most popular per mood, at most one per earring family so each tab feels varied.
  bestByMood: Object.fromEntries(
    MOODS.map((m) => {
      const seen = new Set<string>();
      const picks = earrings
        .filter((p) => p.mood === m.id)
        .sort((a, b) => popularity(b) - popularity(a))
        .filter((p) => !seen.has(p.category) && seen.add(p.category))
        .slice(0, 4);
      return [m.id, picks.map((p) => p.slug)];
    }),
  ) as Record<Mood, string[]>,
  stats: [
    { value: earrings.length, suffix: "+", label: "handmade designs" },
    {
      value: Math.round((earrings.reduce((s, p) => s + p.rating, 0) / earrings.length) * 10) / 10,
      decimals: 1,
      suffix: "★",
      label: "average rating",
    },
    { value: Object.keys(STYLES).length, label: "earring styles" },
    { value: earrings.reduce((s, p) => s + p.reviews, 0), label: "happy reviews" },
  ],
};

export function SectionHead({ kicker, title, href, cta }: { kicker: string; title: string; href?: string; cta?: string }) {
  return (
    <div className={styles.sectionHead}>
      <div>
        <p className={styles.kicker}>{kicker}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className={styles.viewAll}>
          {cta ?? "View all"} <ArrowRight size={20} />
        </Link>
      )}
    </div>
  );
}

/** One tile per earring family, showing its most popular design. */
export function StyleTiles() {
  const tones = ["pink", "mint", "peach", "lilac"] as const;
  return (
    <div className={styles.styleGrid}>
      {Object.values(STYLES).map((s, i) => {
        const inFamily = earrings.filter((p) => p.category === s.category && !p.photo);
        const hero = inFamily.sort(byTrend)[0];
        return (
          <Reveal key={s.category} delay={(i % 5) * 70}>
            <Link href={`/shop/?category=${s.category}`} className={`${styles.styleTile} tone-${tones[i % 4]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.image} alt="" loading="lazy" />
              <span className={styles.styleName}>{s.plural}</span>
              <span className={styles.styleCount}>{inFamily.length} designs</span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

// Visible ear lobes on the sample model, as % of the photo, plus face height as % of photo height.
const LOBES = (MODEL.ears ?? [])
  .filter((e) => e.visible > 0.5)
  .map((e) => ({ side: e.side, x: (e.x / MODEL.w) * 100, y: (e.y / MODEL.h) * 100 }));
const FACE_PCT = ((MODEL.ears?.[0]?.faceH ?? MODEL.h * 0.4) / MODEL.h) * 100;
const PROMO_DESIGNS: Design[] = [
  { style: "dangle", motif: "butterfly", palette: "lilac" },
  { style: "huggie", motif: "cherry", palette: "ruby" },
  { style: "drop", motif: "pearl", palette: "crystal" },
  { style: "chandelier", motif: "teardrop", palette: "mint" },
];

/** Earrings cycling on the sample model, with a CTA into the try-on. */
export function TryOnPromo() {
  return (
    <div className={styles.promo}>
      <div className={styles.promoCopy}>
        <p className={styles.kicker}>New · Virtual Try-On</p>
        <h2 className={styles.promoTitle}>See it on you before you buy</h2>
        <p className={styles.promoText}>
          Turn on your camera or upload a selfie: our in-browser face tracking hangs any of {earrings.length.toLocaleString("en-US")}{" "}
          designs right on your ears, swinging as you move. Nothing is uploaded, ever.
        </p>
        <Link href="/try-on/" className="btn">
          <CubeIcon size={24} /> Try it on
        </Link>
      </div>
      <figure className={styles.promoFigure}>
        <div className={styles.promoStage} style={{ aspectRatio: `${MODEL.w} / ${MODEL.h}` }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MODEL.src} alt="" className={styles.promoModel} loading="lazy" />
          {PROMO_DESIGNS.map((d, i) =>
            LOBES.map((lobe) => {
              const side = lobe.side;
              const geo = earringGeometry(d.style);
              // % of photo height, a touch larger than life so it reads at this size
              const h = STYLE_LENGTH[d.style] * FACE_PCT * 1.4;
              const w = h * geo.ratio * (MODEL.h / MODEL.w); // % of photo width
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${i}-${side}`}
                  src={artUri(d, { single: true })}
                  alt=""
                  className={`${styles.promoEarring} ${side === "right" ? styles.promoMirror : ""}`}
                  style={{
                    left: `${lobe.x - geo.anchor.x * w}%`,
                    top: `${lobe.y - geo.anchor.y * h}%`,
                    width: `${w}%`,
                    height: `${h}%`,
                    transformOrigin: `${geo.anchor.x * 100}% ${geo.anchor.y * 100}%`,
                    animationDelay: `${i * 3}s, ${side === "right" ? -0.6 : 0}s`,
                  }}
                />
              );
            }),
          )}
          <span className={styles.promoScan} />
        </div>
        {MODEL.credit && <figcaption className={styles.promoCredit}>{MODEL.credit}</figcaption>}
      </figure>
    </div>
  );
}

const REVIEWS = [
  { name: "Maya R.", text: "The cherry huggies are the cutest thing I own. Compliments every single day!", item: "Cherry Hoops" },
  { name: "Priya S.", text: "Tried them on with the camera first, ordered in two minutes. They look exactly like that.", item: "Lilac Butterfly Danglers" },
  { name: "Elena K.", text: "Finally earrings that don’t make my ears itch. Ordered three more pairs.", item: "Mini Heart Studs" },
  { name: "Jo W.", text: "The gift box made my sister cry happy tears. Packaging is adorable.", item: "Pearl Drop Earrings" },
  { name: "Aisha M.", text: "Light as air. I forget I’m wearing them until someone asks where they’re from.", item: "Star Studs" },
  { name: "Sofia L.", text: "So many colours to pick from, I went with mint and I’m obsessed.", item: "Mint Daisy Hoops" },
  { name: "Hana T.", text: "Ear cuffs with no piercing? Life changing for my sensitive ears.", item: "Ear Cuffs" },
  { name: "Grace O.", text: "Wore the crystal chandeliers to a wedding and felt like the main character.", item: "Crystal Rain Danglers" },
];

/** Two rows of review cards drifting in opposite directions. */
export function Testimonials() {
  const rows = [REVIEWS.slice(0, 4), REVIEWS.slice(4)];
  return (
    <div className={styles.reviews}>
      {rows.map((row, r) => (
        <div key={r} className={`${styles.reviewRow} ${r ? styles.reviewRowReverse : ""}`}>
          {[...row, ...row].map((rev, i) => (
            <figure key={i} className={styles.review} aria-hidden={i >= row.length}>
              <span className={styles.reviewStars}>★★★★★</span>
              <blockquote>“{rev.text}”</blockquote>
              <figcaption>
                <strong>{rev.name}</strong> · {rev.item}
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

const BANDS = [
  { id: "under-15", label: "Under $15", note: "Stocking stuffers", tone: "mint", test: (p: number) => p < 15 },
  { id: "15-20", label: "$15 – $20", note: "Best friend gifts", tone: "pink", test: (p: number) => p >= 15 && p <= 20 },
  { id: "20-25", label: "$20 – $25", note: "Birthday sparkle", tone: "lilac", test: (p: number) => p > 20 && p <= 25 },
  { id: "25-plus", label: "$25 & up", note: "Treat yourself", tone: "peach", test: (p: number) => p > 25 },
];

/** Gift guide: price bands linking into the filtered shop. */
export function GiftGuide() {
  return (
    <div className={styles.gifts}>
      {BANDS.map((b, i) => {
        const inBand = earrings.filter((p) => b.test(p.price) && !p.photo).sort(byTrend);
        return (
          <Reveal key={b.id} delay={i * 90}>
            <Link href={`/shop/?price=${b.id}&sort=price-asc`} className={`${styles.gift} tone-${b.tone}`}>
              <span className={styles.giftRibbon} aria-hidden />
              <span className={styles.giftNote}>{b.note}</span>
              <span className={styles.giftLabel}>{b.label}</span>
              <span className={styles.giftCount}>{inBand.length} designs</span>
              <span className={styles.giftArt}>
                {inBand.slice(0, 3).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.slug} src={p.image} alt="" loading="lazy" />
                ))}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

const FAQS = [
  {
    q: "Are your earrings hypoallergenic?",
    a: "Yes. Every post and hook is nickel-free and lead-free, plated over surgical steel or sterling silver, so they're gentle on sensitive ears.",
  },
  {
    q: "How does the virtual try-on work?",
    a: "We use Google's MediaPipe face landmark model, running entirely inside your browser, to find your ear lobes. Your camera feed and photos never leave your device.",
  },
  {
    q: "What's the difference between huggies, hoops and threaders?",
    a: "Huggies are small hoops that hug the lobe snugly; hoops are larger and swing freely; threaders use a fine chain that passes through the piercing and drapes down.",
  },
  {
    q: "I don't have pierced ears. What can I wear?",
    a: "Our ear cuffs wrap around the outer ear and our clip-ons pinch gently on the lobe. No piercing needed for either.",
  },
  {
    q: "How should I care for my earrings?",
    a: "Keep them dry, take them off before swimming or showering, and store each pair in its keepsake box to keep the sparkle bright.",
  },
  {
    q: "Do you ship for free?",
    a: "Always. Every order ships free, wrapped and ready for gifting.",
  },
];

/** Accordion built on <details>, animated with CSS. */
export function Faq() {
  return (
    <div className={styles.faq}>
      {FAQS.map((f, i) => (
        <details key={f.q} className={styles.faqItem} open={i === 0}>
          <summary>
            {f.q}
            <span className={styles.faqIcon} aria-hidden />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
