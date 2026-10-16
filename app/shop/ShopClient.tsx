"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "@/components/Icons";
import { ShopCard } from "@/components/ProductCards";
import { MOODS, MOTIFS, PALETTES, type Mood, type MotifId, type PaletteId } from "@/lib/design";
import { categories, products, type Category } from "@/lib/products";
import styles from "./shop.module.css";

const sorts = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
] as const;

type SortId = (typeof sorts)[number]["id"];

export const PRICE_BANDS = [
  { id: "under-15", label: "Under $15", min: 0, max: 14.99 },
  { id: "15-20", label: "$15 – $20", min: 15, max: 20 },
  { id: "20-25", label: "$20 – $25", min: 20.01, max: 25 },
  { id: "25-plus", label: "$25 and up", min: 25.01, max: Infinity },
] as const;

type PriceId = (typeof PRICE_BANDS)[number]["id"];

type Filters = {
  category: "all" | Category;
  motif: "all" | MotifId;
  color: "all" | PaletteId;
  mood: "all" | Mood;
  price: "all" | PriceId;
  q: string;
  sort: SortId;
};

const DEFAULTS: Filters = { category: "all", motif: "all", color: "all", mood: "all", price: "all", q: "", sort: "trending" };
const PAGE = 24;

const fmt = (n: number) => n.toLocaleString("en-US");

function readUrl(): Filters {
  const sp = new URLSearchParams(window.location.search);
  const pick = <T extends string>(key: string, valid: readonly string[], fallback: T) => {
    const v = sp.get(key);
    return (v && valid.includes(v) ? v : fallback) as T;
  };
  return {
    category: pick("category", categories.map((c) => c.id), "all"),
    motif: pick("motif", Object.keys(MOTIFS), "all"),
    color: pick("color", Object.keys(PALETTES), "all"),
    mood: pick("mood", MOODS.map((m) => m.id), "all"),
    price: pick("price", PRICE_BANDS.map((b) => b.id), "all"),
    q: sp.get("q") ?? "",
    sort: pick("sort", sorts.map((s) => s.id), "trending"),
  };
}

