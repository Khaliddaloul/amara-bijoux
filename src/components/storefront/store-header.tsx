"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export type NavItem = { id: string; label: string; url: string };

export function StoreHeader({
  navItems,
  logoUrl,
}: {
  navItems: NavItem[];
  logoUrl: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCartStore((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const nav = navItems.length ? navItems : [{ id: "h", label: "الرئيسية", url: "/" }];

  const active = useMemo(() => pathname, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setSearchOpen(false);
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#f0f0f0] bg-white">
        <div className="relative mx-auto flex h-[72px] max-w-6xl items-center px-4 md:h-[80px]">
          <div className="flex flex-1 items-center gap-2 md:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-black"
              aria-label="القائمة"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="rounded-md p-2 text-black"
              aria-label="بحث"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-6 w-6" />
            </button>
          </div>

          <nav className="hidden flex-1 justify-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className={`text-sm font-medium text-black transition hover:opacity-70 ${
                  active === item.url ? "underline decoration-2 underline-offset-4" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <Image
              src={logoUrl || "/logo.png"}
              alt="Logo"
              width={160}
              height={48}
              className="h-10 w-auto max-w-[160px] object-contain md:h-12"
              priority
              unoptimized={(logoUrl || "").startsWith("/uploads")}
            />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
            <button
              type="button"
              className="hidden rounded-md p-2 text-black md:block"
              aria-label="بحث"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/cart" className="relative rounded-md p-2 text-black">
              <ShoppingBag className="h-6 w-6" />
              {count > 0 ? (
                <span className="absolute end-0 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute end-0 top-0 flex h-full w-[280px] flex-col bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">القائمة</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="إغلاق">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-base font-medium">
              {nav.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-[#f0f0f0] py-3 text-black"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="py-3 text-black">
                السلة {count ? `(${count})` : ""}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/50 p-4 md:items-start md:justify-center md:p-8">
          <div className="mx-auto mt-16 w-full max-w-xl rounded-lg bg-white p-4 shadow-xl md:mt-0">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">بحث عن منتج</span>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="إغلاق">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-[#f0f0f0] px-3 py-2 text-sm outline-none ring-black focus:ring-2"
                placeholder="اكتبي اسم المنتج..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              >
                بحث
              </button>
            </form>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="إغلاق"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
