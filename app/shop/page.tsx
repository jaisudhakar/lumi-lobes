import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description: "Studs, hoops and danglers: browse every Lumi Lobes earring.",
};

export default function ShopPage() {
  return <ShopClient />;
}
