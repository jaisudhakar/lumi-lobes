"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, type Finish } from "@/components/CartProvider";
import EarringSpinner from "@/components/EarringSpinner";
import FloatingOrbs from "@/components/FloatingOrbs";
import {
  ArrowLeft,
  ArrowRight,
  BagIcon,
  CheckIcon,
  CubeIcon,
  Expand,
  HandIcon,
  LeafIcon,
  Minus,
  Plus,
  StarIcon,
} from "@/components/Icons";
import { FeatureCard } from "@/components/ProductCards";
import QuantityStepper from "@/components/QuantityStepper";
import Reveal from "@/components/Reveal";
import { flyToCart, sparkleBurst } from "@/lib/effects";
import { artUri, earringGeometry } from "@/lib/earringArt";
import { formatPrice, getProduct, relatedProducts } from "@/lib/products";
import styles from "./product.module.css";

const finishes: { id: Finish; label: string; filter: string }[] = [
  { id: "gold", label: "Gold", filter: "none" },
  { id: "silver", label: "Silver", filter: "saturate(0.1) brightness(1.06) contrast(1.04)" },
  { id: "rose", label: "Rose", filter: "sepia(0.25) saturate(1.3) hue-rotate(-16deg)" },
];

const ZOOM_STEPS = [0.8, 1, 1.25, 1.5, 1.8];

export default function ProductClient({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const related = useMemo(() => relatedProducts(slug), [slug]);
  const { add, showToast } = useCart();
  const [finish, setFinish] = useState<Finish>("gold");
  const [qty, setQty] = useState(1);
  const [zoomIdx, setZoomIdx] = useState(1);
  const [added, setAdded] = useState(false);
  const [finishFlash, setFinishFlash] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const tryOnRef = useRef<HTMLAnchorElement>(null);

  // Reset when navigating between products (the component instance is reused).
  useEffect(() => {
    setFinish("gold");
    setQty(1);
    setZoomIdx(1);
  }, [product.slug]);

  const current = finishes.find((f) => f.id === finish)!;
  // Photos are re-tinted with a CSS filter; generated designs are simply redrawn in the chosen metal.
  const viewImage = product.photo
    ? (product.heroImage ?? product.image)
    : artUri(product.design, { metal: finish, single: true });
  const viewRatio = product.photo ? (product.viewRatio ?? 345 / 268) : earringGeometry(product.design.style).ratio;
  const canTryOn = product.category !== "necklaces";

  const chooseFinish = (f: Finish) => {
    if (f === finish) return;
    setFinish(f);
    setFinishFlash((n) => n + 1);
  };

  const toggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => {});
  };

  const onAdd = async () => {
    if (added) return;
    setAdded(true);
    await flyToCart(stageRef.current, product.photo ? product.image : artUri(product.design, { metal: finish }));
    add(product.slug, qty, finish);
    showToast(`${qty} × ${product.name} (${current.label}) added`);
    setTimeout(() => setAdded(false), 1800);
  };

  const fullStars = Math.round(product.rating);

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.top}>
        <div className={styles.left}>
          <Link href="/shop/" className={styles.back}>
            <ArrowLeft size={22} /> Back to Shop
          </Link>

          <div ref={stageRef} className={`${styles.stage} tone-${product.tone} ${product.heroImage ? styles.stageHero : ""}`}>
            <div className={styles.podium} aria-hidden />
            <div className={styles.orbs}>
              <FloatingOrbs
              orbs={[
                { kind: "mint", size: 130, top: "18%", left: "8%", depth: 0 },
                { kind: "peach", size: 120, top: "52%", left: "13%", depth: 0 },
                { kind: "bubble", size: 150, top: "11%", right: "3%", depth: 0 },
                { kind: "pearl", size: 70, top: "38%", right: "24%", depth: 0 },
              ]}
              />
            </div>

            <div className={styles.viewer}>
              <EarringSpinner
                key={product.slug}
                src={viewImage}
                alt={`${product.name} in ${current.label.toLowerCase()}`}
                ratio={viewRatio}
                filter={product.photo ? current.filter : undefined}
                zoom={ZOOM_STEPS[zoomIdx]}
              />
              {finishFlash > 0 && <span key={finishFlash} className={styles.finishFlash} aria-hidden />}
            </div>

            <div className={styles.zoomControls}>
              <button
                className="icon-btn"
                onClick={() => setZoomIdx((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
                aria-label="Zoom in"
              >
                <Plus size={24} />
              </button>
              <button className="icon-btn" onClick={() => setZoomIdx((z) => Math.max(0, z - 1))} aria-label="Zoom out">
                <Minus size={24} />
              </button>
              <button className="icon-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
                <Expand size={22} />
              </button>
            </div>

            <span className={`${styles.stageChip} ${styles.dragChip}`}>
              <HandIcon size={22} /> Drag to rotate
            </span>
            {canTryOn && (
              <Link
                href={`/try-on/?p=${product.slug}&metal=${finish}`}
                className={`${styles.stageChip} ${styles.tryOn}`}
                onClick={() => sparkleBurst(tryOnRef.current, 12)}
                ref={tryOnRef}
              >
                <CubeIcon size={22} /> Try on
              </Link>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.rating}>
            <span className={styles.stars} aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} size={22} filled={i < fullStars} style={{ animationDelay: `${300 + i * 90}ms` }} />
              ))}
            </span>
            <span>
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div className={styles.priceRow}>
            <p className={styles.price}>{formatPrice(product.price)}</p>
            <span className={styles.hypo}>
              <LeafIcon size={20} /> Hypoallergenic
            </span>
          </div>

          <p className={styles.description}>{product.description}</p>

          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>Metal Finish</legend>
            <div className={styles.swatches}>
              {finishes.map((f) => (
                <label key={f.id} className={`${styles.swatch} ${finish === f.id ? styles.swatchActive : ""}`}>
                  <input
                    type="radio"
                    name="finish"
                    value={f.id}
                    checked={finish === f.id}
                    onChange={() => chooseFinish(f.id)}
                    className="sr-only"
                  />
                  <span className={`${styles.swatchBall} ${styles[f.id]}`} aria-hidden />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className={styles.label}>Quantity</p>
          <div className={styles.buyRow}>
            <QuantityStepper value={qty} onChange={setQty} label="Quantity" size="lg" />
            <button className={`btn ${styles.addBtn} ${added ? styles.addBtnDone : ""}`} onClick={onAdd}>
              {added ? (
                <>
                  <CheckIcon size={26} /> Added!
                </>
              ) : (
                <>
                  <BagIcon size={26} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <section className={styles.related}>
        <div className={styles.relatedHead}>
          <h2>You&rsquo;ll Also Love</h2>
          <Link href="/shop/" className={styles.viewAll}>
            View All <ArrowRight size={22} />
          </Link>
        </div>
        <div className={styles.relatedGrid}>
          {related.map((p, i) => (
            <Reveal key={p.slug} delay={i * 110}>
              <FeatureCard product={p} size="sm" />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
