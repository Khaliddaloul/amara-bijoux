"use client";

import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InboxPayload = {
  unreadCount: number;
  recent: Array<{
    id: string;
    title: string;
    body: string;
    link: string | null;
    createdAt: string;
    isRead: boolean;
  }>;
};

export function AdminNotificationsDropdown() {
  const [data, setData] = useState<InboxPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/notifications/inbox");
        if (!res.ok) return;
        const json = (await res.json()) as InboxPayload;
        if (!cancelled) setData(json);
      } catch {
        /* ignore */
      }
    })();
    const id = setInterval(() => {
      void fetch("/api/admin/notifications/inbox")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json && !cancelled) setData(json as InboxPayload);
        })
        .catch(() => {});
    }, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const unread = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" type="button" aria-label="الإشعارات">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -left-1 -top-1 h-5 min-w-[1.25rem] px-1 text-[10px]"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>آخر الإشعارات</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(data?.recent ?? []).length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">لا توجد إشعارات</div>
        ) : (
          (data?.recent ?? []).map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={n.link ?? "/admin/notifications"} className="flex cursor-pointer flex-col gap-1 py-2">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(n.createdAt), "PPp", { locale: ar })}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/notifications" className="w-full cursor-pointer justify-center text-center">
            عرض الكل
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
