import { NotificationsAdmin } from "@/components/admin/notifications/notifications-admin";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");

  const rows = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return <NotificationsAdmin rows={rows} />;
}
