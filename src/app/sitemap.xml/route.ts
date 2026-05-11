import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAlternates(base: string, path: string) {
  return locales
    .map(
      (l) =>
        `      <xhtml:link rel="alternate" hreflang="${l === "ar" ? "ar-MA" : "en-US"}" href="${esc(`${base}/${l}${path}`)}" />`,
    )
    .join("\n");
}

function urlEntry({
  base,
  path,
  lastModified,
  changeFrequency,
  priority,
}: {
  base: string;
  path: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}) {
  const alternates = buildAlternates(base, path);
  return locales
    .map((l) =>
      [
        "  <url>",
        `    <loc>${esc(`${base}/${l}${path}`)}</loc>`,
        `    <lastmod>${lastModified.toISOString()}</lastmod>`,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        alternates,
        "  </url>",
      ].join("\n"),
    )
    .join("\n");
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
    urlEntry({ base, path: "", lastModified: now, changeFrequency: "daily", priority: 1 }),
    urlEntry({ base, path: "/shop", lastModified: now, changeFrequency: "daily", priority: 0.8 }),
    urlEntry({ base, path: "/collections", lastModified: now, changeFrequency: "weekly", priority: 0.8 }),
    urlEntry({ base, path: "/blog", lastModified: now, changeFrequency: "weekly", priority: 0.8 }),
    urlEntry({ base, path: "/about", lastModified: now, changeFrequency: "yearly", priority: 0.8 }),
    urlEntry({ base, path: "/contact", lastModified: now, changeFrequency: "yearly", priority: 0.8 }),
    ...products.map((p) =>
      urlEntry({
        base,
        path: `/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    ...categories.map((c) =>
      urlEntry({
        base,
        path: `/category/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...collections.map((c) =>
      urlEntry({
        base,
        path: `/collection/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...pages.map((p) =>
      urlEntry({
        base,
        path: `/pages/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ),
    ...posts.map((p) =>
      urlEntry({
        base,
        path: `/blog/${p.slug}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? now,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
