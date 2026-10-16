"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects";

/** Renders a price that tweens smoothly to its new value whenever it changes. */
export default function CountUp({ value, prefix = "$", duration = 600 }: { value: number; prefix?: string; duration?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value || prefersReducedMotion()) {
      from.current = value;
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = start + (value - start) * eased;
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {Math.round(shown).toLocaleString("en-US")}
    </span>
  );
}
