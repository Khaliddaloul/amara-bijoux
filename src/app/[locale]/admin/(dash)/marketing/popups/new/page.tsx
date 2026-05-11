import { PopupEditorForm } from "@/components/admin/popup-editor-form";

export default function NewPopupPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">Pop-up جديد</h1>
      <PopupEditorForm
        mode="create"
        defaultValues={{
          title: "",
          subtitle: "",
          message: "<p></p>",
          image: null,
          ctaLabel: null,
          ctaHref: null,
          delaySec: 4,
          showOnExit: false,
          closeAfterSec: null,
          position: "center",
          targetPagesRaw: "all",
          viewCount: 840,
          isActive: true,
        }}
      />
    </div>
  );
}
