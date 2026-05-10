import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ShopCatalog } from "@/components/storefront/shop-catalog";

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
