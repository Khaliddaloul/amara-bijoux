import { notFound } from "next/navigation";
import { PopupEditorForm } from "@/components/admin/popup-editor-form";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import type { PopupAdminInput } from "@/lib/validations/admin-cms";

export default async function EditPopupPage({ params }: { params: { id: string } }) {
  const p = await prisma.storePopup.findUnique({ where: { id: params.id } });
  if (!p) notFound();

  const tp = parseJson<string[]>(p.targetPages, ["all"]);
  const targetPagesRaw = tp.includes("all") ? "all" : tp.join("\n");

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">تعديل Pop-up</h1>
      <PopupEditorForm
        mode="edit"
        popupId={p.id}
        defaultValues={{
          title: p.title,
          subtitle: p.subtitle,
          message: p.message,
          image: p.image,
          ctaLabel: p.ctaLabel,
          ctaHref: p.ctaHref,
          delaySec: p.delaySec,
          showOnExit: p.showOnExit,
          closeAfterSec: p.closeAfterSec,
          position: p.position as PopupAdminInput["position"],
          targetPagesRaw,
          viewCount: p.viewCount,
          isActive: p.isActive,
        }}
      />
    </div>
  );
}
