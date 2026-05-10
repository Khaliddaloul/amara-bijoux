import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMad } from "@/lib/format";
import { parseJson } from "@/lib/json";
import { format } from "date-fns";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  const shipping = parseJson<Record<string, string>>(order.shippingAddress, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">طلب #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            أُنشئ في {format(order.createdAt, "yyyy/MM/dd HH:mm")}
          </p>
        </div>
        <Link href="/admin/orders" className="text-sm text-primary hover:underline">
          رجوع للقائمة
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 text-sm">
          <div className="mb-2 font-semibold">العميل</div>
          <div>{order.customerName}</div>
          <div className="text-muted-foreground">{order.customerPhone}</div>
          {order.customerEmail ? <div className="text-muted-foreground">{order.customerEmail}</div> : null}
        </div>
        <div className="rounded-lg border bg-card p-4 text-sm">
          <div className="mb-2 font-semibold">العنوان</div>
          <div>
            {shipping.city} — {shipping.address}
          </div>
          <div className="text-muted-foreground">حالة الطلب: {order.status}</div>
          <div className="text-muted-foreground">حالة الدفع: {order.paymentStatus}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">المنتج</th>
              <th className="p-3 text-right">الكمية</th>
              <th className="p-3 text-right">السعر</th>
              <th className="p-3 text-right">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{formatMad(item.price)}</td>
                <td className="p-3 font-semibold">{formatMad(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-end gap-3 text-sm">
        <div className="rounded-md border bg-muted/40 px-4 py-3">
          <div className="flex justify-between gap-8">
            <span>المجموع</span>
            <span className="font-bold">{formatMad(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
