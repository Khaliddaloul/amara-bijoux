"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductSpotlightForm({
  productId,
  slug,
  price,
}: {
  productId: string;
  slug: string;
  price: number;
}) {
  const t = useTranslations("spotlight");
  return (
    <div className="rounded-lg border border-[#f0f0f0] bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-black">{t("customerInfo")}</h3>
      <p className="mb-4 text-xs text-[#747474]">{t("fieldsMatchReference")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-black">{t("fullName")}</label>
          <Input readOnly placeholder={t("fullNamePlaceholder")} className="border-[#f0f0f0] bg-[#fafafa]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-black">{t("phone")}</label>
          <Input readOnly placeholder={t("phonePlaceholder")} className="border-[#f0f0f0] bg-[#fafafa]" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-black">{t("address")}</label>
          <Input readOnly placeholder={t("addressPlaceholder")} className="border-[#f0f0f0] bg-[#fafafa]" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild className="bg-black text-white hover:bg-[#343434]">
          <Link href={`/product/${slug}`}>{t("orderNowGoToProduct")}</Link>
        </Button>
        <span className="self-center text-xs text-[#696969]" dir="ltr">
          {t("productIdLabel")}: {productId.slice(0, 8)}… — {t("priceStartsFrom")} {price}
        </span>
      </div>
    </div>
  );
}
