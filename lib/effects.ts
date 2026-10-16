// Small DOM-level animation helpers built on the Web Animations API.
// They create throwaway elements on <body>, so they work from any component.

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Flies a copy of the product image along an arc into the header bag icon. */
export function flyToCart(source: HTMLElement | null, imageSrc: string) {
  const target = document.getElementById("cart-target");
  if (!source || !target || prefersReducedMotion()) return Promise.resolve();

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 160);

  const ghost = document.createElement("img");
  ghost.src = imageSrc;
  ghost.alt = "";
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "24px",
    zIndex: "1000",
    pointerEvents: "none",
    boxShadow: "0 18px 40px rgba(120, 90, 210, 0.35)",
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const anim = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1, borderRadius: "24px" },
      {
        transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 140}px) scale(0.6) rotate(-12deg)`,
        opacity: 1,
        offset: 0.5,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08) rotate(20deg)`, opacity: 0.3, borderRadius: "50%" },
    ],
    { duration: 850, easing: "cubic-bezier(.55,.05,.35,1)" },
  );

  return anim.finished.then(() => {
    ghost.remove();
    sparkleBurst(target, 10);
  });
}

const SPARKLE_COLORS = ["#a283f0", "#f8b59c", "#8fdcc4", "#f6a5c0", "#ffd36e"];

/** Sprays tiny stars and hearts out of an element (used for adds, wishlists, etc.). */
export function sparkleBurst(el: HTMLElement | null, count = 12, glyphs = ["✦", "✧", "♥"]) {
  if (!el || prefersReducedMotion()) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = glyphs[i % glyphs.length];
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 28 + Math.random() * 34;
    Object.assign(s.style, {
      position: "fixed",
      left: `${cx}px`,
      top: `${cy}px`,
      fontSize: `${10 + Math.random() * 10}px`,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      pointerEvents: "none",
      zIndex: "1001",
      lineHeight: "1",
    });
    document.body.appendChild(s);
    s.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.2)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(1) rotate(${Math.random() * 180}deg)`,
          opacity: 0,
        },
      ],
      { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2,.7,.3,1)" },
    ).finished.then(() => s.remove());
  }
}
