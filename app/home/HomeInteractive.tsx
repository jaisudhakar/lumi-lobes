"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CountUp from "@/components/CountUp";
import { ArrowLeft, ArrowRight, CheckIcon } from "@/components/Icons";
import { ShopCard } from "@/components/ProductCards";
import { MOODS, type Mood } from "@/lib/design";
import { sparkleBurst } from "@/lib/effects";
import { getProduct } from "@/lib/products";
import styles from "./home.module.css";

/** Horizontal, swipeable row of new designs with arrow buttons. */
export function NewArrivals({ slugs }: { slugs: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };

  const go = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselNav}>
        <button className="icon-btn" onClick={() => go(-1)} disabled={edge.start} aria-label="Previous">
          <ArrowLeft size={22} />
        </button>
        <button className="icon-btn" onClick={() => go(1)} disabled={edge.end} aria-label="Next">
          <ArrowRight size={22} />
        </button>
      </div>
      <div className={styles.track} ref={track} onScroll={onScroll}>
        {slugs.map((s, i) => (
          <div className={styles.slide} key={s}>
            <ShopCard product={getProduct(s)!} index={i % 6} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mood tabs with a sliding indicator; each tab shows its best-loved designs. */
export function Bestsellers({ byMood }: { byMood: Record<Mood, string[]> }) {
  const [mood, setMood] = useState<Mood>("sweet");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabsRef.current?.querySelector<HTMLElement>(`[data-mood='${mood}']`);
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [mood]);

  return (
    <>
      <div className={styles.tabs} ref={tabsRef} role="tablist" aria-label="Shop by mood">
        {bar && <span className={styles.tabBar} style={{ left: bar.left, width: bar.width }} aria-hidden />}
        {MOODS.map((m) => (
          <button
            key={m.id}
            data-mood={m.id}
            role="tab"
            aria-selected={mood === m.id}
            className={`${styles.tab} ${mood === m.id ? styles.tabOn : ""}`}
            onClick={() => setMood(m.id)}
          >
            <span aria-hidden>{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>
      <p className={styles.tabNote}>{MOODS.find((m) => m.id === mood)!.text}</p>
      <div className={styles.bestGrid} key={mood}>
        {byMood[mood].map((s, i) => (
          <ShopCard key={s} product={getProduct(s)!} index={i} />
        ))}
      </div>
    </>
  );
}

/** Numbers that count up the first time they scroll into view. */
export function Stats({ items }: { items: { value: number; suffix?: string; decimals?: number; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.stats} ref={ref}>
      {items.map((s) => (
        <div key={s.label} className={styles.stat}>
          <strong>
            {s.decimals ? (
              <DecimalCount value={on ? s.value : 0} decimals={s.decimals} />
            ) : (
              <CountUp value={on ? s.value : 0} prefix="" duration={1600} />
            )}
            {s.suffix}
          </strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function DecimalCount({ value, decimals }: { value: number; decimals: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 1600);
      setV(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{v.toFixed(decimals)}</>;
}

/** Newsletter sign-up (front-end only: connect it to your email provider to go live). */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    sparkleBurst(btn.current, 18);
    setDone(true);
  };

  return done ? (
    <p className={styles.joined}>
      <span className={styles.joinedIcon}>
        <CheckIcon size={22} />
      </span>
      You&rsquo;re in! Watch your inbox for first dibs on new sparkles.
    </p>
  ) : (
    <form className={styles.form} onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button ref={btn} className="btn">
        Join <ArrowRight size={22} />
      </button>
    </form>
  );
}
