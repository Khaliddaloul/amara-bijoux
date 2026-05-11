"use server";

import { auth } from "@/auth";
import { logActivity } from "@/lib/admin/activity";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["STAFF"]),
});

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function inviteStaffUser(raw: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "يجب تسجيل الدخول" };
  if (session.user.role !== "OWNER") {
    return { success: false as const, error: "غير مصرّح — المالك فقط" };
  }

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: "بريد أو دور غير صالح" };
  }

  const { email, role } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { success: false as const, error: "البريد مستخدم بالفعل" };

  const plain = randomPassword();
  const passwordHash = await bcrypt.hash(plain, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        passwordHash,
        role,
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      metadata: { email, role },
    });

    revalidatePath("/admin/settings");

    return {
      success: true as const,
      data: {
        email,
        setupUrl: `${process.env.NEXTAUTH_URL ?? ""}/admin/login`,
        temporaryPassword: plain,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء المستخدم" };
  }
}
