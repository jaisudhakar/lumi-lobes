"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { BagIcon, MenuIcon } from "./Icons";
import styles from "./Header.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop/", label: "Shop" },
  { href: "/collections/", label: "Collections" },
  { href: "/cart/", label: "Cart" },
];

const isActive = (pathname: string, href: string) => {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (href === "/") return path === "/" || path.startsWith("/product/");
  return path.startsWith(href);
};

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="Lumi Lobes home">
      <span className={styles.wordmark}>
        Lumi Lobes
        <span className={styles.logoHeart} aria-hidden>
          ♥
        </span>
      </span>
      <span className={styles.tagline}>
        Small sparkles
        <br />
        brighter days
      </span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname() || "/";
  const { count, pulse, ready } = useCart();
  const navRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Slide the active "pill" under whichever nav link matches the route.
  useLayoutEffect(() => {
    const measure = () => {
      const active = navRef.current?.querySelector<HTMLElement>("[data-active='true']");
      setPill(active ? { left: active.offsetLeft, width: active.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!pulse) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 650);
    return () => clearTimeout(t);
  }, [pulse]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Logo />

        <nav className={`${styles.nav} ${open ? styles.open : ""}`} aria-label="Main">
          <div className={styles.links} ref={navRef}>
            {pill && <span className={styles.pill} style={{ left: pill.left, width: pill.width }} aria-hidden />}
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className={`${styles.link} ${active ? styles.active : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.actions}>
          <Link
            href="/cart/"
            id="cart-target"
            className={`${styles.bag} ${bump ? styles.bump : ""}`}
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <BagIcon size={26} />
            <span className={styles.badge} key={ready ? count : "x"}>
              {ready ? count : 0}
            </span>
          </Link>
          <button className={styles.menuBtn} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            <MenuIcon size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
