import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { STORE_DEFAULT_DESCRIPTION, STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "المتجر | جميع المنتجات",
    applyTitleTemplate: false,
    description:
      "تصفّحي جميع منتجات أمارا النشطة: خواتم، قلائد، أساور، أقراط وأطكم بأسعار بالدرهم المغربي والتوصيل داخل المملكة.",
    canonicalPath: "/shop",
    keywords: [...STORE_KEYWORDS, "المتجر", "جميع المنتجات"],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "أمارا للمجوهرات — المتجر" }],
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  return (
    <StorefrontShell>
      <ShopCatalog
        query={q}
        title="المتجر"
        subtitle={STORE_DEFAULT_DESCRIPTION}
      />
    </StorefrontShell>
  );
}
