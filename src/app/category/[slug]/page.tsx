import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductImage } from "@/components/storefront/product-image";
import { StoreBreadcrumb } from "@/components/storefront/store-breadcrumb";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent } from "@/components/ui/card";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";
import { buildPageMetadata, getDynamicOgImageUrl } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/structured-data";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return { title: "فئة" };
  const desc =
    category.seoDescription ??
    category.description ??
    `تصفّحي منتجات فئة ${category.name} في أمارا للمجوهرات — خواتم، قلائد وأطقم مختارة بعناية بالدرهم المغربي.`;
  const kw = [
    ...STORE_KEYWORDS,
    category.name,
    category.slug,
    "فئة",
    "مجوهرات",
  ];

  return buildPageMetadata({
    title: category.seoTitle ?? category.name,
    description: desc,
    canonicalPath: `/category/${category.slug}`,
    keywords: kw,
    ogImages: [
      {
        url: getDynamicOgImageUrl("category", category.id),
        width: 1200,
        height: 630,
        alt: category.name,
      },
    ],
  });
}

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

  const otherCategories = await prisma.category.findMany({
    where: {
      id: { not: category.id },
      parentId: null,
    },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  const jsonLd = [
    collectionPageJsonLd(category.name, category.description, `/category/${category.slug}`),
    breadcrumbJsonLd([
      { name: "الرئيسية", href: "/" },
      { name: category.name, href: `/category/${category.slug}` },
    ]),
  ];

  const breadcrumbItems = [{ label: "الرئيسية", href: "/" }, { label: category.name }];

  return (
    <StorefrontShell>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <StoreBreadcrumb items={breadcrumbItems} />

        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-black">{category.name}</h1>
          <p className="mt-1 text-sm text-[#696969]">{category.description}</p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label={`منتجات ${category.name}`}>
          {category.products.map((p) => (
            <Card
              key={p.id}
              className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
            >
              <Link href={`/product/${p.slug}`} className="block">
                <div className="relative aspect-square bg-[#fafafa]">
                  <ProductImage
                    src={pickProductImageUrl(p.images)}
                    alt={`${p.name} — فئة ${category.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
                  />
                </div>
                <CardContent className="space-y-2 p-4">
                  <div className="line-clamp-2 min-h-[48px] text-sm font-medium leading-snug text-black">{p.name}</div>
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
        </section>

        {otherCategories.length > 0 ? (
          <section className="border-t border-[#f0f0f0] pt-12" aria-labelledby="other-categories-heading">
            <h2 id="other-categories-heading" className="text-xl font-semibold text-black">
              فئات أخرى قد تعجبك
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {otherCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="overflow-hidden rounded-xl border border-[#f0f0f0] bg-white transition hover:border-[#6a6a6a]"
                >
                  <div className="relative aspect-[4/3] bg-[#fafafa]">
                    {c.image ? (
                      <ProductImage src={c.image} alt={`فئة ${c.name}`} fill className="object-cover" sizes="33vw" />
                    ) : (
                      <div className="h-full w-full bg-[#f3f3f3]" />
                    )}
                  </div>
                  <div className="p-4 text-center text-sm font-semibold text-black">{c.name}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </StorefrontShell>
  );
}
