import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>
            Lumi Lobes <span aria-hidden>♥</span>
          </p>
          <p className={styles.note}>Handmade earrings for every mood. Small sparkles, brighter days.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/shop/">Shop</Link>
          <Link href="/collections/">Collections</Link>
          <Link href="/cart/">Cart</Link>
        </nav>
        <p className={styles.copy}>© {new Date().getFullYear()} Lumi Lobes · Made with sparkle</p>
      </div>
    </footer>
  );
}
