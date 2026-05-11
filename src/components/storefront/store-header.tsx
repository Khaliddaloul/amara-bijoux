"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useCartStore } from "@/store/cart-store";
import { LanguageSwitcher } from "@/components/language-switcher";

export function StoreHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("header");
  const tCommon = useTranslations("common");
  const count = useCartStore((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const NAV = useMemo(
    () => [
      { href: "/", label: t("home") },
      { href: "/about", label: t("about") },
      { href: "/contact", label: t("contact") },
      { href: "/collections", label: t("collections") },
    ],
    [t],
  );

  const active = pathname;

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
          {/* Mobile: menu + search */}
          <div className="flex flex-1 items-center gap-2 md:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-black"
              aria-label={t("openMenu")}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="rounded-md p-2 text-black"
              aria-label={tCommon("search")}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden flex-1 justify-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium text-black transition hover:opacity-70 ${
                  active === item.href ? "underline decoration-2 underline-offset-4" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logo centered */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="Amarat Sensation Accessories"
              width={160}
              height={48}
              className="h-10 w-auto object-contain md:h-12"
              priority
            />
          </Link>

          {/* Right cluster */}
          <div className="flex flex-1 items-center justify-end gap-1 md:gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              className="hidden rounded-md p-2 text-black md:block"
              aria-label={tCommon("search")}
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

      {/* Mobile slide-over nav */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={tCommon("close")}
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute end-0 top-0 flex h-full w-[280px] flex-col bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">{tCommon("menu")}</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label={tCommon("close")}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-base font-medium">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-[#f0f0f0] py-3 text-black"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="py-3 text-black">
                {t("cart")} {count ? `(${count})` : ""}
              </Link>
              <div className="mt-2 border-t border-[#f0f0f0] pt-4">
                <LanguageSwitcher variant="default" />
              </div>
            </nav>
          </div>
        </div>
      ) : null}

      {/* Search overlay */}
      {searchOpen ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/50 p-4 md:items-start md:justify-center md:p-8">
          <div className="mx-auto mt-16 w-full max-w-xl rounded-lg bg-white p-4 shadow-xl md:mt-0">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{tCommon("searchProduct")}</span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label={tCommon("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-[#f0f0f0] px-3 py-2 text-sm outline-none ring-black focus:ring-2"
                placeholder={tCommon("searchPlaceholder")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              >
                {tCommon("search")}
              </button>
            </form>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label={tCommon("close")}
            onClick={() => setSearchOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
