"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function deleteMedia(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const row = await prisma.media.findUnique({ where: { id } });
  if (!row) return { success: false as const, error: "غير موجود" };

  await prisma.media.delete({ where: { id } });

  if (row.url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", row.url.replace(/^\//, "")));
    } catch {
      /* ignore missing file */
    }
  }

  revalidatePath("/admin/media");
  return { success: true as const };
}