export default function ShopClient() {
  const [f, setF] = useState<Filters>(DEFAULTS);
  const [visible, setVisible] = useState(PAGE);
  const [sortOpen, setSortOpen] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const update = useCallback((patch: Partial<Filters>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setVisible(PAGE);
  }, []);

  // Deep links like /shop/?category=hoops&color=mint (used by Home and Collections).
  useEffect(() => setF(readUrl()), []);

  // Keep the URL shareable as filters change.
  useEffect(() => {
    const sp = new URLSearchParams();
    (Object.keys(f) as (keyof Filters)[]).forEach((k) => {
      if (f[k] && f[k] !== DEFAULTS[k]) sp.set(k, f[k]);
    });
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = chipsRef.current?.querySelector<HTMLElement>(`[data-id='${f.category}']`);
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [f.category]);

  // Bring the active chip into view inside the horizontally scrolling row.
  useEffect(() => {
    chipsRef.current
      ?.querySelector<HTMLElement>(`[data-id='${f.category}']`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [f.category]);

  useEffect(() => {
    if (!sortOpen) return;
    const close = (e: MouseEvent) => {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSortOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [sortOpen]);

  const list = useMemo(() => {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    const out = products.filter((p) => {
      if (p.category === "necklaces") return false;
      if (f.category !== "all" && p.category !== f.category) return false;
      if (f.motif !== "all" && p.design.motif !== f.motif) return false;
      if (f.color !== "all" && p.design.palette !== f.color) return false;
      if (f.mood !== "all" && p.mood !== f.mood) return false;
      if (f.price !== "all") {
        const band = PRICE_BANDS.find((b) => b.id === f.price)!;
        if (p.price < band.min || p.price > band.max) return false;
      }
      if (terms.length) {
        const hay = `${p.name} ${p.category} ${p.mood} ${p.description}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    const sorters: Record<SortId, (a: (typeof out)[0], b: (typeof out)[0]) => number> = {
      trending: (a, b) => a.trending - b.trending,
      new: (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || a.trending - b.trending,
      "price-asc": (a, b) => a.price - b.price || a.trending - b.trending,
      "price-desc": (a, b) => b.price - a.price || a.trending - b.trending,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    };
    return out.sort(sorters[f.sort]);
  }, [f]);

  // Infinite scroll: reveal the next page when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible((v) => Math.min(v + PAGE, list.length)),
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [list.length, visible]);

  const shown = list.slice(0, visible);
  const sortLabel = sorts.find((s) => s.id === f.sort)!.label;
  const activeExtras = [
    f.motif !== "all" && { key: "motif" as const, label: `Motif: ${MOTIFS[f.motif].label}` },
    f.color !== "all" && { key: "color" as const, label: `Colour: ${PALETTES[f.color].name}` },
    f.mood !== "all" && { key: "mood" as const, label: `Mood: ${MOODS.find((m) => m.id === f.mood)!.label}` },
    f.price !== "all" && { key: "price" as const, label: PRICE_BANDS.find((b) => b.id === f.price)!.label },
    f.q && { key: "q" as const, label: `“${f.q}”` },
  ].filter(Boolean) as { key: "motif" | "color" | "mood" | "price" | "q"; label: string }[];

  return (
    <div className={`container page-enter ${styles.shop}`}>
      <div className={styles.intro}>
        <h1 className={styles.title}>
          Shop <span className={styles.count}>{fmt(list.length)} designs</span>
        </h1>
        <label className={styles.search}>
          <span className="sr-only">Search earrings</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Search hearts, mint hoops, pearls…"
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </label>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.chipsScroller}>
          <div className={styles.chips} ref={chipsRef} role="tablist" aria-label="Filter by style">
            {pill && <span className={styles.chipPill} style={{ left: pill.left, width: pill.width }} aria-hidden />}
            {categories.map((c) => (
              <button
                key={c.id}
                data-id={c.id}
                role="tab"
                aria-selected={f.category === c.id}
                className={`${styles.chip} ${f.category === c.id ? styles.chipActive : ""}`}
                onClick={() => update({ category: c.id })}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sort} ref={sortRef}>
          <button
            className={styles.sortBtn}
            onClick={() => setSortOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            Sort: {sortLabel}
            <ChevronDown size={20} className={`${styles.chev} ${sortOpen ? styles.chevOpen : ""}`} />
          </button>
          <ul className={`${styles.sortMenu} ${sortOpen ? styles.sortMenuOpen : ""}`} role="listbox">
            {sorts.map((s) => (
              <li key={s.id}>
                <button
                  role="option"
                  aria-selected={f.sort === s.id}
                  className={`${styles.sortOption} ${f.sort === s.id ? styles.sortOptionActive : ""}`}
                  onClick={() => {
                    update({ sort: s.id });
                    setSortOpen(false);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.refine}>
        <div className={styles.swatches} role="radiogroup" aria-label="Filter by colour">
          {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={f.color === id}
              title={PALETTES[id].name}
              aria-label={PALETTES[id].name}
              className={`${styles.swatch} ${f.color === id ? styles.swatchOn : ""}`}
              style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${PALETTES[id].mid} 55%, ${PALETTES[id].dark})` }}
              onClick={() => update({ color: f.color === id ? "all" : id })}
            />
          ))}
        </div>
        <label className={styles.select}>
          <span className="sr-only">Motif</span>
          <select value={f.motif} onChange={(e) => update({ motif: e.target.value as Filters["motif"] })}>
            <option value="all">All motifs</option>
            {(Object.keys(MOTIFS) as MotifId[]).map((m) => (
              <option key={m} value={m}>
                {MOTIFS[m].label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} />
        </label>
        <label className={styles.select}>
          <span className="sr-only">Mood</span>
          <select value={f.mood} onChange={(e) => update({ mood: e.target.value as Filters["mood"] })}>
            <option value="all">Any mood</option>
            {MOODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} />
        </label>
        <label className={styles.select}>
          <span className="sr-only">Price</span>
          <select value={f.price} onChange={(e) => update({ price: e.target.value as Filters["price"] })}>
            <option value="all">Any price</option>
            {PRICE_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <ChevronDown size={18} />
        </label>
      </div>

      {activeExtras.length > 0 && (
        <div className={styles.active}>
          {activeExtras.map((x) => (
            <button key={x.key} className={styles.activeChip} onClick={() => update({ [x.key]: DEFAULTS[x.key] })}>
              {x.label} <span aria-hidden>×</span>
              <span className="sr-only">remove filter</span>
            </button>
          ))}
          <button className={styles.clearAll} onClick={() => update({ ...DEFAULTS, sort: f.sort })}>
            Clear all
          </button>
        </div>
      )}

      {list.length > 0 ? (
        <>
          {/* Re-keying replays the staggered entrance whenever the filters change */}
          <div className={styles.grid} key={JSON.stringify(f)}>
            {shown.map((p, i) => (
              <ShopCard key={p.slug} product={p} index={i % PAGE} />
            ))}
          </div>
          <div ref={sentinelRef} className={styles.more}>
            <p>
              Showing {fmt(shown.length)} of {fmt(list.length)}
            </p>
            {shown.length < list.length && (
              <button className={styles.moreBtn} onClick={() => setVisible((v) => v + PAGE)}>
                Load more sparkle
              </button>
            )}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>
            ✦
          </span>
          <h2>No sparkles match… yet</h2>
          <p>Try a different colour or motif, or clear your filters to see all {fmt(products.length)} designs.</p>
          <button className="btn" onClick={() => update(DEFAULTS)}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
