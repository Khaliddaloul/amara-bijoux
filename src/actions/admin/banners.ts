"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bannerAdminSchema, type BannerAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function createBanner(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = bannerAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data: BannerAdminInput = parsed.data;

  await prisma.homeBanner.create({
    data: {
      title: data.title ?? null,
      subtitle: data.subtitle ?? null,
      image: data.image,
      ctaLabel: data.ctaLabel ?? null,
      ctaHref: data.ctaHref ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/content/banners");
  revalidatePath("/");
  return { success: true as const };
}

export async function updateBanner(id: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = bannerAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  await prisma.homeBanner.update({
    where: { id },
    data: {
      title: data.title ?? null,
      subtitle: data.subtitle ?? null,
      image: data.image,
      ctaLabel: data.ctaLabel ?? null,
      ctaHref: data.ctaHref ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/content/banners");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteBanner(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.homeBanner.delete({ where: { id } });
  revalidatePath("/admin/content/banners");
  revalidatePath("/");
  return { success: true as const };
}
