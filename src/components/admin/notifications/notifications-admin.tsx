"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "@/i18n/routing";
import { useTransition } from "react";
import { toast } from "sonner";
import { markAllNotificationsRead } from "@/actions/admin/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

export function NotificationsAdmin({ rows }: { rows: NotificationRow[] }) {
  const [pending, startTransition] = useTransition();

  function markAll() {
    startTransition(async () => {
      const res = await markAllNotificationsRead();
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم تعليم الكل كمقروء");
      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">الإشعارات</h1>
          <p className="text-sm text-muted-foreground">آخر التنبيهات من الطلبات والمراجعات والمخزون.</p>
        </div>
        <Button type="button" variant="outline" disabled={pending} onClick={markAll}>
          تعليم الكل كمقروء
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">النوع</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>المحتوى</TableHead>
              <TableHead className="w-28">حالة</TableHead>
              <TableHead className="w-44">التاريخ</TableHead>
              <TableHead className="w-24">رابط</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((n) => (
              <TableRow key={n.id}>
                <TableCell>
                  <Badge variant="outline">{n.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{n.title}</TableCell>
                <TableCell className="max-w-md truncate text-muted-foreground">{n.body}</TableCell>
                <TableCell>{n.isRead ? "مقروء" : "جديد"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(n.createdAt, "PPp", { locale: ar })}
                </TableCell>
                <TableCell>
                  {n.link ? (
                    <Link href={n.link} className="text-primary underline">
                      فتح
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
