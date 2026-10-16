"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProduct, giftBox } from "@/lib/products";

export type Finish = "gold" | "silver" | "rose";

export type CartLine = { slug: string; qty: number; finish: Finish };

type CartState = { lines: CartLine[]; gift: boolean };

type CartContextValue = CartState & {
  ready: boolean;
  count: number;
  subtotal: number;
  /** Increments on every add; the header badge watches it to play its bump animation. */
  pulse: number;
  add: (slug: string, qty?: number, finish?: Finish) => void;
  setQty: (slug: string, finish: Finish, qty: number) => void;
  remove: (slug: string, finish: Finish) => void;
  setGift: (on: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const STORAGE_KEY = "lumi-lobes-cart";
const MAX_QTY = 9;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ lines: [], gift: false });
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore the cart after hydration so the static HTML always matches the first client render.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CartState;
        setState({
          lines: (saved.lines ?? []).filter((l) => getProduct(l.slug)),
          gift: Boolean(saved.gift),
        });
      }
    } catch {
      /* storage unavailable: start with an empty cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback((slug: string, qty = 1, finish: Finish = "gold") => {
    setState((s) => {
      const existing = s.lines.find((l) => l.slug === slug && l.finish === finish);
      const lines = existing
        ? s.lines.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
        : [...s.lines, { slug, qty: Math.min(MAX_QTY, qty), finish }];
      return { ...s, lines };
    });
    setPulse((p) => p + 1);
  }, []);

  const setQty = useCallback((slug: string, finish: Finish, qty: number) => {
    setState((s) => ({
      ...s,
      lines: s.lines.map((l) =>
        l.slug === slug && l.finish === finish ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l,
      ),
    }));
  }, []);

  const remove = useCallback((slug: string, finish: Finish) => {
    setState((s) => ({ ...s, lines: s.lines.filter((l) => !(l.slug === slug && l.finish === finish)) }));
  }, []);

  const setGift = useCallback((on: boolean) => setState((s) => ({ ...s, gift: on })), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const items = state.lines.reduce((sum, l) => sum + (getProduct(l.slug)?.price ?? 0) * l.qty, 0);
    const subtotal = items + (state.gift && count > 0 ? giftBox.price : 0);
    return { ...state, ready, count, subtotal, pulse, add, setQty, remove, setGift, toast, showToast };
  }, [state, ready, pulse, add, setQty, remove, setGift, toast, showToast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
