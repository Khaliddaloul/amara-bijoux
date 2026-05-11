import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HomeFaqSection } from "@/components/storefront/home-faq-section";
import { HomeHeroSlider } from "@/components/storefront/home-hero-slider";
import { ProductImage } from "@/components/storefront/product-image";
import { JsonLd } from "@/components/seo/json-ld";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import type { StorefrontSection } from "@/lib/storefront-public";
import { getStorefrontPayload } from "@/lib/storefront-public";
import { ProductSpotlightForm } from "@/components/storefront/product-spotlight-form";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getWebsiteSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "أمارا للمجوهرات | مجوهرات مغربية فاخرة",
    applyTitleTemplate: false,
    description:
      "اكتشفي خواتم، قلائد، أساور، أقراط وأطقم مختارة بعناية — تجربة عربية كاملة، والدفع عند الاستلام والشحن داخل المغرب.",
    canonicalPath: "/",
    keywords: [...STORE_KEYWORDS],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "أمارا للمجوهرات" }],
  });
}

const DEFAULT_SECTIONS: StorefrontSection[] = [
  { id: "hero", type: "hero", visible: true, order: 0 },
  { id: "categories", type: "categories_grid", visible: true, order: 1 },
  { id: "featured", type: "featured_products", visible: true, order: 2 },
  { id: "spotlight", type: "spotlight", visible: true, order: 3 },
  { id: "promotions", type: "promotions", visible: true, order: 4 },
  { id: "testimonials", type: "testimonials", visible: false, order: 5 },
];

export default async function HomePage() {
  const storefront = await getStorefrontPayload();
  const sections = [...(storefront.sections?.length ? storefront.sections : DEFAULT_SECTIONS)].sort(
    (a, b) => a.order - b.order,
  );

  const [bannerRows, featured, categories, spotlight, promos] = await Promise.all([
    prisma.homeBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
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

  const banners = bannerRows.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    ctaLabel: b.ctaLabel,
    ctaHref: b.ctaHref,
  }));

  const blocks: Record<string, ReactNode> = {
    hero: <HomeHeroSlider banners={banners} />,
    categories_grid: (
      <section className="border-b border-[#f0f0f0] bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">تصفحي التشكيلات</h2>
            <p className="mt-1 text-sm text-[#747474]">اعثري على كل ما تبحثين عنه</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative mb-3 aspect-square w-full max-w-[120px] overflow-hidden rounded-full border border-[#f0f0f0] bg-[#fafafa]">
                  {c.image ? (
                    <ProductImage src={c.image} alt={c.name} fill className="object-cover" sizes="120px" />
                  ) : (
                    <div className="h-full w-full bg-[#f0f0f0]" />
                  )}
                </div>
                <span className="text-xs font-medium text-black group-hover:underline md:text-sm">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
    featured_products: (
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">مجموعة مميزة</h2>
            <p className="mt-2 text-2xl font-semibold text-black md:text-3xl">FEATURED COLLECTION</p>
            <p className="mt-1 text-sm text-[#747474]">اعثري على كل ما تبحثين عنه</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Card
                key={p.id}
                className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
              >
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square bg-[#fafafa]">
                    <ProductImage
                      src={pickProductImageUrl(p.images)}
                      alt={`صورة منتج ${p.name} — مجموعة مميزة`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {p.compareAtPrice ? (
                      <span className="absolute start-2 top-2 rounded bg-[#F44336] px-2 py-0.5 text-[10px] font-bold text-white">
                        تخفيض
                      </span>
                    ) : null}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <div className="line-clamp-2 min-h-[48px] text-sm font-medium leading-snug text-black">{p.name}</div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-lg font-semibold text-accent">{formatMad(p.price)}</span>
                      {p.compareAtPrice ? (
                        <span className="text-xs text-[#696969] line-through">{formatMad(p.compareAtPrice)}</span>
                      ) : null}
                    </div>
                    <span className="inline-block text-xs font-medium text-black underline-offset-4 group-hover:underline">
                      اطلبي الآن
                    </span>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              <Link href="/collections">تحميل المزيد</Link>
            </Button>
          </div>
        </div>
      </section>
    ),
    spotlight: spotlight ? (
      <section className="border-y border-[#f0f0f0] bg-[#fafafa] py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-black md:text-3xl">{spotlight.name}</h2>
              <div className="flex items-baseline gap-2">
                {spotlight.compareAtPrice ? (
                  <span className="text-lg text-[#696969] line-through">{formatMad(spotlight.compareAtPrice)}</span>
                ) : null}
                <span className="text-2xl font-bold text-accent">{formatMad(spotlight.price)}</span>
              </div>
              {spotlight.shortDescription ? (
                <p className="text-sm leading-relaxed text-[#4d4d4d]">{spotlight.shortDescription}</p>
              ) : null}
              <Button asChild className="bg-black text-white hover:bg-[#343434]">
                <Link href={`/product/${spotlight.slug}`}>عرض التفاصيل</Link>
              </Button>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-[#f0f0f0] bg-white">
              <ProductImage
                src={pickProductImageUrl(spotlight.images)}
                alt={spotlight.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>
          <ProductSpotlightForm productId={spotlight.id} slug={spotlight.slug} price={spotlight.price} />
        </div>
      </section>
    ) : null,
    promotions: (
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black">عروض</h2>
            <p className="mt-2 text-2xl font-semibold text-black md:text-3xl">PROMOTIONS</p>
            <p className="mt-1 text-sm text-[#747474]">عروض اليوم</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promos.map((p) => (
              <Card key={p.id} className="overflow-hidden border border-[#f0f0f0] shadow-none">
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square bg-[#fafafa]">
                    <ProductImage
                      src={pickProductImageUrl(p.images)}
                      alt={`صورة ${p.name} — عروض أمارا`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="line-clamp-2 text-sm font-medium text-black">{p.name}</div>
                    <div className="mt-2 text-lg font-semibold text-accent">{formatMad(p.price)}</div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    ),
    testimonials: (
      <section className="border-y border-[#f0f0f0] bg-[#fafafa] py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-xl font-semibold text-black">آراء العملاء</h2>
          <p className="mt-4 text-sm text-[#696969]">
            شكراً لثقتكم — يمكن إدارة هذه المنطقة لاحقاً من لوحة التحكم.
          </p>
        </div>
      </section>
    ),
  };

  return (
    <StorefrontShell>
      <>
        <JsonLd data={getWebsiteSchema()} />
        <h1 className="sr-only">أمارا للمجوهرات | مجوهرات مغربية فاخرة</h1>
        {sections.map((s) => {
          if (!s.visible) return null;
          const node = blocks[s.type];
          return node ? <div key={s.id}>{node}</div> : null;
        })}
        <HomeFaqSection />
      </>
    </StorefrontShell>
  );
}
