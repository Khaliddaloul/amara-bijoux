import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const iconsDir = path.join(publicDir, "icons");

fs.mkdirSync(iconsDir, { recursive: true });

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1512"/>
      <stop offset="45%" style="stop-color:#c9a24d"/>
      <stop offset="100%" style="stop-color:#0c0c0c"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="42%" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="52">أمارا للمجوهرات</text>
  <text x="50%" y="54%" text-anchor="middle" fill="#f8f4ea" font-family="Georgia, serif" font-size="26">مجوهرات مغربية فاخرة</text>
</svg>`;

const ogPath = path.join(publicDir, "og-default.jpg");
await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(ogPath);

const ogBuf = await sharp(ogPath).toBuffer();

await sharp(ogBuf).resize(192, 192).png().toFile(path.join(iconsDir, "icon-192.png"));
await sharp(ogBuf).resize(512, 512).png().toFile(path.join(iconsDir, "icon-512.png"));
await sharp(ogBuf).resize(180, 180).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
await sharp(ogBuf).resize(32, 32).png().toFile(path.join(publicDir, "favicon-32x32.png"));
await sharp(ogBuf).resize(16, 16).png().toFile(path.join(publicDir, "favicon-16x16.png"));

console.log("SEO assets OK:", ogPath);
