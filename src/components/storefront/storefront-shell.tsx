import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import { getStorePublicSettings } from "@/lib/store-settings";
import { mergeTheme, getStorefrontPayload } from "@/lib/storefront-public";
import { AnnouncementBar } from "./announcement-bar";
import { StoreFooter } from "./store-footer";
import { StoreHeader } from "./store-header";
import { StorefrontPopup, type StorefrontPopupPayload } from "./store-popup";

/** Public storefront chrome — menus + popup from DB. */
export async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const [popupRow, headerRows, footerRows, storefrontSetting, productCount, storePublic] =
    await Promise.all([
      prisma.storePopup.findFirst({ where: { isActive: true }, orderBy: { id: "desc" } }),
      prisma.menuItem.findMany({
        where: { location: "HEADER", parentId: null },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.menuItem.findMany({
        where: { location: "FOOTER", parentId: null },
        orderBy: { sortOrder: "asc" },
      }),
      getStorefrontPayload(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      getStorePublicSettings(),
    ]);

  const theme = mergeTheme(storefrontSetting.theme);

  let popup: StorefrontPopupPayload | null = null;
  if (popupRow) {
    popup = {
      id: popupRow.id,
      title: popupRow.title,
      subtitle: popupRow.subtitle,
      message: popupRow.message,
      image: popupRow.image,
      ctaLabel: popupRow.ctaLabel,
      ctaHref: popupRow.ctaHref,
      delaySec: popupRow.delaySec,
      showOnExit: popupRow.showOnExit,
      closeAfterSec: popupRow.closeAfterSec,
      position: popupRow.position,
      targetPages: parseJson<string[]>(popupRow.targetPages, ["all"]),
    };
  }

  const headerNav = headerRows.map((r) => ({ id: r.id, label: r.label, url: r.url }));
  const footerLinks = footerRows.map((r) => ({ id: r.id, label: r.label, url: r.url }));
  const mid = Math.ceil(footerLinks.length / 2) || 1;
  const footerCols = [footerLinks.slice(0, mid), footerLinks.slice(mid)];

  return (
    <div className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      <StoreHeader navItems={headerNav} logoUrl={theme.logoUrl} />
      <main>{children}</main>
      <StoreFooter
        columns={footerCols}
        productCount={productCount}
        storeDisplayName={storePublic.general.storeName}
        contactEmail={storePublic.general.storeEmail || undefined}
        contactPhone={storePublic.general.storePhone || undefined}
        addressLine={
          [storePublic.general.address, storePublic.general.city].filter(Boolean).join("، ") ||
          undefined
        }
      />
      <StorefrontPopup popup={popup} />
    </div>
  );
}
