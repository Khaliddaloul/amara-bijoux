import { parseJson } from "@/lib/json";

/** Guaranteed on-disk placeholder — copy of bundled jewelry thumb (`public/products/_fallback.jpg`). */
export const FALLBACK_PRODUCT_IMAGE = "/products/_fallback.jpg";

/** First product image URL from Prisma JSON `images` field, or fallback. */
export function pickProductImageUrl(raw: string): string {
  const imgs = parseJson<Array<{ url: string }>>(raw, []);
  const u = imgs[0]?.url;
  if (!u || typeof u !== "string") return FALLBACK_PRODUCT_IMAGE;
  return u;
}
