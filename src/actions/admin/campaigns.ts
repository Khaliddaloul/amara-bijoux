"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stringifyJson } from "@/lib/json";
import { campaignAdminSchema, type CampaignAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

function buildFilter(data: CampaignAdminInput) {
  if (data.recipientFilter === "tag") {
    return { filter: "tag", tag: data.recipientTag ?? "" };
  }
  if (data.recipientFilter === "segment") {
    return { filter: "segment" };
  }
  return { filter: "all_customers" };
}

export async function createCampaign(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = campaignAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  await prisma.marketingCampaign.create({
    data: {
      title: data.title,
      channel: data.channel,
      subject: data.subject ?? null,
      body: data.body,
      recipientFilter: stringifyJson(buildFilter(data)),
      status: "DRAFT",
      recipientCount: 0,
    },
  });
  revalidatePath("/admin/marketing/campaigns");
  return { success: true as const };
}

export async function updateCampaign(id: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = campaignAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  await prisma.marketingCampaign.update({
    where: { id },
    data: {
      title: data.title,
      channel: data.channel,
      subject: data.subject ?? null,
      body: data.body,
      recipientFilter: stringifyJson(buildFilter(data)),
    },
  });
  revalidatePath("/admin/marketing/campaigns");
  return { success: true as const };
}

export async function markCampaignSent(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.marketingCampaign.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      recipientCount: 250 + Math.floor(Math.random() * 400),
    },
  });
  revalidatePath("/admin/marketing/campaigns");
  return { success: true as const };
}

export async function deleteCampaign(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  await prisma.marketingCampaign.delete({ where: { id } });
  revalidatePath("/admin/marketing/campaigns");
  return { success: true as const };
}
