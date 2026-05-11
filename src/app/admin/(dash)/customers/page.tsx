import Link from "next/link";
import { CustomersToolbar } from "@/components/admin/customers/customers-toolbar";
import { prisma } from "@/lib/prisma";
import { formatMad } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams?.q?.trim() ?? "";

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { totalSpent: "desc" },
    take: 500,
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">العملاء</h1>
        <p className="text-sm text-muted-foreground">
          قائمة العملاء — ابحثي بالاسم، البريد، أو الهاتف. التصدير لـ CSV متاح.
        </p>
      </div>
      <CustomersToolbar initialQuery={q} />
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">البريد</th>
              <th className="p-3 text-right">الهاتف</th>
              <th className="p-3 text-right">الطلبات</th>
              <th className="p-3 text-right">الإنفاق</th>
              <th className="p-3 text-right">آخر طلب</th>
              <th className="p-3 text-right">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  لا نتائج.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="p-3">{c.phone ?? "—"}</td>
                  <td className="p-3">{c.ordersCount}</td>
                  <td className="p-3 font-semibold">{formatMad(c.totalSpent)}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {c.orders[0]
                      ? new Date(c.orders[0].createdAt).toLocaleDateString("ar-MA")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <Link
                      className="text-primary hover:underline"
                      href={`/admin/customers/${c.id}`}
                    >
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
