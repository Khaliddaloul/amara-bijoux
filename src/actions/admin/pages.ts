"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pageAdminSchema, type PageAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function createPage(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = pageAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data: PageAdminInput = parsed.data;

  const exists = await prisma.page.findUnique({ where: { slug: data.slug } });
  if (exists) return { success: false as const, error: "المسار مستخدم" };

  await prisma.page.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      isPublished: data.isPublished,
    },
  });
  revalidatePath("/admin/content/pages");
  revalidatePath(`/pages/${data.slug}`);
  return { success: true as const };
}

export async function updatePage(id: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = pageAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  const cur = await prisma.page.findUnique({ where: { id } });
  if (!cur) return { success: false as const, error: "الصفحة غير موجودة" };

  if (data.slug !== cur.slug) {
    const taken = await prisma.page.findUnique({ where: { slug: data.slug } });
    if (taken) return { success: false as const, error: "المسار مستخدم" };
  }

  await prisma.page.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      isPublished: data.isPublished,
    },
  });
  revalidatePath("/admin/content/pages");
  revalidatePath(`/pages/${data.slug}`);
  if (cur.slug !== data.slug) revalidatePath(`/pages/${cur.slug}`);
  return { success: true as const };
}

export async function deletePage(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const cur = await prisma.page.findUnique({ where: { id } });
  if (!cur) return { success: false as const, error: "غير موجود" };

  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/content/pages");
  revalidatePath(`/pages/${cur.slug}`);
  return { success: true as const };
}
