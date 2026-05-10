/**
 * Saves HTML snapshots from the reference YouCan storefront for offline diffing.
 * Usage: node scripts/fetch-reference-html.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "reference", "html");

const URLS = [
  ["home", "https://amarabijouxx.youcan.store/"],
  ["collections", "https://amarabijouxx.youcan.store/collections"],
  ["rings", "https://amarabijouxx.youcan.store/collections/rings"],
  ["necklaces", "https://amarabijouxx.youcan.store/collections/necklaces"],
  ["bracelets", "https://amarabijouxx.youcan.store/collections/bangles"],
  ["earrings", "https://amarabijouxx.youcan.store/collections/earrings"],
  ["sets", "https://amarabijouxx.youcan.store/collections/sets"],
  ["about", "https://amarabijouxx.youcan.store/pages/about-us"],
  ["contact", "https://amarabijouxx.youcan.store/pages/contact-us"],
];

async function fetchPage(name, url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
      Referer: "https://amarabijouxx.youcan.store/",
    },
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const html = await res.text();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${name}.html`), html, "utf8");
  console.log(`saved reference/html/${name}.html (${html.length} chars)`);
}

async function main() {
  for (const [name, url] of URLS) {
    try {
      await fetchPage(name, url);
    } catch (e) {
      console.warn(`skip ${name}:`, e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
