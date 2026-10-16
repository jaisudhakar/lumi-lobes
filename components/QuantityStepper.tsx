"use client";

import { useRef } from "react";
import { Minus, Plus } from "./Icons";
import styles from "./QuantityStepper.module.css";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "md" | "lg";
};

/** − n + stepper; the number rolls up or down depending on direction. */
export default function QuantityStepper({ value, onChange, min = 1, max = 9, label, size = "md" }: Props) {
  const dir = useRef<"up" | "down">("up");

  const step = (d: 1 | -1) => {
    const next = Math.max(min, Math.min(max, value + d));
    if (next === value) return;
    dir.current = d > 0 ? "up" : "down";
    onChange(next);
  };

  return (
    <div className={`${styles.stepper} ${size === "lg" ? styles.lg : ""}`} role="group" aria-label={label}>
      <button className={styles.btn} onClick={() => step(-1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus size={20} />
      </button>
      <span className={styles.value} aria-live="polite">
        <span key={value} className={dir.current === "up" ? styles.rollUp : styles.rollDown}>
          {value}
        </span>
      </span>
      <button className={styles.btn} onClick={() => step(1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={20} />
      </button>
    </div>
  );
}
