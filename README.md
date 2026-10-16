# Lumi Lobes ♥

A static, animated earring storefront built with **Next.js 16 (App Router) + React 19**, styled with plain CSS (global tokens + CSS Modules). No UI or animation libraries: every effect is CSS keyframes/transitions plus a little Web Animations API.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
npm start        # serve ./out locally
```

`next.config.ts` sets `output: "export"`, so `out/` is plain HTML/CSS/JS you can drop on any static host (Netlify, Vercel, GitHub Pages, S3…).

## Pages

| Route | What's there |
| --- | --- |
| `/` | Hero with word-by-word headline, drag-to-spin pearl earring, orbit ring, floating orbs with mouse parallax, featured cards, marquee, perks |
| `/shop/` | Filter chips with a sliding pill, sort dropdown, staggered product grid, wishlist hearts, quick add-to-bag |
| `/product/[slug]/` | Spin viewer (drag, arrow keys, zoom, fullscreen), metal finish preview (gold / silver / rose), quantity stepper, "You'll also love" |
| `/collections/` | Collection banners whose photo stacks fan out on hover; links deep-link into filtered shop |
| `/cart/` | Line items, gift box toggle, animated totals, empty state. Cart persists in `localStorage` |

## Product animations

- **Fly to cart**: the product photo arcs into the header bag, which bumps and bursts sparkles (`lib/effects.ts`)
- **Spinning earring**: drag with inertia, settles to face front, idle pendulum sway, moving glint (`components/EarringSpinner.tsx`)
- **Swing on hover**: earrings swing from their hook on product cards
- **Metal finish**: photo re-tints with a light-wipe when you change finish
- **Wishlist pop**: heart pops with a burst of hearts and stars
- **Rolling numbers**: quantity steppers roll up/down; prices count up/down
- **Remove**: cart rows slide out and collapse
- **Scroll reveal**: cards fade and lift in as they enter the viewport

All motion respects `prefers-reduced-motion`.

## Structure

```
app/            routes, page CSS modules, globals.css (tokens + keyframes)
components/     Header, CartProvider, EarringSpinner, FloatingOrbs, ProductCards, ...
lib/            products.ts (catalog), effects.ts (fly-to-cart, sparkle burst)
public/images/  product photos
```

Product photos are cropped from the design mockups. Swap the files in `public/images/products/` and edit `lib/products.ts` to change the catalog.
