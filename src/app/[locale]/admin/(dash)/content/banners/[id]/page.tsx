import { notFound } from "next/navigation";
import { BannerEditorForm } from "@/components/admin/banner-editor-form";
import { prisma } from "@/lib/prisma";
import type { BannerAdminInput } from "@/lib/validations/admin-cms";

export default async function EditBannerPage({ params }: { params: { id: string } }) {
  const b = await prisma.homeBanner.findUnique({ where: { id: params.id } });
  if (!b) notFound();

  const defaultValues: BannerAdminInput = {
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    ctaLabel: b.ctaLabel,
    ctaHref: b.ctaHref,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">تعديل البانر</h1>
      </div>
      <BannerEditorForm mode="edit" bannerId={b.id} defaultValues={defaultValues} />
    </div>
  );
}
