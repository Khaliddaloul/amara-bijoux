import { BannerEditorForm } from "@/components/admin/banner-editor-form";
import type { BannerAdminInput } from "@/lib/validations/admin-cms";

const defaults: BannerAdminInput = {
  title: "",
  subtitle: "",
  image: "",
  ctaLabel: "",
  ctaHref: "",
  sortOrder: 0,
  isActive: true,
};

export default function NewBannerPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">بانر جديد</h1>
      </div>
      <BannerEditorForm mode="create" defaultValues={defaults} />
    </div>
  );
}
