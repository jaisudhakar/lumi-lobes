import styles from "./FloatingOrbs.module.css";

export type OrbSpec = {
  kind: "mint" | "peach" | "pearl" | "lilac" | "pink" | "bubble";
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  /** Parallax depth: how strongly it follows the pointer (uses --mx/--my from a parent). */
  depth?: number;
  delay?: number;
  blur?: boolean;
};

/** Glossy pastel spheres (and a heart bubble) that bob around a product. */
export default function FloatingOrbs({ orbs }: { orbs: OrbSpec[] }) {
  return (
    <div className={styles.layer} aria-hidden>
      {orbs.map((o, i) => (
        <div
          key={i}
          className={styles.parallax}
          style={
            {
              top: o.top,
              left: o.left,
              right: o.right,
              bottom: o.bottom,
              width: o.size,
              height: o.size,
              "--depth": o.depth ?? 20,
            } as React.CSSProperties
          }
        >
          <div
            className={`${styles.orb} ${styles[o.kind]} ${o.blur ? styles.blur : ""} ${i % 2 ? styles.alt : ""}`}
            style={{ animationDelay: `${o.delay ?? i * -1.3}s` }}
          >
            {o.kind === "bubble" && (
              <svg viewBox="0 0 100 100" className={styles.heart}>
                <defs>
                  <radialGradient id="heartFill" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#ffe1d6" />
                    <stop offset="45%" stopColor="#f9a990" />
                    <stop offset="100%" stopColor="#ec8a7a" />
                  </radialGradient>
                </defs>
                <path
                  d="M50 86C22 66 10 50 10 34a19 19 0 0 1 40-9 19 19 0 0 1 40 9c0 16-12 32-40 52Z"
                  fill="url(#heartFill)"
                />
                <ellipse cx="32" cy="32" rx="9" ry="5" fill="#fff" opacity=".6" transform="rotate(-35 32 32)" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
