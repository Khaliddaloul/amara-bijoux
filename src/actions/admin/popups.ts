"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";
import { popupAdminSchema, type PopupAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function createPopup(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = popupAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data: PopupAdminInput = parsed.data;

  await prisma.storePopup.create({
    data: {
      title: data.title,
      subtitle: data.subtitle ?? null,
      message: data.message,
      image: data.image ?? null,
      ctaLabel: data.ctaLabel ?? null,
      ctaHref: data.ctaHref ?? null,
      delaySec: data.delaySec,
      showOnExit: data.showOnExit,
      closeAfterSec: data.closeAfterSec ?? null,
      position: data.position,
      targetPages: stringifyJson(data.targetPages ?? ["all"]),
      viewCount: data.viewCount ?? 842,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/marketing/popups");
  revalidatePath("/");
  return { success: true as const };
}

export async function updatePopup(id: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = popupAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  await prisma.storePopup.update({
    where: { id },
    data: {
      title: data.title,
      subtitle: data.subtitle ?? null,
      message: data.message,
      image: data.image ?? null,
      ctaLabel: data.ctaLabel ?? null,
      ctaHref: data.ctaHref ?? null,
      delaySec: data.delaySec,
      showOnExit: data.showOnExit,
      closeAfterSec: data.closeAfterSec ?? null,
      position: data.position,
      targetPages: stringifyJson(data.targetPages ?? ["all"]),
      viewCount: data.viewCount ?? undefined,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/marketing/popups");
  revalidatePath("/");
  return { success: true as const };
}

export async function deletePopup(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.storePopup.delete({ where: { id } });
  revalidatePath("/admin/marketing/popups");
  revalidatePath("/");
  return { success: true as const };
}
