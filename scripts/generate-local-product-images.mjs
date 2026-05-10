/**
 * Generates on-brand static product/hero images under public/products/
 * (no external CDNs; works offline and never 403s in next/image).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "products");
fs.mkdirSync(outDir, { recursive: true });

const gradients = [
  { a: "#f6f0e6", b: "#d4af37" },
  { a: "#faf7f2", b: "#c9a227" },
  { a: "#f3ece4", b: "#b8860b" },
  { a: "#efe8df", b: "#9c7c38" },
  { a: "#f2f4f6", b: "#c0c0c0" },
  { a: "#eceef1", b: "#9aa3ad" },
  { a: "#fdf4f0", b: "#e8b4b8" },
  { a: "#fef6f8", b: "#d9a6b3" },
  { a: "#f7f2fb", b: "#c7b8dc" },
  { a: "#eef6f4", b: "#9fb8ad" },
  { a: "#f7f3ea", b: "#cba368" },
  { a: "#fffaf3", b: "#e3c77d" },
  { a: "#f4efe8", b: "#a67c52" },
  { a: "#fbfcfd", b: "#cfd6dd" },
  { a: "#fdfcfa", b: "#dccfb8" },
  { a: "#f8f2ec", b: "#cd9c72" },
  { a: "#f3efe9", b: "#b08d57" },
  { a: "#fefeff", b: "#dfe6ee" },
  { a: "#faf6f1", b: "#e6d5c3" },
  { a: "#f6f1ea", b: "#cbb79f" },
  { a: "#f5f4f2", b: "#aeb4bc" },
  { a: "#fff9f5", b: "#f0d6c5" },
  { a: "#f4f1fb", b: "#b9a8d9" },
  { a: "#f9f7f2", b: "#d7c6a4" },
];

function svgGradient(id, c1, c2) {
  return `<svg width="900" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g${id}" x1="8%" y1="10%" x2="92%" y2="90%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="v${id}" cx="30%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="900" fill="url(#g${id})"/>
  <rect width="900" height="900" fill="url(#v${id})"/>
</svg>`;
}

async function writeJpeg(name, svg) {
  const buf = Buffer.from(svg);
  await sharp(buf).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(outDir, name));
}

for (let i = 0; i < gradients.length; i++) {
  const { a, b } = gradients[i];
  const svg = svgGradient(i, a, b);
  const file = `jewelry-${String(i + 1).padStart(2, "0")}.jpg`;
  await writeJpeg(file, svg);
  process.stdout.write(`wrote ${file}\n`);
}

// Hero banner (taller crop feel via horizontal gradient)
const heroSvg = `<svg width="1200" height="1500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hg" x1="0%" y1="40%" x2="100%" y2="60%">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="45%" stop-color="#2d2419"/>
      <stop offset="100%" stop-color="#5c4a2e"/>
    </linearGradient>
    <radialGradient id="hv" cx="70%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#f5e6c8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#hg)"/>
  <rect width="1200" height="1500" fill="url(#hv)"/>
</svg>`;

await writeJpeg("hero-banner.jpg", heroSvg);
process.stdout.write("wrote hero-banner.jpg\n");
