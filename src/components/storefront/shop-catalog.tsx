import Link from "next/link";
import { ProductImage } from "@/components/storefront/product-image";
import { Card, CardContent } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export async function ShopCatalog({
  query,
  title = "المتجر",
  subtitle = "جميع المنتجات النشطة — تصفّحي التشكيلة كاملة بأسعار شفافة بالدرهم.",
}: {
  query?: string;
  title?: string;
  subtitle?: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { sku: { contains: query } },
              { slug: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { categories: true },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-[#696969]">{subtitle}</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card
            key={p.id}
            className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
          >
            <Link href={`/product/${p.slug}`} className="block">
              <div className="relative aspect-square bg-[#fafafa]">
                <ProductImage src={pickProductImageUrl(p.images)} alt={p.name} fill className="object-cover" sizes="360px" />
              </div>
              <CardContent className="space-y-2 border-t border-[#f0f0f0] p-4">
                <div className="line-clamp-2 min-h-[48px] text-sm font-medium leading-snug text-black">{p.name}</div>
                <div className="text-xs text-[#696969]">{p.categories.map((c) => c.name).join(" · ")}</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-[#00BF0E]">{formatMad(p.price)}</div>
                  {p.compareAtPrice ? (
                    <div className="text-xs text-[#696969] line-through">{formatMad(p.compareAtPrice)}</div>
                  ) : null}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
