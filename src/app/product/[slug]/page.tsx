import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/store/add-to-cart";
import { ProductImage } from "@/components/storefront/product-image";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";
import { formatMad } from "@/lib/format";
import { FALLBACK_PRODUCT_IMAGE, pickProductImageUrl } from "@/lib/images";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { categories: true, variants: true },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  const images = parseJson<Array<{ url: string; alt?: string }>>(product.images, []);
  const mainSrc = pickProductImageUrl(product.images);

  const related = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: product.id },
      categories: { some: { id: { in: product.categories.map((c) => c.id) } } },
    },
    take: 4,
  });

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#fafafa]">
              <ProductImage src={mainSrc} alt={product.name} fill className="object-cover" priority sizes="600px" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(images.length ? images : [{ url: mainSrc }]).slice(0, 4).map((im, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-md border border-[#f0f0f0]">
                  <ProductImage
                    src={im.url ?? FALLBACK_PRODUCT_IMAGE}
                    alt={im.alt ?? product.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-xs text-[#696969]">{product.categories.map((c) => c.name).join(" · ")}</div>
            <h1 className="text-3xl font-semibold leading-snug text-black">{product.name}</h1>
            {product.shortDescription ? (
              <p className="text-sm text-[#4d4d4d]">{product.shortDescription}</p>
            ) : null}
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-[#00BF0E]">{formatMad(product.price)}</div>
              {product.compareAtPrice ? (
                <div className="text-sm text-[#696969] line-through">{formatMad(product.compareAtPrice)}</div>
              ) : null}
            </div>
            <AddToCart
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: mainSrc,
              }}
            />
            <div
              className="prose prose-sm max-w-none border-t border-[#f0f0f0] pt-6 prose-headings:text-black prose-p:text-[#4d4d4d]"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-[#f0f0f0] pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">منتجات ذات صلة</h2>
            <Button asChild variant="outline" size="sm" className="border-black text-black hover:bg-black hover:text-white">
              <Link href="/collections">كل المنتجات</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => {
              const img = pickProductImageUrl(p.images);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="rounded-xl border border-[#f0f0f0] bg-white p-3 transition hover:border-[#6a6a6a]"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-[#fafafa]">
                    <ProductImage src={img} alt={p.name} fill className="object-cover" sizes="240px" />
                  </div>
                  <div className="line-clamp-2 text-sm font-medium text-black">{p.name}</div>
                  <div className="mt-2 font-semibold text-[#00BF0E]">{formatMad(p.price)}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
