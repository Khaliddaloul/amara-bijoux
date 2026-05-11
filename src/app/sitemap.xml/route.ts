import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlEntry({
  url,
  lastModified,
  changeFrequency,
  priority,
}: {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}) {
  return [
    "  <url>",
    `    <loc>${esc(url)}</loc>`,
    `    <lastmod>${lastModified.toISOString()}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export async function GET() {
  const base = getSiteUrl();
  const now = new Date();

  const [products, categories, collections, pages, posts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.collection.findMany({ select: { slug: true } }),
    prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
  ]);

  const entries = [
    urlEntry({ url: base, lastModified: now, changeFrequency: "daily", priority: 1 }),
    urlEntry({ url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.8 }),
    urlEntry({ url: `${base}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.8 }),
    urlEntry({ url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 }),
    urlEntry({ url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.8 }),
    urlEntry({ url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 }),
    ...products.map((p) =>
      urlEntry({
        url: `${base}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    ...categories.map((c) =>
      urlEntry({
        url: `${base}/category/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...collections.map((c) =>
      urlEntry({
        url: `${base}/collection/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...pages.map((p) =>
      urlEntry({
        url: `${base}/pages/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ),
    ...posts.map((p) =>
      urlEntry({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? now,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
