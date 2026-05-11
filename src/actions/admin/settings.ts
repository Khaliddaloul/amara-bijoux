"use server";

import { auth } from "@/auth";
import { logActivity } from "@/lib/admin/activity";
import { prisma } from "@/lib/prisma";
import {
  settingsEmailTemplatesSchema,
  settingsGeneralSchema,
  settingsMessagingTemplatesSchema,
  settingsSocialSchema,
} from "@/lib/validations/settings-admin";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const, userId: session.user.id };
}

async function upsertSettingKey(authUserId: string, key: string, value: unknown) {
  const json = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: json },
    update: { value: json },
  });
  await logActivity({
    userId: authUserId,
    action: "UPDATE",
    entity: "Setting",
    entityId: key,
    metadata: { key },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function saveSettingsGeneral(raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = settingsGeneralSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  try {
    await upsertSettingKey(authz.userId, "settings.general", parsed.data);
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل الحفظ" };
  }
}

export async function saveSettingsSocial(raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = settingsSocialSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  try {
    await upsertSettingKey(authz.userId, "settings.social", parsed.data);
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل الحفظ" };
  }
}

export async function saveSettingsEmailTemplates(raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = settingsEmailTemplatesSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  try {
    await upsertSettingKey(authz.userId, "settings.emailTemplates", parsed.data);
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل الحفظ" };
  }
}

export async function saveSettingsMessagingTemplates(raw: unknown) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = settingsMessagingTemplatesSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  try {
    await upsertSettingKey(authz.userId, "settings.messagingTemplates", parsed.data);
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل الحفظ" };
  }
}
