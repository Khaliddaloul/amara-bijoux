"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { menuItemAdminSchema, type MenuItemAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function createMenuItem(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = menuItemAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data: MenuItemAdminInput = parsed.data;

  await prisma.menuItem.create({
    data: {
      location: data.location,
      label: data.label,
      url: data.url,
      sortOrder: data.sortOrder,
      parentId: data.parentId ?? null,
    },
  });
  revalidatePath("/admin/content/menus");
  revalidatePath("/");
  return { success: true as const };
}

export async function updateMenuItem(id: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = menuItemAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  await prisma.menuItem.update({
    where: { id },
    data: {
      location: data.location,
      label: data.label,
      url: data.url,
      sortOrder: data.sortOrder,
      parentId: data.parentId ?? null,
    },
  });
  revalidatePath("/admin/content/menus");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteMenuItem(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/content/menus");
  revalidatePath("/");
  return { success: true as const };
}

export async function reorderMenuItems(location: "HEADER" | "FOOTER", orderedIds: string[]) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.menuItem.update({
        where: { id, location },
        data: { sortOrder: idx },
      }),
    ),
  );
  revalidatePath("/admin/content/menus");
  revalidatePath("/");
  return { success: true as const };
}
