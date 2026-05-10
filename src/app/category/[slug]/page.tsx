import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/storefront/product-image";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!category) notFound();

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">{category.name}</h1>
          <p className="mt-1 text-sm text-[#696969]">{category.description}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((p) => (
            <Card
              key={p.id}
              className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
            >
              <Link href={`/product/${p.slug}`} className="block">
                <div className="relative aspect-square bg-[#fafafa]">
                  <ProductImage src={pickProductImageUrl(p.images)} alt={p.name} fill className="object-cover" sizes="360px" />
                </div>
                <CardContent className="space-y-2 p-4">
                  <div className="line-clamp-2 min-h-[48px] text-sm font-medium text-black">{p.name}</div>
                  <div className="flex items-baseline gap-2">
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
    </StorefrontShell>
  );
}
