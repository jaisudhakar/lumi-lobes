// Copies the MediaPipe Tasks Vision WebAssembly runtime into public/ so the
// virtual try-on can load it from our own origin. The face model itself is
// fetched from Google's hosted model bucket at runtime.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const dest = join(root, "public/mediapipe/wasm");

if (!existsSync(src)) {
  console.warn("[copy-mediapipe] @mediapipe/tasks-vision not installed, skipping");
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const f of ["vision_wasm_internal.js", "vision_wasm_internal.wasm", "vision_wasm_nosimd_internal.js", "vision_wasm_nosimd_internal.wasm"]) {
  cpSync(join(src, f), join(dest, f));
}
console.log("[copy-mediapipe] wasm runtime copied to public/mediapipe/wasm");
