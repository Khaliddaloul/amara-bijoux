import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export function GET() {
  const base = getSiteUrl();
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /ar/admin",
    "Disallow: /ar/admin/",
    "Disallow: /en/admin",
    "Disallow: /en/admin/",
    "Disallow: /api/",
    "Disallow: /api",
    "Disallow: /ar/cart",
    "Disallow: /ar/cart/",
    "Disallow: /en/cart",
    "Disallow: /en/cart/",
    "Disallow: /ar/checkout",
    "Disallow: /ar/checkout/",
    "Disallow: /en/checkout",
    "Disallow: /en/checkout/",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
