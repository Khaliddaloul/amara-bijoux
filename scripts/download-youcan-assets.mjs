/**
 * Downloads hero banners + product images from the reference YouCan CDN.
 * Run from repo root: node scripts/download-youcan-assets.mjs
 * Requires Node 18+ (global fetch).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const STORE_BASE = "https://cdn.youcan.shop/stores/08048ecff2ab3e0474a35df9f9b7c9a9";
const REFERER = "https://amarabijouxx.youcan.store";

async function download(relUrl, outRelative) {
  const url = `${STORE_BASE}${relUrl}`;
  const outPath = path.join(ROOT, outRelative);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: REFERER,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) {
    throw new Error(`Suspiciously small file (${buf.length}b) for ${url}`);
  }
  fs.writeFileSync(outPath, buf);
  console.log(`saved ${outRelative} (${buf.length} bytes)`);
}

const jobs = [
  ["/others/aBAjPKNOjKfdcQqztpwFUsOH8CnPN3FhE5eytLzr.jpg", "public/banners/hero-1.jpg"],
  ["/others/xDTnLmLc0A9NN0AE1xSt4GlGBKnlU7TDdgfO38ZU.jpg", "public/banners/hero-2.jpg"],
  ["/products/j92W6lx5MOzCWVKKINYYuHOyXgNvqVfin8xLhLOB_md.jpg", "public/products/tricolor-textured-bangle-ring-set/01.jpg"],
  ["/products/QjLl69KCu8bXZukzScfdsvnmrucO3QmTdjXGaBMM_md.jpg", "public/products/triple-layer-sparkle-set/01.jpg"],
  ["/products/fv6TdjsBxiMpnjOdGp9ppqS8EA18sP9ggFtgeSH6_md.jpg", "public/products/elegant-butterfly-bangle-ring-set/01.jpg"],
  ["/products/gvPmqlloEcY1KC0xDdN3lkWLbknDjZ8V3RuotUFZ_md.jpg", "public/products/queen-luxury-waterdrop-crystal-set/01.jpg"],
  ["/products/Ly1E48lfx28uVrL6VuxVo4cMD2OZNNR8jVEiqkPI_md.jpg", "public/products/colorful-tree-leaf-design-set/01.jpg"],
  ["/products/hO44QkyesEGA007Xp8XmEknGUpJlr4eQSrv1NGyX_md.jpg", "public/products/classy-black-stone-set/01.jpg"],
  ["/products/Okh6ePxlvEQlysbtK5YtOJ6ptL9kNxUWSma9Pxcy.jpg", "public/products/elegant-butterfly-bangle-ring-set/02.jpg"],
  ["/others/4HtQ6lTkZpKdv7Uw11W7RWs1q7vY2hjH4O5eKWTm.png", "public/logo.png"],
  ["/others/H8o0DCwGsvCQyvHak4tZO0hA9y2Jov5eNCVtfBg9.png", "public/favicon-source.png"],
];

async function main() {
  for (const [rel, dest] of jobs) {
    await download(rel, dest);
  }
  console.log("✅ All YouCan assets downloaded.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
