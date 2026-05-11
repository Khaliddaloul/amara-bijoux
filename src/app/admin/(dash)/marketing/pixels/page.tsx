import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PixelsAdminForm } from "@/components/admin/pixels-admin-form";
import { getMarketingPixelsPayload } from "@/lib/storefront-public";

export const dynamic = "force-dynamic";

export default async function AdminPixelsPage() {
  const raw = await getMarketingPixelsPayload();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pixels والتتبع</h1>
          <p className="text-sm text-muted-foreground">تُحقن في `layout` عبر `next/script` بعد التفاعل.</p>
        </div>
        <ButtonLink />
      </div>
      <PixelsAdminForm
        defaultValues={{
          facebookPixelId: raw.facebookPixelId ?? "",
          tiktokPixelId: raw.tiktokPixelId ?? "",
          gtmId: raw.gtmId ?? "",
          gaId: raw.gaId ?? "",
          snapPixelId: raw.snapPixelId ?? "",
        }}
      />
    </div>
  );
}

function ButtonLink() {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
    >
      <ExternalLink className="h-4 w-4" />
      معاينة المتجر
    </Link>
  );
}
