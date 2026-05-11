import { prisma } from "@/lib/prisma";

export type LogActivityInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
};

export async function logActivity(input: LogActivityInput) {
  await prisma.activityLog.create({
    data: {
      userId: input.userId ?? undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? undefined,
      metadata: input.metadata !== undefined ? JSON.stringify(input.metadata) : undefined,
    },
  });
}
