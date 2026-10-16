import Link from "next/link";
import { ArrowRight, GiftIcon, HeartIcon, LeafIcon, TruckIcon } from "@/components/Icons";
import { FeatureCard } from "@/components/ProductCards";
import Reveal from "@/components/Reveal";
import { getProduct } from "@/lib/products";
import HeroStage from "./HeroStage";
import { Bestsellers, NewArrivals, Newsletter, Stats } from "./home/HomeInteractive";
import { Faq, GiftGuide, homeData, SectionHead, StyleTiles, Testimonials, TryOnPromo } from "./home/HomeSections";
import home from "./home/home.module.css";
import styles from "./page.module.css";

const featured = ["pearl-drop-earrings", "star-studs", "cherry-hoops", "lilac-butterfly-danglers"].map(
  (s) => getProduct(s)!,
);

const marquee = [
  "Handmade with love",
  "Hypoallergenic",
  "Free shipping, always",
  "Gift-ready packaging",
  "Small sparkles",
  "Brighter days",
];

const words = (text: string, offset: number) =>
  text.split(" ").map((w, i) => (
    <span key={i} className={styles.word} style={{ animationDelay: `${offset + i * 110}ms` }}>
      {w}&nbsp;
    </span>
  ));

export default function Home() {
  return (
    <div className="page-enter">
      <section className={`container ${styles.hero}`}>
        <div className={styles.copy}>
          <span className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden />
            New: Pearl Drop Collection
          </span>
          <h1 className={styles.title}>
            <span className={styles.line}>{words("Little things.", 150)}</span>
            <span className={styles.line}>
              {words("Big sparkle.", 420)}
              <span className={styles.titleHeart} aria-hidden>
                ♥
              </span>
            </span>
          </h1>
          <p className={styles.lede}>Handmade earrings for every mood.</p>
          <div className={styles.ctaRow}>
            <Link href="/shop/" className="btn">
              Shop Now <ArrowRight size={24} />
            </Link>
          </div>
        </div>

        <HeroStage />
      </section>

      <section className={`container ${styles.featured}`} aria-label="Featured earrings">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={i * 110}>
            <FeatureCard product={p} />
          </Reveal>
        ))}
      </section>

      <section className={styles.marquee} aria-label="Why Lumi Lobes">
        <div className={styles.marqueeTrack}>
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className={styles.marqueeItem}>
              {m} <span aria-hidden>✦</span>
            </span>
          ))}
        </div>
      </section>

      <section className={`container ${home.section}`}>
        <SectionHead kicker="Find your fit" title="Shop by style" href="/shop/" cta="All designs" />
        <StyleTiles />
      </section>

      <section className={`container ${home.section}`}>
        <SectionHead kicker="Just landed" title="Fresh sparkle" href="/shop/?sort=new" />
        <NewArrivals slugs={homeData.newArrivals} />
      </section>

      <section className={`container ${home.section}`}>
        <TryOnPromo />
      </section>

      <section className={`container ${home.section}`}>
        <SectionHead kicker="Most loved" title="Bestsellers by mood" href="/shop/?sort=rating" />
        <Bestsellers byMood={homeData.bestByMood} />
      </section>

      <section className={`container ${home.section}`}>
        <Stats items={homeData.stats} />
      </section>

      <section className={home.section}>
        <div className="container">
          <SectionHead kicker="Kind words" title="Little notes from happy ears" />
        </div>
        <Testimonials />
      </section>

      <section className={`container ${home.section}`}>
        <SectionHead kicker="Gift guide" title="Sparkle for every budget" />
        <GiftGuide />
      </section>

      <section className={`container ${styles.perks}`}>
        {[
          { icon: <LeafIcon size={28} />, title: "Kind to ears", text: "Nickel-free, hypoallergenic posts on every pair.", tone: "mint" },
          { icon: <GiftIcon size={28} />, title: "Ready for gifting", text: "Every order arrives in a little keepsake box.", tone: "pink" },
          { icon: <TruckIcon size={28} />, title: "Free shipping", text: "On all orders, always. No minimums, no fuss.", tone: "lilac" },
          { icon: <HeartIcon size={28} />, title: "Made by hand", text: "Small batches, assembled with care in our studio.", tone: "peach" },
        ].map((perk, i) => (
          <Reveal key={perk.title} delay={i * 90} className={`${styles.perk} tone-${perk.tone}`}>
            <span className={styles.perkIcon}>{perk.icon}</span>
            <h2 className={styles.perkTitle}>{perk.title}</h2>
            <p className={styles.perkText}>{perk.text}</p>
          </Reveal>
        ))}
      </section>

      <section className={`container ${home.section}`}>
        <div className={home.split}>
          <div>
            <SectionHead kicker="Questions" title="Good to know" />
            <Faq />
          </div>
          <div className={home.club}>
            <span className={home.clubSpark} aria-hidden>
              ✦
            </span>
            <h2 className={home.clubTitle}>Join the Sparkle Club</h2>
            <p className={home.clubText}>New drops, restocks and members-only treats, about twice a month. No spam, just sparkle.</p>
            <Newsletter />
          </div>
        </div>
      </section>
    </div>
  );
}
