"use server";

import { auth } from "@/auth";
import { logActivity } from "@/lib/admin/activity";
import { prisma } from "@/lib/prisma";
import { shippingZoneAdminSchema, type ShippingZoneAdminInput } from "@/lib/validations/shipping-admin";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const, userId: session.user.id };
}

function revalidateShipping() {
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
}

export async function createShippingZone(raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = shippingZoneAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  const data = parsed.data;

  try {
    const zone = await prisma.shippingZone.create({
      data: {
        name: data.name,
        regions: JSON.stringify(data.regions),
        isActive: data.isActive,
        rates: {
          create: data.rates.map((r) => ({
            name: r.name,
            price: r.price,
            minOrder: r.minOrder,
            maxOrder: r.maxOrder ?? null,
            estimatedDays: r.estimatedDays ?? null,
          })),
        },
      },
    });

    await logActivity({
      userId: authz.userId,
      action: "CREATE",
      entity: "ShippingZone",
      entityId: zone.id,
      metadata: { name: data.name },
    });

    revalidateShipping();
    return { success: true as const, data: { id: zone.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء المنطقة" };
  }
}

export async function updateShippingZone(zoneId: string, raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = shippingZoneAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  const data = parsed.data;

  const exists = await prisma.shippingZone.findUnique({ where: { id: zoneId } });
  if (!exists) return { success: false as const, error: "المنطقة غير موجودة" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.shippingRate.deleteMany({ where: { zoneId } });
      await tx.shippingZone.update({
        where: { id: zoneId },
        data: {
          name: data.name,
          regions: JSON.stringify(data.regions),
          isActive: data.isActive,
          rates: {
            create: data.rates.map((r) => ({
              name: r.name,
              price: r.price,
              minOrder: r.minOrder,
              maxOrder: r.maxOrder ?? null,
              estimatedDays: r.estimatedDays ?? null,
            })),
          },
        },
      });
    });

    await logActivity({
      userId: authz.userId,
      action: "UPDATE",
      entity: "ShippingZone",
      entityId: zoneId,
      metadata: { name: data.name },
    });

    revalidateShipping();
    return { success: true as const, data: { id: zoneId } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث" };
  }
}

export async function deleteShippingZone(zoneId: string) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.shippingZone.delete({ where: { id: zoneId } });
    await logActivity({
      userId: authz.userId,
      action: "DELETE",
      entity: "ShippingZone",
      entityId: zoneId,
    });
    revalidateShipping();
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}
