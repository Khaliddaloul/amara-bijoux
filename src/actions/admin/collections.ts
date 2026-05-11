"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  collectionAdminSchema,
  type CollectionAdminInput,
} from "@/lib/validations/collection-admin";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

function revalidateCollectionRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
  if (slug) revalidatePath(`/collection/${slug}`);
}

export async function createCollection(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = collectionAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        parsed.error.flatten().formErrors.join(" ") ??
        "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const slugTaken = await prisma.collection.findUnique({ where: { slug: data.slug } });
  if (slugTaken) return { success: false as const, error: "المسار مستخدم بالفعل" };

  try {
    const conditionsJson =
      data.type === "AUTOMATIC"
        ? JSON.stringify({ matchType: data.matchType, conditions: data.conditions })
        : null;

    const col = await prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image ?? null,
        type: data.type,
        conditions: conditionsJson,
        products:
          data.type === "MANUAL" && data.productIds.length > 0
            ? { connect: data.productIds.map((id) => ({ id })) }
            : undefined,
      },
    });

    revalidateCollectionRoutes(col.slug);
    return { success: true as const, data: { id: col.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء المجموعة" };
  }
}

export async function updateCollection(collectionId: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = collectionAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        parsed.error.flatten().formErrors.join(" ") ??
        "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const existing = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!existing) return { success: false as const, error: "المجموعة غير موجودة" };

  const slugTaken = await prisma.collection.findFirst({
    where: { slug: data.slug, NOT: { id: collectionId } },
  });
  if (slugTaken) return { success: false as const, error: "المسار مستخدم لمجموعة أخرى" };

  try {
    const conditionsJson =
      data.type === "AUTOMATIC"
        ? JSON.stringify({ matchType: data.matchType, conditions: data.conditions })
        : null;

    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image ?? null,
        type: data.type,
        conditions: conditionsJson,
        products:
          data.type === "MANUAL"
            ? { set: data.productIds.map((id) => ({ id })) }
            : { set: [] },
      },
    });

    revalidateCollectionRoutes(existing.slug);
    if (existing.slug !== data.slug) revalidateCollectionRoutes(data.slug);
    return { success: true as const, data: { id: collectionId } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل تحديث المجموعة" };
  }
}

export async function deleteCollection(collectionId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const existing = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!existing) return { success: false as const, error: "المجموعة غير موجودة" };

  try {
    await prisma.collection.delete({ where: { id: collectionId } });
    revalidateCollectionRoutes(existing.slug);
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}

export type { CollectionAdminInput };
