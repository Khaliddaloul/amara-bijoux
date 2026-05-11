import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductImage } from "@/components/storefront/product-image";
import { StoreBreadcrumb } from "@/components/storefront/store-breadcrumb";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent } from "@/components/ui/card";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { pickProductImageUrl } from "@/lib/images";
import { buildPageMetadata, getDynamicOgImageUrl } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/structured-data";
import { prisma } from "@/lib/prisma";
import { isLocale, type Locale } from "@/i18n/config";
import { pickLocalized, formatPrice } from "@/lib/i18n-helpers";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return { title: locale === "en" ? "Category" : "فئة" };
  const name = pickLocalized(category, "name", locale);
  const description = pickLocalized(category, "description", locale);
  const seoDesc = pickLocalized(category, "seoDescription", locale);
  const seoTitle = pickLocalized(category, "seoTitle", locale);
  const desc =
    seoDesc ||
    description ||
    (locale === "en"
      ? `Browse our ${name} collection — rings, necklaces and curated jewelry sets.`
      : `تصفّحي منتجات فئة ${name} في أمارا للمجوهرات.`);
  const kw = [...STORE_KEYWORDS, name, category.slug];

  const site = getSiteUrl();
  return {
    ...buildPageMetadata({
      title: seoTitle || name,
      description: desc,
      canonicalPath: `/${locale}/category/${category.slug}`,
      keywords: kw,
      ogImages: [
        {
          url: getDynamicOgImageUrl("category", category.id),
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    }),
    alternates: {
      canonical: `${site}/${locale}/category/${category.slug}`,
      languages: {
        "ar-MA": `${site}/ar/category/${category.slug}`,
        "en-US": `${site}/en/category/${category.slug}`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const tHeader = await getTranslations({ locale, namespace: "header" });
  const tProd = await getTranslations({ locale, namespace: "product" });

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!category) notFound();

  const categoryName = pickLocalized(category, "name", locale);
  const categoryDesc = pickLocalized(category, "description", locale);

  const otherCategories = await prisma.category.findMany({
    where: {
      id: { not: category.id },
      parentId: null,
    },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  const jsonLd = [
    collectionPageJsonLd(categoryName, categoryDesc, `/${locale}/category/${category.slug}`),
    breadcrumbJsonLd([
      { name: tHeader("home"), href: `/${locale}` },
      { name: categoryName, href: `/${locale}/category/${category.slug}` },
    ]),
  ];

  const breadcrumbItems = [
    { label: tHeader("home"), href: "/" },
    { label: categoryName },
  ];

  return (
    <StorefrontShell>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <StoreBreadcrumb items={breadcrumbItems} />

        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-black">{categoryName}</h1>
          {categoryDesc ? (
            <p className="mt-1 text-sm text-[#696969]">{categoryDesc}</p>
          ) : null}
        </header>

        <section
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={categoryName}
        >
          {category.products.map((p) => {
            const productName = pickLocalized(p, "name", locale);
            return (
              <Card
                key={p.id}
                className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
              >
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square bg-[#fafafa]">
                    <ProductImage
                      src={pickProductImageUrl(p.images)}
                      alt={productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
                    />
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <div className="line-clamp-2 min-h-[48px] text-sm font-medium leading-snug text-black">
                      {productName}
                    </div>
                    <div className="flex items-baseline gap-2" dir="ltr">
                      <div className="text-lg font-semibold text-[#00BF0E]">
                        {formatPrice(p.price, locale)}
                      </div>
                      {p.compareAtPrice ? (
                        <div className="text-xs text-[#696969] line-through">
                          {formatPrice(p.compareAtPrice, locale)}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </section>

        {otherCategories.length > 0 ? (
          <section
            className="border-t border-[#f0f0f0] pt-12"
            aria-labelledby="other-categories-heading"
          >
            <h2 id="other-categories-heading" className="text-xl font-semibold text-black">
              {tProd("relatedProducts")}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {otherCategories.map((c) => {
                const otherName = pickLocalized(c, "name", locale);
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="overflow-hidden rounded-xl border border-[#f0f0f0] bg-white transition hover:border-[#6a6a6a]"
                  >
                    <div className="relative aspect-[4/3] bg-[#fafafa]">
                      {c.image ? (
                        <ProductImage
                          src={c.image}
                          alt={otherName}
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#f3f3f3]" />
                      )}
                    </div>
                    <div className="p-4 text-center text-sm font-semibold text-black">
                      {otherName}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </StorefrontShell>
  );
}
