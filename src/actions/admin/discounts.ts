"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  discountAdminSchema,
  type DiscountAdminInput,
} from "@/lib/validations/discount-admin";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

function revalidateDiscounts() {
  revalidatePath("/admin/discounts");
  revalidatePath("/checkout");
}

export async function createDiscount(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = discountAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const exists = await prisma.discount.findUnique({ where: { code: data.code } });
  if (exists) return { success: false as const, error: "الكود مستخدم بالفعل" };

  try {
    const d = await prisma.discount.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.type === "FREE_SHIPPING" ? 0 : data.value,
        minPurchase: data.minPurchase ?? null,
        usageLimit: data.usageLimit ?? null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
        isActive: data.isActive,
      },
    });
    revalidateDiscounts();
    return { success: true as const, data: { id: d.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء الكود" };
  }
}

export async function updateDiscount(discountId: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = discountAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const existing = await prisma.discount.findUnique({ where: { id: discountId } });
  if (!existing) return { success: false as const, error: "الكود غير موجود" };

  const codeTaken = await prisma.discount.findFirst({
    where: { code: data.code, NOT: { id: discountId } },
  });
  if (codeTaken) return { success: false as const, error: "الكود مستخدم لخصم آخر" };

  try {
    await prisma.discount.update({
      where: { id: discountId },
      data: {
        code: data.code,
        type: data.type,
        value: data.type === "FREE_SHIPPING" ? 0 : data.value,
        minPurchase: data.minPurchase ?? null,
        usageLimit: data.usageLimit ?? null,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
        isActive: data.isActive,
      },
    });
    revalidateDiscounts();
    return { success: true as const, data: { id: discountId } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل تحديث الكود" };
  }
}

export async function deleteDiscount(discountId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.discount.delete({ where: { id: discountId } });
    revalidateDiscounts();
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}

export type { DiscountAdminInput };
