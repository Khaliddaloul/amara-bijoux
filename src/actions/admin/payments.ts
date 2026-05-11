"use server";

import { auth } from "@/auth";
import { logActivity } from "@/lib/admin/activity";
import { prisma } from "@/lib/prisma";
import { paymentMethodsSchema, type PaymentMethodsInput } from "@/lib/validations/payment-methods";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const, userId: session.user.id };
}

export async function savePaymentMethods(raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = paymentMethodsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  const data = parsed.data;

  try {
    await prisma.setting.upsert({
      where: { key: "payment.methods" },
      create: { key: "payment.methods", value: JSON.stringify(data) },
      update: { value: JSON.stringify(data) },
    });

    await logActivity({
      userId: authz.userId,
      action: "UPDATE",
      entity: "Setting",
      entityId: "payment.methods",
      metadata: { keys: ["cod", "bankTransfer", "card"] },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");

    return { success: true as const, data };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل الحفظ" };
  }
}
