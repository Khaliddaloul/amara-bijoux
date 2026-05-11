"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

export async function markAbandonedRecovered(cartId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: { recoveredAt: new Date() },
    });
    revalidatePath("/admin/abandoned-carts");
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث" };
  }
}

export async function deleteAbandoned(cartId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.abandonedCart.delete({ where: { id: cartId } });
    revalidatePath("/admin/abandoned-carts");
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}
