import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "المجموعات",
    description: "اكتشفي تشكيلات أمارا المصنّفة والمنتجات المختارة ضمن مجموعات متناسقة.",
    canonicalPath: "/collections",
    keywords: [...STORE_KEYWORDS, "مجموعات", "تشكيلات"],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "مجموعات أمارا للمجوهرات" }],
  });
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  return (
    <StorefrontShell>
      <ShopCatalog query={q} />
    </StorefrontShell>
  );
}
