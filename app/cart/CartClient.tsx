"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart, type CartLine } from "@/components/CartProvider";
import CountUp from "@/components/CountUp";
import {
  ArrowRight,
  BagIcon,
  GiftIcon,
  HeartIcon,
  ShieldIcon,
  StarIcon,
  TrashIcon,
  TruckIcon,
} from "@/components/Icons";
import { FeatureCard } from "@/components/ProductCards";
import QuantityStepper from "@/components/QuantityStepper";
import Reveal from "@/components/Reveal";
import { sparkleBurst } from "@/lib/effects";
import { formatPrice, getProduct, giftBox } from "@/lib/products";
import styles from "./cart.module.css";

const finishLabel = { gold: "Gold", silver: "Silver", rose: "Rose" } as const;

export default function CartClient() {
  const { lines, gift, count, subtotal, setQty, remove, setGift, ready, showToast } = useCart();
  const [leaving, setLeaving] = useState<string[]>([]);
  const checkoutRef = useRef<HTMLButtonElement>(null);

  const key = (l: CartLine) => `${l.slug}:${l.finish}`;

  // Play the collapse animation first, then actually drop the line.
  const removeLine = (l: CartLine) => {
    setLeaving((xs) => [...xs, key(l)]);
    setTimeout(() => {
      remove(l.slug, l.finish);
      setLeaving((xs) => xs.filter((k) => k !== key(l)));
    }, 420);
  };

  const onCheckout = () => {
    sparkleBurst(checkoutRef.current, 24, ["✦", "♥", "✧", "★"]);
    showToast("This is a demo store, so no payment is taken ✨");
  };

  if (!ready) return <div className={`container ${styles.page}`} style={{ minHeight: 600 }} />;

  if (count === 0) {
    const picks = ["pearl-drop-earrings", "star-studs", "mini-heart-studs"].map((s) => getProduct(s)!);
    return (
      <div className={`container page-enter ${styles.page}`}>
        <div className={styles.empty}>
          <span className={styles.emptyBag} aria-hidden>
            <BagIcon size={56} />
            <span className={styles.emptySpark}>✦</span>
          </span>
          <h1 className={styles.emptyTitle}>Your cart is feeling a little empty</h1>
          <p className={styles.emptyText}>Let&rsquo;s find some small sparkles for brighter days.</p>
          <Link href="/shop/" className="btn">
            Shop Now <ArrowRight size={24} />
          </Link>
        </div>
        <h2 className={styles.suggestTitle}>Customer favorites</h2>
        <div className={styles.suggest}>
          {picks.map((p, i) => (
            <Reveal key={p.slug} delay={i * 100}>
              <FeatureCard product={p} size="sm" />
            </Reveal>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.layout}>
        <div>
          <header className={styles.head}>
            <h1 className={styles.title}>
              Your Cart
              <span className={styles.titleHeart} aria-hidden>
                ♥
              </span>
            </h1>
            <p className={styles.subtitle}>Little sparkles, on their way to you.</p>
          </header>

          <ul className={styles.items}>
            {lines.map((l, i) => {
              const p = getProduct(l.slug)!;
              const isLeaving = leaving.includes(key(l));
              return (
                <li
                  key={key(l)}
                  className={`${styles.item} ${isLeaving ? styles.leaving : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={styles.itemInner}>
                    <Link href={`/product/${p.slug}/`} className={`${styles.thumb} tone-${p.tone}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} />
                    </Link>
                    <div className={styles.meta}>
                      <Link href={`/product/${p.slug}/`} className={styles.itemName}>
                        {p.name}
                      </Link>
                      <p className={styles.itemPrice}>{formatPrice(p.price)}</p>
                      <div className={styles.tags}>
                        {p.badge && (
                          <span className={`chip ${styles.tag} tone-${p.tone}`}>
                            {p.badge === "Everyday favorite" ? <StarIcon size={15} /> : <HeartIcon size={15} />}
                            {p.badge}
                          </span>
                        )}
                        <span className={`chip ${styles.tag} ${styles.finishTag}`}>
                          <span className={`${styles.finishDot} ${styles[l.finish]}`} aria-hidden />
                          {finishLabel[l.finish]}
                        </span>
                      </div>
                    </div>
                    <QuantityStepper
                      value={l.qty}
                      onChange={(n) => setQty(l.slug, l.finish, n)}
                      label={`Quantity of ${p.name}`}
                    />
                    <p className={styles.lineTotal}>
                      <CountUp value={p.price * l.qty} />
                    </p>
                    <button className={styles.trash} onClick={() => removeLine(l)} aria-label={`Remove ${p.name}`}>
                      <TrashIcon size={26} />
                    </button>
                  </div>
                </li>
              );
            })}

            <li className={`${styles.item} ${styles.giftItem}`} style={{ animationDelay: `${lines.length * 80}ms` }}>
              <div className={styles.itemInner}>
                <div className={`${styles.thumb} tone-pink ${gift ? styles.giftOn : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={giftBox.image} alt="" />
                </div>
                <div className={styles.meta}>
                  <p className={styles.itemName}>{giftBox.name}</p>
                  <p className={styles.itemPrice}>{formatPrice(giftBox.price)}</p>
                  <p className={styles.giftNote}>A special touch for someone special.</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={gift}
                    onChange={(e) => setGift(e.target.checked)}
                    className={styles.toggleInput}
                  />
                  <span className={styles.toggleTrack} aria-hidden>
                    <span className={styles.toggleKnob} />
                  </span>
                  <span className={styles.toggleText}>{gift ? "Added" : "Add"}</span>
                </label>
                <p className={`${styles.lineTotal} ${gift ? "" : styles.dim}`}>{formatPrice(giftBox.price)}</p>
                <button
                  className={styles.trash}
                  onClick={() => setGift(false)}
                  disabled={!gift}
                  aria-label="Remove gift box"
                >
                  <TrashIcon size={26} />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <ul className={styles.summaryLines}>
            {lines.map((l) => {
              const p = getProduct(l.slug)!;
              return (
                <li key={key(l)} className={styles.summaryLine}>
                  <span>
                    {p.name} × {l.qty}
                  </span>
                  <strong>
                    <CountUp value={p.price * l.qty} />
                  </strong>
                </li>
              );
            })}
            {gift && (
              <li className={styles.summaryLine}>
                <span>{giftBox.name}</span>
                <strong>{formatPrice(giftBox.price)}</strong>
              </li>
            )}
          </ul>
          <div className={styles.summaryTotals}>
            <div className={styles.summaryLine}>
              <span>Subtotal</span>
              <strong>
                <CountUp value={subtotal} />
              </strong>
            </div>
            <div className={styles.summaryLine}>
              <span>Shipping</span>
              <strong className={styles.free}>Free</strong>
            </div>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <strong>
              <CountUp value={subtotal} />
            </strong>
          </div>
          <button ref={checkoutRef} className={`btn btn-block ${styles.checkout}`} onClick={onCheckout}>
            Checkout <ArrowRight size={26} />
          </button>
          <p className={styles.secure}>
            <ShieldIcon size={22} /> Secure checkout • SSL encrypted
          </p>
        </aside>
      </div>

      <div className={styles.perks}>
        {[
          { icon: <TruckIcon size={30} />, title: "Free shipping", text: "On all orders, always.", tone: "lilac" },
          { icon: <GiftIcon size={30} />, title: "Beautifully packaged", text: "Ready for gifting.", tone: "pink" },
          { icon: <HeartIcon size={30} />, title: "Spread more sparkle", text: "Small things make brighter days.", tone: "mint" },
        ].map((perk, i) => (
          <Reveal key={perk.title} delay={i * 100} className={`${styles.perk} tone-${perk.tone}`}>
            <span className={styles.perkIcon}>{perk.icon}</span>
            <span>
              <strong className={styles.perkTitle}>{perk.title}</strong>
              <span className={styles.perkText}>{perk.text}</span>
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
