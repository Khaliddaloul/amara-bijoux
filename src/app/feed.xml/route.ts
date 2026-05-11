import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = getSiteUrl();
  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { name: true, slug: true, shortDescription: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { title: true, slug: true, excerpt: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const items: string[] = [];
  for (const p of products) {
    const link = `${base}/product/${p.slug}`;
    const desc = p.shortDescription?.replace(/<[^>]+>/g, "") ?? p.name;
    items.push(
      `<item><title>${esc(p.name)}</title><link>${esc(link)}</link><description>${esc(desc)}</description><pubDate>${p.updatedAt.toUTCString()}</pubDate><guid>${esc(link)}</guid></item>`,
    );
  }
  for (const b of posts) {
    const link = `${base}/blog/${b.slug}`;
    const d = b.excerpt ?? b.title;
    const when = b.publishedAt ?? b.updatedAt;
    items.push(
      `<item><title>${esc(b.title)}</title><link>${esc(link)}</link><description>${esc(d)}</description><pubDate>${when.toUTCString()}</pubDate><guid>${esc(link)}</guid></item>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>أمارا للمجوهرات</title>
  <link>${esc(base)}</link>
  <description>آخر المنتجات والمقالات</description>
  <language>ar</language>
  ${items.join("\n  ")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
