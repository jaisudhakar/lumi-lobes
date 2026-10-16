"use client";

import { useRef, useState } from "react";
import EarringSpinner from "@/components/EarringSpinner";
import FloatingOrbs from "@/components/FloatingOrbs";
import { HandIcon } from "@/components/Icons";
import styles from "./page.module.css";

/** Right-hand side of the hero: spinnable earring, orbit ring and floating orbs with pointer parallax. */
export default function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [hintGone, setHintGone] = useState(false);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };

  const onPointerLeave = () => {
    ref.current?.style.setProperty("--mx", "0");
    ref.current?.style.setProperty("--my", "0");
  };

  return (
    <div className={styles.stage} ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className={styles.halo} aria-hidden />

      {/* Orbit ring circling the earring */}
      <svg className={styles.orbit} viewBox="0 0 600 260" aria-hidden>
        <ellipse cx="300" cy="130" rx="290" ry="105" className={styles.orbitPath} />
        <circle r="6" className={styles.orbitDot}>
          <animateMotion dur="9s" repeatCount="indefinite" path="M10,130 a290,105 0 1,0 580,0 a290,105 0 1,0 -580,0" />
        </circle>
      </svg>

      <FloatingOrbs
        orbs={[
          { kind: "mint", size: 110, top: "0%", left: "-6%", depth: 26, blur: true },
          { kind: "bubble", size: 250, top: "4%", right: "-4%", depth: 14 },
          { kind: "pearl", size: 76, top: "28%", right: "28%", depth: 34 },
          { kind: "peach", size: 140, bottom: "-2%", left: "-14%", depth: 18 },
          { kind: "peach", size: 120, top: "62%", right: "-7%", depth: 22 },
          { kind: "mint", size: 112, bottom: "-6%", right: "26%", depth: 30 },
        ]}
      />

      <div className={styles.earring}>
        <EarringSpinner
          src="/images/products/pearl-drop-hero.webp"
          alt="Pearl Drop Earring with a crystal flower"
          ratio={270 / 465}
          onFirstSpin={() => setHintGone(true)}
        />
      </div>

      <div className={`${styles.hint} ${hintGone ? styles.hintGone : ""}`} aria-hidden>
        <span>Drag to spin</span>
        <span className={styles.hintRow}>
          <span className={styles.hintArrowL}>←</span>
          <HandIcon size={30} />
          <span className={styles.hintArrowR}>→</span>
        </span>
      </div>

      <p className={styles.vertical} aria-hidden>
        Sparkle
        <br />a brighter
        <br />
        you
      </p>
    </div>
  );
}
