import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { getProduct, type Tone } from "@/lib/products";
import styles from "./collections.module.css";

export const metadata: Metadata = {
  title: "Collections",
  description: "Pearl drops, everyday studs, huggable hoops and dreamy danglers.",
};

const collections: {
  title: string;
  kicker: string;
  text: string;
  href: string;
  tone: Tone;
  picks: string[];
}[] = [
  {
    title: "Pearl Drop Collection",
    kicker: "New",
    text: "Luminous pearls under crystal flowers. A little elegance for every day.",
    href: "/product/pearl-drop-earrings/",
    tone: "peach",
    picks: ["pearl-necklace", "pearl-drop-earrings", "shell-hoops"],
  },
  {
    title: "Everyday Studs",
    kicker: "Studs",
    text: "Tiny stars, moons and hearts you will never want to take off.",
    href: "/shop/?category=studs",
    tone: "mint",
    picks: ["moon-and-star-studs", "star-studs", "mini-heart-studs"],
  },
  {
    title: "Huggable Hoops",
    kicker: "Hoops",
    text: "Cherries, daisies and seashells swinging from golden huggies.",
    href: "/shop/?category=hoops",
    tone: "pink",
    picks: ["mint-daisy-hoops", "cherry-hoops", "shell-hoops"],
  },
  {
    title: "Dreamy Danglers",
    kicker: "Danglers",
    text: "Butterflies and crystal showers that move with you.",
    href: "/shop/?category=danglers",
    tone: "lilac",
    picks: ["crystal-rain-danglers", "lilac-butterfly-danglers", "pearl-drop-earrings"],
  },
];

export default function CollectionsPage() {
  return (
    <div className={`container page-enter ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          Collections <span aria-hidden>✦</span>
        </h1>
        <p className={styles.subtitle}>Find the sparkle that matches your mood.</p>
      </header>

      <div className={styles.grid}>
        {collections.map((c, i) => (
          <Reveal key={c.title} delay={(i % 2) * 120}>
            <Link href={c.href} className={`${styles.card} tone-${c.tone}`}>
              <div className={styles.body}>
                <span className={styles.kicker}>{c.kicker}</span>
                <h2 className={styles.cardTitle}>{c.title}</h2>
                <p className={styles.text}>{c.text}</p>
                <span className={styles.cta}>
                  Explore <ArrowRight size={20} />
                </span>
              </div>
              {/* Three photos stacked like cards; they fan out on hover */}
              <div className={styles.fan} aria-hidden>
                {c.picks.map((slug, j) => {
                  const p = getProduct(slug)!;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={slug} src={p.image} alt="" className={`${styles.photo} ${styles[`p${j}`]}`} loading="lazy" />
                  );
                })}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
