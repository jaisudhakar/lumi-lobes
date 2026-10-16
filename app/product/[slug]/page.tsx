import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/products";
import ProductClient from "./ProductClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  if (!getProduct(slug)) notFound();
  // The catalog is generated deterministically, so the client can look the product up itself
  // instead of serialising it (and its artwork) into the page payload.
  return <ProductClient slug={slug} />;
}
