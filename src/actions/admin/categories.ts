"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  categoryAdminSchema,
  type CategoryAdminInput,
} from "@/lib/validations/category-admin";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

function revalidateCategoryRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
  if (slug) revalidatePath(`/category/${slug}`);
}

export async function createCategory(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = categoryAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().formErrors.join(" ") || "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const exists = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (exists) return { success: false as const, error: "المسار مستخدم بالفعل" };

  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent) return { success: false as const, error: "الفئة الأب غير موجودة" };
  }

  try {
    const cat = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image ?? null,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      },
    });

    revalidateCategoryRoutes(cat.slug);
    return { success: true as const, data: { id: cat.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء الفئة" };
  }
}

export async function updateCategory(categoryId: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = categoryAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().formErrors.join(" ") || "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) return { success: false as const, error: "الفئة غير موجودة" };

  const slugTaken = await prisma.category.findFirst({
    where: { slug: data.slug, NOT: { id: categoryId } },
  });
  if (slugTaken) return { success: false as const, error: "المسار مستخدم لفئة أخرى" };

  if (data.parentId && data.parentId === categoryId) {
    return { success: false as const, error: "لا يمكن اختيار الفئة كأب لنفسها" };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image ?? null,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      },
    });

    revalidateCategoryRoutes(existing.slug);
    if (existing.slug !== data.slug) revalidateCategoryRoutes(data.slug);
    return { success: true as const, data: { id: categoryId } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل تحديث الفئة" };
  }
}

export async function deleteCategory(categoryId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) return { success: false as const, error: "الفئة غير موجودة" };

  try {
    await prisma.category.updateMany({
      where: { parentId: categoryId },
      data: { parentId: null },
    });
    await prisma.category.delete({ where: { id: categoryId } });

    revalidateCategoryRoutes(existing.slug);
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}

export async function reorderCategories(orderedIds: string[]) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    revalidateCategoryRoutes();
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إعادة الترتيب" };
  }
}

export type { CategoryAdminInput };
