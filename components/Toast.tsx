"use client";

import { useCart } from "./CartProvider";
import { CheckIcon } from "./Icons";
import styles from "./Footer.module.css";

export default function Toast() {
  const { toast } = useCart();
  return (
    <div className={styles.toastRegion} role="status" aria-live="polite">
      {toast && (
        <div className={styles.toast} key={toast}>
          <span className={styles.toastIcon}>
            <CheckIcon size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
