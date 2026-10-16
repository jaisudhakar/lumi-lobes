import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Little sparkles, on their way to you.",
};

export default function CartPage() {
  return <CartClient />;
}
