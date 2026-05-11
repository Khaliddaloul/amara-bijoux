import type { Locale } from "@/i18n/config";

/**
 * Pick the right localized field from a DB object that has both base
 * (Arabic) and English variants. Falls back to the base value when the
 * English value is missing or empty.
 */
export function pickLocalized<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  baseField: keyof T,
  locale: Locale,
): string {
  if (!obj) return "";
  if (locale === "en") {
    const enField = `${String(baseField)}En` as keyof T;
    const enValue = obj[enField];
    if (typeof enValue === "string" && enValue.trim().length > 0) {
      return enValue;
    }
  }
  const baseValue = obj[baseField];
  return typeof baseValue === "string" ? baseValue : "";
}

export function pickLocalizedNullable<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  baseField: keyof T,
  locale: Locale,
): string | null {
  if (!obj) return null;
  if (locale === "en") {
    const enField = `${String(baseField)}En` as keyof T;
    const enValue = obj[enField];
    if (typeof enValue === "string" && enValue.trim().length > 0) {
      return enValue;
    }
  }
  const baseValue = obj[baseField];
  return typeof baseValue === "string" && baseValue.trim().length > 0
    ? baseValue
    : null;
}

const DEFAULT_STORE_CURRENCY = "MAD";

function normalizeCurrencyCode(code: string | undefined): string {
  const trimmed = code?.trim().toUpperCase();
  if (trimmed && /^[A-Z]{3}$/.test(trimmed)) return trimmed;
  return DEFAULT_STORE_CURRENCY;
}

/**
 * Locale-aware currency formatter using the store ISO currency (e.g. from `settings.general`).
 */
export function formatPrice(amount: number, locale: Locale, currencyCode: string = DEFAULT_STORE_CURRENCY): string {
  const localeCode = locale === "ar" ? "ar-MA" : "en-US";
  const currency = normalizeCurrencyCode(currencyCode);
  return new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Locale-aware date formatter (medium length).
 */
export function formatDate(date: Date | string | number, locale: Locale): string {
  const localeCode = locale === "ar" ? "ar-MA" : "en-US";
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
