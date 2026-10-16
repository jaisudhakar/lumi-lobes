import type { NextConfig } from "next";

// Fully static export: `npm run build` writes plain HTML/CSS/JS to ./out
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
