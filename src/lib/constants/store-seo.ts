/**
 * نصوص ثابتة للمتجر — مركزية لتسهيل التوسّع لاحقاً (تعدد اللغات).
 */
export const STORE_NAME_SHORT = "أمارا";
export const STORE_NAME_FULL = "أمارا للمجوهرات";
export const STORE_TAGLINE = "مجوهرات مغربية فاخرة";

export const STORE_DEFAULT_DESCRIPTION =
  "متجر مجوهرات مغربي راقٍ — خواتم، قلائد، أساور، أقراط وأطقم. الدفع عند الاستلام والشحن داخل المغرب بالدرهم (MAD).";

export const STORE_KEYWORDS = [
  "مجوهرات مغربية",
  "أمارا للمجوهرات",
  "خواتم",
  "قلائد",
  "أساور",
  "أقراط",
  "أطقم ذهبية",
  "المغرب",
  "الدار البيضاء",
  "شراء مجوهرات أونلاين",
  "الدفع عند الاستلام",
] as const;

/** حقائق العرض في الفوتر (يمكن ربطها لاحقاً بإعدادات المتجر). */
export const STORE_FACTS = {
  country: "المغرب",
  yearsExperience: 8,
  happyCustomers: 12000,
  /** يُحدَّث من قاعدة البيانات عند العرض */
  productsLabel: "قطع مختارة بعناية",
} as const;
