import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPopupsPage() {
  const popups = await prisma.storePopup.findMany({ orderBy: { id: "desc" } });

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pop-ups</h1>
          <p className="text-sm text-muted-foreground">عرض تجريبي للمشاهدات.</p>
        </div>
        <Link
          href="/admin/marketing/popups/new"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + Pop-up جديد
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">العنوان</th>
              <th className="p-3 text-right">الموضع</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">مشاهدات (عرضي)</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {popups.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-semibold">{p.title}</td>
                <td className="p-3">{p.position}</td>
                <td className="p-3">{p.isActive ? "نشط" : "معطل"}</td>
                <td className="p-3">{p.viewCount}</td>
                <td className="p-3">
                  <Link className="text-primary hover:underline" href={`/admin/marketing/popups/${p.id}`}>
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
