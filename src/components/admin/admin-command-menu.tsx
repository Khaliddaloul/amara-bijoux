"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const LINKS = [
  { href: "/admin", label: "لوحة التحكم" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/shipping", label: "الشحن" },
  { href: "/admin/payments", label: "المدفوعات" },
  { href: "/admin/analytics", label: "التحليلات" },
  { href: "/admin/settings", label: "الإعدادات" },
  { href: "/admin/notifications", label: "الإشعارات" },
  { href: "/admin/activity", label: "سجل النشاط" },
];

export function AdminCommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        type="button"
        className="relative flex h-10 w-full max-w-xl flex-1 cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        بحث سريع… <kbd className="pointer-events-none me-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="انتقل إلى قسم…" dir="rtl" />
        <CommandList>
          <CommandEmpty>لا نتائج</CommandEmpty>
          <CommandGroup heading="لوحة التحكم">
            {LINKS.map((l) => (
              <CommandItem key={l.href} asChild>
                <Link href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
