import type { Metadata } from "next";
import TryOnClient from "./TryOnClient";

export const metadata: Metadata = {
  title: "Virtual Try-On",
  description: "Try on any Lumi Lobes earring live with your camera, a photo, or our sample model.",
};

export default function TryOnPage() {
  return <TryOnClient />;
}
