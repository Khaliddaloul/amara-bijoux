import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [unreadCount, recent] = await Promise.all([
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        isRead: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ unreadCount, recent });
}
