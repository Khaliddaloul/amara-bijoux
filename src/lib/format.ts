const DEFAULT_CURRENCY = "MAD";
const DEFAULT_NUMBER_LOCALE = "ar-MA";

function normalizeCurrencyCode(code: string | undefined): string {
  const trimmed = code?.trim().toUpperCase();
  if (trimmed && /^[A-Z]{3}$/.test(trimmed)) return trimmed;
  return DEFAULT_CURRENCY;
}

/** Storefront / UI money helper — pass ISO currency from `getStorePublicSettings().general.currency`. */
export function formatMoney(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  numberLocale: string = DEFAULT_NUMBER_LOCALE,
) {
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: normalizeCurrencyCode(currency),
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMad(amount: number) {
  return formatMoney(amount, "MAD", "ar-MA");
}
