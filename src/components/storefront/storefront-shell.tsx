import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "./announcement-bar";
import { MarketingPixelScripts } from "./marketing-pixel-scripts";
import { StoreFooter } from "./store-footer";
import { StoreHeader } from "./store-header";
import { StorePopup } from "./store-popup";
import { isLocale, type Locale } from "@/i18n/config";
import { pickLocalized, pickLocalizedNullable } from "@/lib/i18n-helpers";

/** Public storefront chrome — loads pixels + popup from DB when configured. */
export async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const localeRaw = await getLocale();
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "ar";

  const [popupRow, pixelRows] = await Promise.all([
    prisma.storePopup.findFirst({ where: { isActive: true } }),
    prisma.pixelConfig.findMany({ where: { isActive: true } }),
  ]);

  const popup = popupRow
    ? {
        title: pickLocalized(popupRow, "title", locale),
        message: pickLocalized(popupRow, "message", locale),
        image: popupRow.image,
        ctaLabel: pickLocalizedNullable(popupRow, "ctaLabel", locale),
        ctaHref: popupRow.ctaHref,
        delaySec: popupRow.delaySec,
        showOnExit: popupRow.showOnExit,
      }
    : null;

  // Map PixelConfig records into the MarketingPixelsPayload shape.
  const pixelsPayload = {
    facebookPixelId: pixelRows.find((p) => p.provider === "facebook")?.pixelId ?? "",
    tiktokPixelId: pixelRows.find((p) => p.provider === "tiktok")?.pixelId ?? "",
    gtmId: pixelRows.find((p) => p.provider === "gtm")?.pixelId ?? "",
    gaId: pixelRows.find((p) => p.provider === "ga")?.pixelId ?? "",
    snapPixelId: pixelRows.find((p) => p.provider === "snap")?.pixelId ?? "",
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <MarketingPixelScripts pixels={pixelsPayload} />
      <AnnouncementBar />
      <StoreHeader />
      <main>{children}</main>
      <StoreFooter />
      <StorePopup popup={popup} />
    </div>
  );
}
