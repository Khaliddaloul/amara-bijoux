import {
  AbandonedCartsTable,
  type AbandonedCartRow,
} from "@/components/admin/abandoned-carts/abandoned-carts-table";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAbandonedCartsPage() {
  const carts = await prisma.abandonedCart.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const rows: AbandonedCartRow[] = carts.map((c) => {
    const items = parseJson<Array<{ qty: number }>>(c.items, []);
    const itemCount = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    return {
      id: c.id,
      customerEmail: c.customerEmail,
      customerPhone: c.customerPhone,
      itemCount,
      subtotal: c.subtotal,
      recoveredAt: c.recoveredAt,
      createdAt: c.createdAt,
    };
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">السلات المهجورة</h1>
        <p className="text-sm text-muted-foreground">
          ابعثي رسالة واتساب جاهزة مع رابط استرجاع السلة.
        </p>
      </div>
      <AbandonedCartsTable rows={rows} />
    </div>
  );
}
