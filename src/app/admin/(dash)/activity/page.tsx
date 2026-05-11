import { ActivityAdmin } from "@/components/admin/activity/activity-admin";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");

  const g = (k: string) => {
    const v = searchParams[k];
    return typeof v === "string" ? v : undefined;
  };

  const userId = g("userId");
  const entity = g("entity");
  const action = g("action");
  const from = g("from");
  const to = g("to");

  const where: Prisma.ActivityLogWhereInput = {};
  if (userId) where.userId = userId;
  if (entity) where.entity = { contains: entity };
  if (action) where.action = { contains: action };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [logs, users] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 400,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { email: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const rows = logs.map((l) => ({
    id: l.id,
    userName: l.user?.name ?? l.user?.email ?? null,
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    metadata: l.metadata,
    createdAt: l.createdAt,
  }));

  return (
    <ActivityAdmin
      rows={rows}
      users={users}
      filters={{ userId, entity, action, from, to }}
    />
  );
}
