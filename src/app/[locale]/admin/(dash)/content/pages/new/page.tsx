import { PageEditorForm } from "@/components/admin/page-editor-form";
import type { PageAdminInput } from "@/lib/validations/admin-cms";

const defaults: PageAdminInput = {
  title: "",
  slug: "",
  content: "<p></p>",
  seoTitle: null,
  seoDescription: null,
  isPublished: false,
};

export default function NewAdminPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">صفحة جديدة</h1>
        <p className="text-sm text-muted-foreground">المحتوى يظهر علناً على `/pages/[slug]` عند النشر.</p>
      </div>
      <PageEditorForm mode="create" defaultValues={defaults} />
    </div>
  );
}
