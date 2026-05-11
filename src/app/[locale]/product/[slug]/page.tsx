import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AddToCart } from "@/components/store/add-to-cart";
import { ProductReviewForm } from "@/components/storefront/product-review-form";
import { ProductImage } from "@/components/storefront/product-image";
import { StoreBreadcrumb } from "@/components/storefront/store-breadcrumb";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { FALLBACK_PRODUCT_IMAGE, pickProductImageUrl } from "@/lib/images";
import { parseJson } from "@/lib/json";
import { buildPageMetadata, getDynamicOgImageUrl } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structured-data";
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
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { categories: { take: 2 } },
  });
  if (!product || product.status !== "ACTIVE") {
    return { title: locale === "en" ? "Product" : "منتج" };
  }
  const name = pickLocalized(product, "name", locale);
  const shortDesc = pickLocalized(product, "shortDescription", locale);
  const desc = pickLocalized(product, "description", locale);
  const seoDescField = pickLocalized(product, "seoDescription", locale);

  const plainDesc =
    shortDesc?.replace(/<[^>]+>/g, "").slice(0, 120) ||
    seoDescField?.slice(0, 160) ||
    name;
  const catLabel =
    product.categories.map((c) => pickLocalized(c, "name", locale)).join(locale === "en" ? ", " : "، ") ||
    (locale === "en" ? "Jewelry" : "مجوهرات");
  const richDesc = `${name} — ${formatPrice(product.price, locale)} — ${catLabel}. ${plainDesc}`;
  const kw = [
    ...STORE_KEYWORDS,
    ...parseJson<string[]>(product.tags, []),
    name,
    catLabel,
  ].slice(0, 24);

  const site = getSiteUrl();
  return {
    ...buildPageMetadata({
      title: pickLocalized(product, "seoTitle", locale) || name,
      description: richDesc.slice(0, 320),
      canonicalPath: `/${locale}/product/${product.slug}`,
      keywords: kw,
      ogImages: [
        {
          url: getDynamicOgImageUrl("product", product.id),
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    }),
    alternates: {
      canonical: `${site}/${locale}/product/${product.slug}`,
      languages: {
        "ar-MA": `${site}/ar/product/${product.slug}`,
        "en-US": `${site}/en/product/${product.slug}`,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const tProd = await getTranslations({ locale, namespace: "product" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tHeader = await getTranslations({ locale, namespace: "header" });

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { categories: true, variants: true },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  const productName = pickLocalized(product, "name", locale);
  const productDesc = pickLocalized(product, "description", locale);
  const productShortDesc = pickLocalized(product, "shortDescription", locale);

  const images = parseJson<Array<{ url: string; alt?: string }>>(product.images, []);
  const mainSrc = pickProductImageUrl(product.images);
  const imgUrls = images.map((i) => i.url).filter(Boolean);

  const [related, reviews, productCollections] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: product.id },
        categories: { some: { id: { in: product.categories.map((c) => c.id) } } },
      },
      take: 4,
    }),
    prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { customer: true },
    }),
    prisma.collection.findMany({
      where: { products: { some: { id: product.id } } },
      take: 3,
    }),
  ]);

  const ratingAgg =
    reviews.length > 0
      ? {
          average:
            Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10,
          count: reviews.length,
        }
      : undefined;

  const jsonLd = [
    productJsonLd(
      {
        name: productName,
        slug: product.slug,
        shortDescription: productShortDesc,
        description: productDesc,
        sku: product.sku,
        quantity: product.quantity,
        price: product.price,
        vendor: product.vendor,
      },
      imgUrls,
      ratingAgg,
    ),
    breadcrumbJsonLd([
      { name: tHeader("home"), href: `/${locale}` },
      ...(product.categories[0]
        ? [
            {
              name: pickLocalized(product.categories[0], "name", locale),
              href: `/${locale}/category/${product.categories[0].slug}`,
            },
          ]
        : []),
      { name: productName, href: `/${locale}/product/${product.slug}` },
    ]),
  ];

  const primaryCat = product.categories[0];

  const breadcrumbItems = [
    { label: tHeader("home"), href: "/" },
    ...(primaryCat
      ? [
          {
            label: pickLocalized(primaryCat, "name", locale),
            href: `/category/${primaryCat.slug}`,
          },
        ]
      : []),
    { label: productName },
  ];

  return (
    <StorefrontShell>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <StoreBreadcrumb items={breadcrumbItems} />

        <article className="grid gap-10 md:grid-cols-2" itemScope itemType="https://schema.org/Product">
          <meta itemProp="sku" content={product.sku ?? ""} />
          <meta itemProp="name" content={productName} />
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#fafafa]">
              <ProductImage
                src={mainSrc}
                alt={productName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(images.length ? images : [{ url: mainSrc }]).slice(0, 4).map((im, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-md border border-[#f0f0f0]"
                >
                  <ProductImage
                    src={im.url ?? FALLBACK_PRODUCT_IMAGE}
                    alt={im.alt ?? `${productName} — ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 120px"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-[#696969]">
              {product.categories.map((c) => pickLocalized(c, "name", locale)).join(" · ")}
            </p>
            <h1 className="text-3xl font-semibold leading-snug text-black">{productName}</h1>
            {productShortDesc ? (
              <p className="text-sm text-[#4d4d4d]" itemProp="description">
                {productShortDesc.replace(/<[^>]+>/g, "")}
              </p>
            ) : null}
            <div
              className="flex items-baseline gap-3"
              dir="ltr"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="MAD" />
              <meta itemProp="price" content={String(product.price)} />
              <link
                itemProp="availability"
                href={
                  product.quantity > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock"
                }
              />
              <div className="text-3xl font-bold text-[#00BF0E]">
                {formatPrice(product.price, locale)}
              </div>
              {product.compareAtPrice ? (
                <div className="text-sm text-[#696969] line-through">
                  {formatPrice(product.compareAtPrice, locale)}
                </div>
              ) : null}
            </div>
            <AddToCart
              product={{
                id: product.id,
                name: productName,
                price: product.price,
                image: mainSrc,
              }}
            />
            <section
              className="prose prose-sm max-w-none border-t border-[#f0f0f0] pt-6 prose-headings:text-black prose-p:text-[#4d4d4d]"
              dangerouslySetInnerHTML={{ __html: productDesc }}
            />
          </div>
        </article>

        {productCollections.length > 0 ? (
          <section
            className="rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-6"
            aria-label={tProd("relatedProducts")}
          >
            <h2 className="text-lg font-semibold text-black">{tProd("relatedProducts")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {productCollections.map((col) => (
                <li key={col.id}>
                  <Link
                    href={`/collection/${col.slug}`}
                    className="font-medium text-black underline-offset-4 hover:underline"
                  >
                    {pickLocalized(col, "name", locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {primaryCat ? (
          <section className="text-center">
            <Button
              asChild
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              <Link href={`/category/${primaryCat.slug}`}>
                {pickLocalized(primaryCat, "name", locale)}
              </Link>
            </Button>
          </section>
        ) : null}

        <section className="border-t border-[#f0f0f0] pt-10" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="text-xl font-semibold text-black">
            {tProd("reviews")}
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-[#696969]">{tProd("noReviews")}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-[#f0f0f0] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-black">
                    {"★".repeat(r.rating)}
                    <span className="text-xs font-normal text-[#696969]">
                      {r.guestName ??
                        ([r.customer?.firstName, r.customer?.lastName]
                          .filter(Boolean)
                          .join(" ") || tCommon("name"))}
                    </span>
                  </div>
                  {r.title ? <div className="mt-1 font-medium">{r.title}</div> : null}
                  <p className="mt-2 text-sm text-[#4d4d4d]">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            <ProductReviewForm productId={product.id} />
          </div>
        </section>

        <section className="space-y-4 border-t border-[#f0f0f0] pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-black">{tProd("relatedProducts")}</h2>
            <div className="flex flex-wrap gap-2">
              {primaryCat ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  <Link href={`/category/${primaryCat.slug}`}>
                    {pickLocalized(primaryCat, "name", locale)}
                  </Link>
                </Button>
              ) : null}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                <Link href="/shop">{tHeader("shop")}</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => {
              const img = pickProductImageUrl(p.images);
              const relatedName = pickLocalized(p, "name", locale);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="rounded-xl border border-[#f0f0f0] bg-white p-3 transition hover:border-[#6a6a6a]"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-[#fafafa]">
                    <ProductImage
                      src={img}
                      alt={relatedName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="line-clamp-2 text-sm font-medium text-black">{relatedName}</div>
                  <div className="mt-2 font-semibold text-[#00BF0E]" dir="ltr">
                    {formatPrice(p.price, locale)}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </StorefrontShell>
  );
}
