"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const, userId: session.user.id };
}

export async function markNotificationRead(id: string, read: boolean) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.notification.updateMany({
    where: { id, userId: authz.userId },
    data: { isRead: read },
  });

  revalidatePath("/admin/notifications");
  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.notification.updateMany({
    where: { userId: authz.userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/admin/notifications");
  return { success: true as const };
}
