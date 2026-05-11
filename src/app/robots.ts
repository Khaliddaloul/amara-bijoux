import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/api", "/cart", "/cart/", "/checkout", "/checkout/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
