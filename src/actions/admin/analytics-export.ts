"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

export async function exportAnalyticsCsv(fromIso: string, toIso: string) {
  const authz = await requireAdmin();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(+from) || Number.isNaN(+to)) {
    return { success: false as const, error: "تواريخ غير صالحة" };
  }

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "asc" },
    select: {
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      customerName: true,
    },
  });

  const header = ["orderNumber", "total", "status", "createdAt", "customerName"];
  const lines = [
    header.join(","),
    ...orders.map((o) =>
      [
        o.orderNumber,
        o.total,
        o.status,
        o.createdAt.toISOString(),
        `"${o.customerName.replace(/"/g, '""')}"`,
      ].join(","),
    ),
  ];

  const csv = "\uFEFF" + lines.join("\n");
  const base64 = Buffer.from(csv, "utf8").toString("base64");

  return { success: true as const, data: { base64, filename: `analytics-${fromIso.slice(0, 10)}.csv` } };
}
