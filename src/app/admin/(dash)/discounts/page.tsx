import {
  DiscountsTable,
  type DiscountRow,
} from "@/components/admin/discounts/discounts-table";
import { DiscountCreateButton } from "@/components/admin/discounts/discount-form-dialog";
import { prisma } from "@/lib/prisma";

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });

  const rows: DiscountRow[] = discounts.map((d) => ({
    id: d.id,
    code: d.code,
    type:
      d.type === "FIXED"
        ? "FIXED"
        : d.type === "FREE_SHIPPING"
          ? "FREE_SHIPPING"
          : "PERCENTAGE",
    value: d.value,
    minPurchase: d.minPurchase,
    usageLimit: d.usageLimit,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    isActive: d.isActive,
    usedCount: d.usedCount,
    createdAt: d.createdAt,
  }));

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الخصومات والكوبونات</h1>
          <p className="text-sm text-muted-foreground">
            تُطبَّق الأكواد في صفحة الدفع. الكود غير الحساس لحالة الأحرف.
          </p>
        </div>
        <DiscountCreateButton />
      </div>
      <DiscountsTable rows={rows} />
    </div>
  );
}
