"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "@/components/Icons";
import { ShopCard } from "@/components/ProductCards";
import { categories, products, type Category } from "@/lib/products";
import styles from "./shop.module.css";

const sorts = [
  { id: "trending", label: "Trending" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
] as const;

type SortId = (typeof sorts)[number]["id"];
type Filter = "all" | Category;

export default function ShopClient() {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortId>("trending");
  const [sortOpen, setSortOpen] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; top: number; width: number } | null>(null);

  // Support deep links like /shop/?category=hoops (used by the Collections page).
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && categories.some((x) => x.id === c)) setFilter(c as Filter);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const el = chipsRef.current?.querySelector<HTMLElement>(`[data-id='${filter}']`);
      if (el) setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [filter]);

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
    const filtered = products.filter((p) => p.category !== "necklaces" && (filter === "all" || p.category === filter));
    const sorted = [...filtered];
    if (sort === "trending") sorted.sort((a, b) => a.trending - b.trending);
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [filter, sort]);

  const sortLabel = sorts.find((s) => s.id === sort)!.label;

  return (
    <div className={`container page-enter ${styles.shop}`}>
      <h1 className="sr-only">Shop all earrings</h1>

      <div className={styles.toolbar}>
        <div className={styles.chips} ref={chipsRef} role="tablist" aria-label="Filter by style">
          {pill && <span className={styles.chipPill} style={{ left: pill.left, top: pill.top, width: pill.width }} aria-hidden />}
          {categories.map((c) => (
            <button
              key={c.id}
              data-id={c.id}
              role="tab"
              aria-selected={filter === c.id}
              className={`${styles.chip} ${filter === c.id ? styles.chipActive : ""}`}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
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
                  aria-selected={sort === s.id}
                  className={`${styles.sortOption} ${sort === s.id ? styles.sortOptionActive : ""}`}
                  onClick={() => {
                    setSort(s.id);
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

      {list.length > 0 ? (
        // Re-keying the grid replays the staggered entrance whenever the filter or sort changes.
        <div className={styles.grid} key={`${filter}-${sort}`}>
          {list.map((p, i) => (
            <ShopCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>
            ✦
          </span>
          <h2>Clip-ons are on their way</h2>
          <p>Our no-piercing collection is being handmade right now. Check back soon for something sparkly!</p>
          <Link href="/shop/" className="btn" onClick={() => setFilter("all")}>
            See all earrings
          </Link>
        </div>
      )}
    </div>
  );
}
