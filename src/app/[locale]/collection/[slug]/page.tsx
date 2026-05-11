import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductImage } from "@/components/storefront/product-image";
import { Card, CardContent } from "@/components/ui/card";
import {
  matchesAutomaticCollection,
  parseCollectionConditions,
} from "@/lib/collection-conditions";
import { formatMoney } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { getStorePublicSettings } from "@/lib/store-settings";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const col = await prisma.collection.findUnique({ where: { slug: params.slug } });
  if (!col) return { title: "مجموعة" };
  const base = getSiteUrl();
  return {
    title: col.name,
    description: col.description ?? col.name,
    alternates: { canonical: `/collection/${col.slug}` },
    openGraph: {
      title: col.name,
      description: col.description ?? undefined,
      url: `${base}/collection/${col.slug}`,
      locale: "ar_MA",
      type: "website",
    },
  };
}

export default async function CollectionPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const collection = await prisma.collection.findUnique({
    where: { slug: params.slug },
    include: { products: { where: { status: "ACTIVE" } } },
  });
  if (!collection) notFound();

  const { general } = await getStorePublicSettings();
  const currency = general.currency;

  let products = collection.products;

  if (collection.type === "AUTOMATIC") {
    const all = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { categories: { select: { slug: true, name: true } } },
    });
    const store = parseCollectionConditions(collection.conditions);
    products = all.filter((p) =>
      matchesAutomaticCollection(
        {
          name: p.name,
          price: p.price,
          vendor: p.vendor,
          tags: p.tags,
          categories: p.categories,
        },
        store,
      ),
    );
  }

  const jsonLd = [
    organizationJsonLd({}),
    collectionPageJsonLd(
      collection.name,
      collection.description,
      `/collection/${collection.slug}`,
    ),
    breadcrumbJsonLd([
      { name: "الرئيسية", href: "/" },
      { name: "المجموعات", href: "/collections" },
      { name: collection.name, href: `/collection/${collection.slug}` },
    ]),
  ];

  return (
    <StorefrontShell>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <header>
          <h1 className="text-3xl font-semibold text-black">{collection.name}</h1>
          {collection.description ? (
            <p className="mt-2 text-[#696969]">{collection.description}</p>
          ) : null}
        </header>
        {products.length === 0 ? (
          <p className="text-sm text-[#696969]">لا توجد منتجات في هذه المجموعة بعد.</p>
        ) : (
          <section
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="منتجات المجموعة"
          >
            {products.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden border border-[#f0f0f0] shadow-none"
              >
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square bg-[#fafafa]">
                    <ProductImage
                      src={pickProductImageUrl(p.images)}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="360px"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="line-clamp-2 text-sm font-medium text-black">
                      {p.name}
                    </div>
                    <div className="mt-2 font-semibold text-[#00BF0E]">
                      {formatMoney(p.price, currency)}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </section>
        )}
      </div>
    </StorefrontShell>
  );
}
