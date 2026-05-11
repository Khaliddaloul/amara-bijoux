import { prisma } from "@/lib/prisma";

export type DiscountResult =
  | {
      ok: true;
      discountAmount: number;
      freeShipping: boolean;
      discountId: string;
      code: string;
    }
  | { ok: false; message: string };

/** Validate coupon and compute cart-level discount + optional free shipping. */
export async function evaluateDiscountCode(
  code: string | undefined,
  subtotal: number,
): Promise<DiscountResult> {
  if (!code?.trim()) {
    return { ok: false, message: "لا يوجد كود" };
  }

  const normalized = code.trim().toUpperCase();
  const candidates = await prisma.discount.findMany({ where: { isActive: true } });
  const d = candidates.find((x) => x.code.toUpperCase() === normalized);

  if (!d) {
    return { ok: false, message: "كود غير صالح" };
  }

  const now = new Date();
  if (d.startsAt && now < d.startsAt) return { ok: false, message: "الكود غير نشط بعد" };
  if (d.endsAt && now > d.endsAt) return { ok: false, message: "انتهت صلاحية الكود" };
  if (d.usageLimit != null && d.usedCount >= d.usageLimit) {
    return { ok: false, message: "استُنفدت مرات استخدام الكود" };
  }
  if (d.minPurchase != null && subtotal < d.minPurchase) {
    return { ok: false, message: `الحد الأدنى للطلب ${d.minPurchase} د.م.` };
  }

  if (d.type === "FREE_SHIPPING") {
    return {
      ok: true,
      discountAmount: 0,
      freeShipping: true,
      discountId: d.id,
      code: d.code,
    };
  }

  if (d.type === "PERCENTAGE") {
    const amount = Math.min(subtotal, Math.round((subtotal * d.value) / 100));
    return {
      ok: true,
      discountAmount: amount,
      freeShipping: false,
      discountId: d.id,
      code: d.code,
    };
  }

  if (d.type === "FIXED") {
    const amount = Math.min(subtotal, d.value);
    return {
      ok: true,
      discountAmount: amount,
      freeShipping: false,
      discountId: d.id,
      code: d.code,
    };
  }

  return { ok: false, message: "نوع كوبون غير مدعوم" };
}
