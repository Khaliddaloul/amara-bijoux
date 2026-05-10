import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/store/add-to-cart";
import { Button } from "@/components/ui/button";
import { formatMad } from "@/lib/format";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { categories: true, variants: true },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  const images = parseJson<Array<{ url: string; alt?: string }>>(product.images, []);

  const related = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: product.id },
      categories: { some: { id: { in: product.categories.map((c) => c.id) } } },
    },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={
                images[0]?.url ??
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80"
              }
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="600px"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((im, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-md border">
                <Image src={im.url} alt={im.alt ?? product.name} fill className="object-cover" sizes="120px" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            {product.categories.map((c) => c.name).join(" · ")}
          </div>
          <h1 className="font-display text-3xl leading-snug">{product.name}</h1>
          {product.shortDescription ? (
            <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-primary">{formatMad(product.price)}</div>
            {product.compareAtPrice ? (
              <div className="text-sm text-muted-foreground line-through">
                {formatMad(product.compareAtPrice)}
              </div>
            ) : null}
          </div>
          <AddToCart
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image:
                images[0]?.url ??
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80",
            }}
          />
          <div className="prose prose-sm max-w-none pt-4" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">منتجات ذات صلة</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/shop">كل المنتجات</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => {
            const imgs = parseJson<Array<{ url: string }>>(p.images, []);
            const img = imgs[0]?.url;
            return (
              <Link key={p.id} href={`/product/${p.slug}`} className="rounded-xl border bg-white p-3 shadow-card">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={
                      img ??
                      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80"
                    }
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
                <div className="line-clamp-2 text-sm font-semibold">{p.name}</div>
                <div className="mt-2 font-bold text-primary">{formatMad(p.price)}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
