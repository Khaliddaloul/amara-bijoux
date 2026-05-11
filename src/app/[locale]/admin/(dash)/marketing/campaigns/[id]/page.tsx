import { notFound } from "next/navigation";
import { CampaignEditorForm } from "@/components/admin/campaign-editor-form";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import type { CampaignAdminInput } from "@/lib/validations/admin-cms";

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const c = await prisma.marketingCampaign.findUnique({ where: { id: params.id } });
  if (!c) notFound();

  const rf = parseJson<{ filter?: string; tag?: string }>(c.recipientFilter, {});
  let recipientFilter: CampaignAdminInput["recipientFilter"] = "all_customers";
  if (rf.filter === "tag") recipientFilter = "tag";
  else if (rf.filter === "segment") recipientFilter = "segment";

  const defaultValues: CampaignAdminInput = {
    title: c.title,
    channel: c.channel as CampaignAdminInput["channel"],
    subject: c.subject,
    body: c.body,
    recipientFilter,
    recipientTag: rf.tag ?? null,
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">تعديل الحملة</h1>
      <CampaignEditorForm mode="edit" campaignId={c.id} defaultValues={defaultValues} />
    </div>
  );
}
