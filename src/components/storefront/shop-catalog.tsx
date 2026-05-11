import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductImage } from "@/components/storefront/product-image";
import { Card, CardContent } from "@/components/ui/card";
import { isLocale, type Locale } from "@/i18n/config";
import { formatPrice, pickLocalized } from "@/lib/i18n-helpers";
import { pickProductImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export async function ShopCatalog({ query }: { query?: string }) {
  const localeRaw = await getLocale();
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "ar";
  const t = await getTranslations("shop");

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { nameEn: { contains: query } },
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">{t("collectionsTitle")}</h1>
        <p className="mt-1 text-sm text-[#696969]">{t("collectionsSubtitle")}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const name = pickLocalized(p, "name", locale);
          return (
            <Card
              key={p.id}
              className="group overflow-hidden border border-[#f0f0f0] bg-white shadow-none transition hover:border-[#6a6a6a]"
            >
              <Link href={`/product/${p.slug}`} className="block">
                <div className="relative aspect-square bg-[#fafafa]">
                  <ProductImage src={pickProductImageUrl(p.images)} alt={name} fill className="object-cover" sizes="360px" />
                </div>
                <CardContent className="space-y-2 border-t border-[#f0f0f0] p-4">
                  <div className="line-clamp-2 min-h-[48px] text-sm font-medium leading-snug text-black">{name}</div>
                  <div className="text-xs text-[#696969]">
                    {p.categories.map((c) => pickLocalized(c, "name", locale)).join(" · ")}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-[#00BF0E]" dir="ltr">
                      {formatPrice(p.price, locale)}
                    </div>
                    {p.compareAtPrice ? (
                      <div className="text-xs text-[#696969] line-through" dir="ltr">
                        {formatPrice(p.compareAtPrice, locale)}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
