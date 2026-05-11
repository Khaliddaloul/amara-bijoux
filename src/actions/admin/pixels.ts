"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";
import { pixelsAdminSchema, type PixelsAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

const KEY = "marketing.pixels";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function saveMarketingPixels(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = pixelsAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data: PixelsAdminInput = parsed.data;

  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: stringifyJson(data) },
    update: { value: stringifyJson(data) },
  });

  revalidatePath("/admin/marketing/pixels");
  revalidatePath("/", "layout");
  return { success: true as const };
}
