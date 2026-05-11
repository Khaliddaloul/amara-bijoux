"use client";

import { Globe, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { useTransition } from "react";

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
  className?: string;
}

export function LanguageSwitcher({
  variant = "default",
  className = "",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");
  const [isPending, startTransition] = useTransition();

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      // Persist preference in cookie (handled by next-intl middleware too)
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      router.replace(pathname, { locale: next });
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("label")}
        className={`inline-flex items-center gap-1.5 rounded-md p-2 text-sm font-medium text-black transition hover:opacity-70 disabled:opacity-50 ${className}`}
        disabled={isPending}
      >
        <Globe className="h-5 w-5" />
        {variant === "default" ? (
          <span className="hidden text-xs font-medium uppercase md:inline">
            {locale === "ar" ? "AR" : "EN"}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleSwitch(l)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase opacity-60">{l}</span>
              <span>{localeLabels[l]}</span>
            </span>
            {l === locale ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
