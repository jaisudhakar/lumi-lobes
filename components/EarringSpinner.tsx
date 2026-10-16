"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects";
import styles from "./EarringSpinner.module.css";

type Props = {
  src: string;
  alt: string;
  /** CSS filter applied to the photo (used for the metal-finish preview). */
  filter?: string;
  zoom?: number;
  /** Image width / height, so the photo can be scaled to fit the stage in either direction. */
  ratio: number;
  className?: string;
  /** Called once, the first time the visitor drags the earring. */
  onFirstSpin?: () => void;
};

/**
 * A photo of an earring you can grab and spin. Dragging rotates it in 3D with
 * inertia; when released it glides back to face the viewer. While idle it
 * sways like it is hanging from an ear.
 */
export default function EarringSpinner({ src, alt, filter, zoom = 1, ratio, className = "", onFirstSpin }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const state = useRef({ y: 0, x: 0, vy: 0, dragging: false, lastX: 0, lastY: 0, spun: false });
  const [dragging, setDragging] = useState(false);
  const firstSpin = useRef(onFirstSpin);
  firstSpin.current = onFirstSpin;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const s = state.current;
      if (!s.dragging) {
        s.vy *= 0.94;
        s.y += s.vy;
        if (Math.abs(s.vy) < 0.4) {
          // Settle on the nearest "front-facing" angle.
          const target = Math.round(s.y / 360) * 360;
          s.y += (target - s.y) * 0.08;
        }
        s.x += (0 - s.x) * 0.1;
      }
      if (spinRef.current) {
        // A flat photo seen edge-on vanishes, so fake a turntable instead of a true rotateY:
        // squash horizontally (never below 30% width), mirror past 90°, and add a little
        // skew/perspective so it reads as an object turning in space.
        const rad = (s.y * Math.PI) / 180;
        const c = Math.cos(rad);
        const sx = Math.sign(c || 1) * (0.3 + 0.7 * Math.abs(c));
        const skew = Math.sin(rad) * 6;
        spinRef.current.style.transform = `rotateX(${s.x}deg) rotateY(${Math.sin(rad) * 20}deg) skewY(${skew}deg) scaleX(${sx})`;
      }
      if (shadowRef.current) {
        const w = 0.55 + 0.45 * Math.abs(Math.cos((s.y * Math.PI) / 180));
        shadowRef.current.style.transform = `translateX(-50%) scaleX(${w})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.vy = 0;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.y += dx * 0.7;
    s.vy = dx * 0.7;
    s.x = Math.max(-18, Math.min(18, s.x - dy * 0.3));
    if (!s.spun && Math.abs(dx) > 2) {
      s.spun = true;
      firstSpin.current?.();
    }
  };

  const endDrag = () => {
    state.current.dragging = false;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      state.current.vy += e.key === "ArrowLeft" ? -9 : 9;
    }
  };

  // A small automatic twirl on mount shows the earring is interactive.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setTimeout(() => {
      if (!state.current.dragging) state.current.vy = 14;
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${dragging ? styles.dragging : ""} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="img"
      aria-label={`${alt}. Drag, or use the left and right arrow keys, to spin.`}
    >
      <div className={styles.zoom} style={{ transform: `scale(${zoom})` }}>
        <div className={styles.sway}>
          <div ref={spinRef} className={styles.spin} style={{ "--ratio": ratio } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} className={styles.photo} style={{ filter }} />
            <span className={styles.glint} aria-hidden />
          </div>
        </div>
      </div>
      <div ref={shadowRef} className={styles.shadow} aria-hidden />
      <span className={`${styles.twinkle} ${styles.t1}`} aria-hidden>✦</span>
      <span className={`${styles.twinkle} ${styles.t2}`} aria-hidden>✧</span>
      <span className={`${styles.twinkle} ${styles.t3}`} aria-hidden>✦</span>
    </div>
  );
}
