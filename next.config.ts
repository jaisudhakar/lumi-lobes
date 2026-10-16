import type { NextConfig } from "next";

// Serve from a sub-folder by building with BASE_PATH, e.g. BASE_PATH=/sites/lumi npm run build
const basePath = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");

// Fully static export: `npm run build` writes plain HTML/CSS/JS to ./out
const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
