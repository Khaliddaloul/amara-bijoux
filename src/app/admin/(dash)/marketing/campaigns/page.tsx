import Link from "next/link";
import { CampaignSendButton } from "@/components/admin/campaign-send-button";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const rows = await prisma.marketingCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">حملات التسويق</h1>
          <p className="text-sm text-muted-foreground">زر الإرسال يحدّث الحالة محلياً دون SMTP.</p>
        </div>
        <Link
          href="/admin/marketing/campaigns/new"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + حملة جديدة
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">العنوان</th>
              <th className="p-3 text-right">القناة</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">المستلمين</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-semibold">{c.title}</td>
                <td className="p-3">{c.channel}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{c.recipientCount}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {c.sentAt ? c.sentAt.toLocaleString("ar-MA") : c.createdAt.toLocaleString("ar-MA")}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-3">
                    <Link className="text-primary hover:underline" href={`/admin/marketing/campaigns/${c.id}`}>
                      تعديل
                    </Link>
                    {c.status !== "SENT" ? <CampaignSendButton campaignId={c.id} /> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
