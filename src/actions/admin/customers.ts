"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  customerAdminSchema,
  type CustomerAdminInput,
} from "@/lib/validations/customer-admin";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

export async function createCustomer(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = customerAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  if (data.email) {
    const exists = await prisma.customer.findUnique({ where: { email: data.email } });
    if (exists) return { success: false as const, error: "البريد مستخدم مسبقاً" };
  }

  try {
    const c = await prisma.customer.create({
      data: {
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        tags: JSON.stringify(data.tags ?? []),
        notes: data.notes ?? null,
      },
    });
    revalidatePath("/admin/customers");
    return { success: true as const, data: { id: c.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء العميل" };
  }
}

export async function updateCustomer(customerId: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = customerAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "بيانات غير صالحة",
    };
  }
  const data = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) return { success: false as const, error: "العميل غير موجود" };

  if (data.email && data.email !== existing.email) {
    const taken = await prisma.customer.findFirst({
      where: { email: data.email, NOT: { id: customerId } },
    });
    if (taken) return { success: false as const, error: "البريد مستخدم لعميل آخر" };
  }

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        tags: JSON.stringify(data.tags ?? []),
        notes: data.notes ?? null,
      },
    });
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true as const, data: { id: customerId } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث" };
  }
}

export async function deleteCustomer(customerId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.order.updateMany({
      where: { customerId },
      data: { customerId: null },
    });
    await prisma.customer.delete({ where: { id: customerId } });
    revalidatePath("/admin/customers");
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportCustomersCsv(): Promise<{ success: true; csv: string } | { success: false; error: string }> {
  const authz = await requireSession();
  if (!authz.ok) return { success: false, error: authz.error };

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });

  const headers = [
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "ordersCount",
    "totalSpent",
    "lastOrderAt",
    "tags",
    "createdAt",
  ];
  const lines = [headers.join(",")];
  for (const c of customers) {
    let tags: string[] = [];
    try {
      tags = JSON.parse(c.tags ?? "[]") as string[];
    } catch {
      tags = [];
    }
    const last = c.orders[0]?.createdAt?.toISOString() ?? "";
    lines.push(
      [
        c.id,
        c.firstName ?? "",
        c.lastName ?? "",
        c.email ?? "",
        c.phone ?? "",
        c._count.orders,
        c.totalSpent,
        last,
        tags.join("|"),
        c.createdAt.toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return { success: true, csv: lines.join("\n") };
}

export type { CustomerAdminInput };
