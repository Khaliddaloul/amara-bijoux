"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { adminNavigation } from "@/lib/admin-nav";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const tNav = useTranslations("adminNav");

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-l bg-card transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b px-3">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          {!collapsed && <span className="text-sm">{tNav("brand")}</span>}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={tNav("collapse")}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {adminNavigation.map((section) => (
          <div key={section.labelKey} className="space-y-2">
            {!collapsed && (
              <p className="px-2 text-xs font-medium text-muted-foreground">
                {tNav(`sections.${section.labelKey}`)}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                const isExternal = item.badge === "public";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={isExternal ? "_blank" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
                      active && "bg-muted font-medium text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate">{tNav(`items.${item.titleKey}`)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
