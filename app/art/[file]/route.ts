import { pairSvg } from "@/lib/earringArt";
import { getProduct, products } from "@/lib/products";

// Pre-renders every generated design's card artwork to a static /art/<slug>.svg
// file at build time, so listings reference small cacheable URLs instead of
// inlining the SVG into every page.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return products.filter((p) => !p.photo).map((p) => ({ file: `${p.slug}.svg` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const product = getProduct(file.replace(/\.svg$/, ""));
  if (!product) return new Response("Not found", { status: 404 });
  return new Response(pairSvg(product.design), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}
