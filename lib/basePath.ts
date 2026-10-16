// Sub-folder the site is served from, e.g. "/sites/lumi" (empty at a domain root).
// Set BASE_PATH when building; next.config.ts passes it through to the app.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a file in public/ with the sub-folder. Page links via next/link get it automatically. */
export const asset = (path: string) => `${BASE_PATH}${path}`;
