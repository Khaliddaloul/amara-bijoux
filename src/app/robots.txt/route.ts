import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export function GET() {
  const base = getSiteUrl();
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /api",
    "Disallow: /cart",
    "Disallow: /cart/",
    "Disallow: /checkout",
    "Disallow: /checkout/",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
