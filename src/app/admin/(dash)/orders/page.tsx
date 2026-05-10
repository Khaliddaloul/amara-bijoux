import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMad } from "@/lib/format";
import { format } from "date-fns";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الطلبات</h1>
          <p className="text-sm text-muted-foreground">بحث وفلاتر متقدمة قيد الإضافة — البيانات حية من SQLite.</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
        >
          طلب يدوي
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">الطلب</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">العميل</th>
              <th className="p-3 text-right">المبلغ</th>
              <th className="p-3 text-right">الدفع</th>
              <th className="p-3 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-semibold">
                  <Link className="text-primary hover:underline" href={`/admin/orders/${o.id}`}>
                    #{o.orderNumber}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{format(o.createdAt, "yyyy/MM/dd HH:mm")}</td>
                <td className="p-3">
                  <div>{o.customerName}</div>
                  <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                </td>
                <td className="p-3 font-semibold">{formatMad(o.total)}</td>
                <td className="p-3 text-xs">{o.paymentStatus}</td>
                <td className="p-3 text-xs">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
