/** Labels for admin Store Settings — currency (ISO) and IANA timezone selects. */

export const STORE_SETTINGS_DEFAULT_TIMEZONE = "Africa/Casablanca";

export const STORE_SETTINGS_CURRENCY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "MAD", label: "MAD — درهم" },
  { value: "QAR", label: "QAR — ريال قطري" },
  { value: "AED", label: "AED — درهم إماراتي" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
];

export const STORE_SETTINGS_TIMEZONE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "Africa/Casablanca", label: "Africa/Casablanca — المغرب" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Qatar", label: "Asia/Qatar — قطر" },
  { value: "Asia/Dubai", label: "Asia/Dubai — الإمارات" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh — السعودية" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait — الكويت" },
  { value: "Europe/Paris", label: "Europe/Paris — فرنسا" },
  { value: "Europe/London", label: "Europe/London — المملكة المتحدة" },
];
