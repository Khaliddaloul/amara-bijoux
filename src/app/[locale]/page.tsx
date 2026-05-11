import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductImage } from "@/components/storefront/product-image";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pickProductImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { ProductSpotlightForm } from "@/components/storefront/product-spotlight-form";
import { isLocale, type Locale } from "@/i18n/config";
import { pickLocalized, formatPrice } from "@/lib/i18n-helpers";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tProduct = await getTranslations({ locale, namespace: "product" });

  const [featured, categories, spotlight, promos] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.product.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      skip: 2,
    }),
  ]);

  const spotlightName = spotlight ? pickLocalized(spotlight, "name", locale) : "";
  const spotlightDesc = spotlight
    ? pickLocalized(spotlight, "shortDescription", locale)
    : "";

  return (
    <StorefrontShell>
      {/* Hero — full-width banners like reference (static two-panel) */}
      <section className="border-b border-[#f0f0f0]">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-[16/9]">
            <Image
              src="/banners/hero-1.jpg"
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="relative aspect-[4/3] border-t border-[#f0f0f0] md:border-s md:border-t-0 md:aspect-[16/9]">
            <Image
              src="/banners/hero-2.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Category circles */}
      <section className="border-b border-[#f0f0f0] bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
              {t("browseCollections")}
            </h2>
            <p className="mt-1 text-sm text-[#747474]">{t("browseCollectionsSub")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => {
              const name = pickLocalized(c, "name", locale);
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="relative mb-3 aspect-square w-full max-w-[120px] overflow-hidden rounded-full border border-[#f0f0f0] bg-[#fafafa]">
                    {c.image ? (
                      <ProductImage src={c.image} alt={name} fill className="object-cover" sizes="120px" />
                    ) : (
                      <div className="h-full w-full bg-[#f0f0f0]" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-black group-hover:underline md:text-sm">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              {t("featuredCollectionEyebrow")}
            </h2>
            <p className="mt-2 text-2xl font-semibold text-black md:text-3xl">
              {t("featuredCollectionTitle")}
            </p>
            <p className="mt-1 text-sm text-[#747474]">{t("featuredCollectionSub")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => {
              const name = pickLocalized(p, "name", locale);
              return (
                <Card
                  key={p.id}
                  className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="relative aspect-square bg-[#fafafa]">
                      <ProductImage
                        src={pickProductImageUrl(p.images)}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                      {p.compareAtPrice ? (
                        <span className="absolute start-2 top-2 rounded bg-[#F44336] px-2 py-0.5 text-[10px] font-bold text-white">
                          {tProduct("discount")}
                        </span>
                      ) : null}
                    </div>
                    <CardContent className="space-y-2 p-4">
                      <div className="line-clamp-2 min-h-[48px] text-sm font-medium leading-snug text-black">
                        {name}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-2" dir="ltr">
                        <span className="text-lg font-semibold text-[#00BF0E]">
                          {formatPrice(p.price, locale)}
                        </span>
                        {p.compareAtPrice ? (
                          <span className="text-xs text-[#696969] line-through">
                            {formatPrice(p.compareAtPrice, locale)}
                          </span>
                        ) : null}
                      </div>
                      <span className="inline-block text-xs font-medium text-black underline-offset-4 group-hover:underline">
                        {tCommon("orderNow")}
                      </span>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              <Link href="/collections">{t("loadMore")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Spotlight + COD-style form */}
      {spotlight ? (
        <section className="border-y border-[#f0f0f0] bg-[#fafafa] py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4">
            <div className="grid gap-8 md:grid-cols-2 md:items-start">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-black md:text-3xl">{spotlightName}</h2>
                <div className="flex items-baseline gap-2" dir="ltr">
                  {spotlight.compareAtPrice ? (
                    <span className="text-lg text-[#696969] line-through">
                      {formatPrice(spotlight.compareAtPrice, locale)}
                    </span>
                  ) : null}
                  <span className="text-2xl font-bold text-[#00BF0E]">
                    {formatPrice(spotlight.price, locale)}
                  </span>
                </div>
                {spotlightDesc ? (
                  <p className="text-sm leading-relaxed text-[#4d4d4d]">{spotlightDesc}</p>
                ) : null}
                <Button asChild className="bg-black text-white hover:bg-[#343434]">
                  <Link href={`/product/${spotlight.slug}`}>{tCommon("viewDetails")}</Link>
                </Button>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-[#f0f0f0] bg-white">
                <ProductImage
                  src={pickProductImageUrl(spotlight.images)}
                  alt={spotlightName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            </div>
            <ProductSpotlightForm
              productId={spotlight.id}
              slug={spotlight.slug}
              price={spotlight.price}
            />
          </div>
        </section>
      ) : null}

      {/* PROMOTIONS */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              {t("promotionsEyebrow")}
            </h2>
            <p className="mt-2 text-2xl font-semibold text-black md:text-3xl">
              {t("promotionsTitle")}
            </p>
            <p className="mt-1 text-sm text-[#747474]">{t("promotionsSub")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promos.map((p) => {
              const name = pickLocalized(p, "name", locale);
              return (
                <Card key={p.id} className="overflow-hidden border border-[#f0f0f0] shadow-none">
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="relative aspect-square bg-[#fafafa]">
                      <ProductImage
                        src={pickProductImageUrl(p.images)}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="240px"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="line-clamp-2 text-sm font-medium text-black">{name}</div>
                      <div className="mt-2 text-lg font-semibold text-[#00BF0E]" dir="ltr">
                        {formatPrice(p.price, locale)}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
