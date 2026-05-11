import { CampaignEditorForm } from "@/components/admin/campaign-editor-form";
import type { CampaignAdminInput } from "@/lib/validations/admin-cms";

const defaults: CampaignAdminInput = {
  title: "",
  channel: "EMAIL",
  subject: "",
  body: "",
  recipientFilter: "all_customers",
  recipientTag: null,
};

export default function NewCampaignPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">حملة جديدة</h1>
      <CampaignEditorForm mode="create" defaultValues={defaults} />
    </div>
  );
}
