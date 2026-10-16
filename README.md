# Lumi Lobes ♥

A static, animated earring storefront built with **Next.js 16 (App Router) + React 19**, styled with plain CSS (global tokens + CSS Modules). No UI or animation libraries: every effect is CSS keyframes/transitions plus a little Web Animations API.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
npm start        # serve ./out locally
```

`next.config.ts` sets `output: "export"`, so `out/` is plain HTML/CSS/JS you can drop on any static host (Netlify, Vercel, GitHub Pages, S3…). The build pre-renders ~1,210 product pages plus 1,200 artwork files (about 110 MB in total).

`predev`/`prebuild` run `scripts/copy-mediapipe.mjs`, which copies the MediaPipe WebAssembly runtime from `node_modules` into `public/mediapipe/` (git-ignored) for the virtual try-on.

## Pages

| Route | What's there |
| --- | --- |
| `/` | Hero with drag-to-spin earring and floating orbs, featured cards, marquee, then: shop by style, new-arrivals carousel, try-on promo, bestsellers by mood (tabs), counting stats, review marquee, gift guide by price, perks, FAQ accordion, newsletter |
| `/shop/` | 1,209 earrings: search, 10 style chips, colour swatches, motif / mood / price filters, 5 sorts, infinite scroll, URL-synced filters (shareable links) |
| `/product/[slug]/` | Spin viewer (drag, arrow keys, zoom, fullscreen), metal finish (generated designs are redrawn in gold / silver / rose), quantity stepper, "Try on", related designs |
| `/try-on/` | Virtual try-on: live camera, uploaded photo or the sample model photo; earrings anchored to the ear lobes with swing physics; size + metal controls; snapshot download; add to cart |
| `/collections/` | Collection banners whose photo stacks fan out on hover; links deep-link into filtered shop |
| `/cart/` | Line items, gift box toggle, animated totals, empty state. Cart persists in `localStorage` |

## Catalog (1,210 products)

`lib/catalog.ts` generates 1,200 designs from a taxonomy based on common jewelry-guide classifications and current motif trends (`lib/design.ts`):

- **10 styles:** studs, huggies, hoops, drops, danglers, chandeliers, threaders, ear cuffs, climbers, clip-ons
- **18 motifs:** heart, star, moon, sun, blossom, daisy, butterfly, bow, cherry, seashell, starfish, pearl, teardrop, leaf, cluster, halo, hexagon, tassel
- **12 colourways** × **3 metals**

The generator uses a fixed seed, so the server build and the browser produce identical data. Each design is drawn by an original procedural SVG renderer (`lib/earringArt.ts`): pairs for cards (pre-rendered to `/art/<slug>.svg` by `app/art/[file]/route.ts`), and single earrings in any metal for the product viewer and try-on. The 10 hand-photographed originals keep their photos. Edit `CATALOG_SIZE` or the taxonomy to change the catalog.

## Virtual try-on

`lib/tryon.ts` loads Google's **MediaPipe Face Landmarker** (`@mediapipe/tasks-vision`). The face model (~3.6 MB) is fetched at runtime from Google's hosted model bucket; the WebAssembly runtime is served from `/mediapipe/wasm`. It uses the GPU when available and falls back to CPU. From the 478-point face mesh it estimates both ear lobes, head roll and which ear is turned away, then draws the earring on a canvas. A damped pendulum, driven by head movement, makes dangly styles swing. Everything runs in the browser: no image leaves the device. The camera needs HTTPS (or localhost).

The default **sample model** is a photo used with the model's permission (`public/try-on/model.jpg`), configured in `lib/sampleModels.ts` and shared by the try-on page and the homepage promo. Its ear lobes were measured once with the face model, so it appears instantly without downloading the model; in this three-quarter pose only the visible ear gets an earring. To use a different photo, replace the file, update `w`/`h`, and delete `ears`: the try-on will then detect the ears itself. If the photo fails to load, the original illustration (`public/try-on/sample-model.svg`) is used instead.

## Placeholder content

The review quotes, rating and review counts, and newsletter form are demo content. The newsletter has no backend: connect it to your email provider before launch.

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
lib/            products.ts + catalog.ts (catalog), design.ts (taxonomy), earringArt.ts (SVG renderer),
                tryon.ts (face tracking + earring physics), effects.ts (fly-to-cart, sparkle burst)
scripts/        copy-mediapipe.mjs
public/images/  product photos
```

Product photos for the 10 originals are cropped from the design mockups (`public/images/products/`). The try-on model photo (`public/try-on/model.jpg`) is used with permission; keep that permission on file. The fallback model is an original illustration (`public/try-on/sample-model.svg`).
