"use client";

import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Moon, Search, Sun, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AdminTopBar() {
  const { data } = useSession();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("admin");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("search")} className="pr-10" readOnly />
      </div>
      <LanguageSwitcher />
      <Button variant="outline" size="icon" asChild>
        <Link href="/admin/notifications">
          <Bell className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="relative"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Theme toggle"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 m-auto h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="space-y-1">
            <div className="text-sm font-medium">{data?.user?.name ?? "Admin"}</div>
            <div className="text-xs text-muted-foreground">{data?.user?.email}</div>
            <div className="text-xs text-muted-foreground">{data?.user?.role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">{t("storefront")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
