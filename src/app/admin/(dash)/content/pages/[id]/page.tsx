import { notFound } from "next/navigation";
import { PageEditorForm } from "@/components/admin/page-editor-form";
import { prisma } from "@/lib/prisma";
import type { PageAdminInput } from "@/lib/validations/admin-cms";

export default async function EditAdminPage({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({ where: { id: params.id } });
  if (!page) notFound();

  const defaultValues: PageAdminInput = {
    title: page.title,
    slug: page.slug,
    content: page.content,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    isPublished: page.isPublished,
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">تعديل الصفحة</h1>
        <p className="text-sm text-muted-foreground">{page.title}</p>
      </div>
      <PageEditorForm mode="edit" pageId={page.id} defaultValues={defaultValues} />
    </div>
  );
}
