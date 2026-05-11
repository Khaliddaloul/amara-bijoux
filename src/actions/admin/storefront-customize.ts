"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, stringifyJson } from "@/lib/json";
import { storefrontSectionsSchema, storefrontThemeSchema } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

const storefrontBlobSchema = z.object({
  theme: storefrontThemeSchema.optional(),
  sections: storefrontSectionsSchema.optional(),
});

export async function saveStorefrontCustomization(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = storefrontBlobSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  const row = await prisma.setting.findUnique({ where: { key: "storefront" } });
  const prev = parseJson<Record<string, unknown>>(row?.value, {});
  const next = { ...prev, ...parsed.data };

  await prisma.setting.upsert({
    where: { key: "storefront" },
    create: { key: "storefront", value: stringifyJson(next) },
    update: { value: stringifyJson(next) },
  });

  revalidatePath("/admin/storefront");
  revalidatePath("/", "layout");
  revalidatePath("/");
  return { success: true as const };
}
