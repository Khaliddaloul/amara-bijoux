"use client";

import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { AdminCommandMenu } from "@/components/admin/admin-command-menu";
import { AdminNotificationsDropdown } from "@/components/admin/admin-notifications-dropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, User } from "lucide-react";

export function AdminTopBar() {
  const { data } = useSession();
  const { theme, setTheme } = useTheme();

  const initials =
    (data?.user?.name ?? data?.user?.email ?? "?")
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <AdminCommandMenu />
      <AdminNotificationsDropdown />
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="relative"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="تبديل الوضع"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 m-auto h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {initials}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm md:inline">{data?.user?.email}</span>
            <User className="hidden h-4 w-4 opacity-50 md:inline" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="space-y-1">
            <div className="text-sm font-medium">{data?.user?.name ?? "مسؤول"}</div>
            <div className="text-xs text-muted-foreground">{data?.user?.email}</div>
            <div className="text-xs text-muted-foreground">الدور: {data?.user?.role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">عرض المتجر</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
