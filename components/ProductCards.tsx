"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatPrice, type Product } from "@/lib/products";
import { flyToCart, sparkleBurst } from "@/lib/effects";
import { useCart } from "./CartProvider";
import { ArrowRight, BagIcon, CheckIcon, HeartIcon } from "./Icons";
import styles from "./ProductCards.module.css";

/** Wide card: photo on the left, name + price + arrow on the right (home & "You'll also love"). */
export function FeatureCard({ product, size = "md" }: { product: Product; size?: "md" | "sm" }) {
  return (
    <Link
      href={`/product/${product.slug}/`}
      className={`${styles.feature} ${size === "sm" ? styles.featureSm : ""} tone-${product.tone}`}
    >
      <div className={styles.featureMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} loading="lazy" className={styles.featureImg} />
      </div>
      <div className={styles.featureBody}>
        <h3 className={styles.featureName}>{product.name}</h3>
        <p className={styles.featurePrice}>{formatPrice(product.price)}</p>
        <span className={`round-arrow ${styles.featureArrow}`} aria-hidden>
          <ArrowRight size={20} />
        </span>
      </div>
      <span className={styles.shine} aria-hidden />
    </Link>
  );
}

/** Tall shop grid card with wishlist heart and quick add-to-bag. */
export function ShopCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, showToast } = useCart();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLButtonElement>(null);

  const onLike = () => {
    setLiked((l) => !l);
    if (!liked) sparkleBurst(heartRef.current, 8, ["♥", "✦"]);
  };

  const onAdd = async () => {
    if (added) return;
    setAdded(true);
    await flyToCart(mediaRef.current, product.image);
    add(product.slug);
    showToast(`${product.name} added to your bag`);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      className={`${styles.shop} tone-${product.tone}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link href={`/product/${product.slug}/`} className={styles.shopLink} aria-label={product.name} />
      <div className={styles.shopMedia} ref={mediaRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt="" loading="lazy" className={styles.shopImg} />
        {product.isNew && <span className={styles.newTag}>New</span>}
      </div>

      <button
        ref={heartRef}
        className={`${styles.like} ${liked ? styles.liked : ""}`}
        onClick={onLike}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      >
        <HeartIcon size={26} filled={liked} />
      </button>

      <div className={styles.shopFooter}>
        <div>
          <h3 className={styles.shopName}>{product.name}</h3>
          <p className={styles.shopPrice}>{formatPrice(product.price)}</p>
        </div>
        <button
          className={`${styles.addBtn} ${added ? styles.addBtnDone : ""}`}
          onClick={onAdd}
          aria-label={`Add ${product.name} to bag`}
        >
          {added ? <CheckIcon size={26} /> : <BagIcon size={26} />}
        </button>
      </div>
    </article>
  );
}
