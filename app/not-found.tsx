import Link from "next/link";
import { ArrowRight } from "@/components/Icons";

export default function NotFound() {
  return (
    <div
      className="container page-enter"
      style={{ display: "grid", justifyItems: "center", gap: 18, textAlign: "center", padding: "80px 16px" }}
    >
      <span style={{ fontSize: "4rem", color: "var(--purple)", animation: "float 3s ease-in-out infinite" }} aria-hidden>
        ✦
      </span>
      <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>This sparkle got lost</h1>
      <p style={{ fontSize: "1.2rem", color: "var(--ink-soft)", marginBottom: 12 }}>
        We couldn&rsquo;t find that page, but there are plenty more earrings to love.
      </p>
      <Link href="/shop/" className="btn">
        Back to the Shop <ArrowRight size={24} />
      </Link>
    </div>
  );
}
