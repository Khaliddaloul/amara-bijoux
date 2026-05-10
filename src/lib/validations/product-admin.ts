import { z } from "zod";

const emptyToNullNum = z.preprocess((v) => {
  if (v === "" || v === undefined || v === null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}, z.number().nullable().optional());

export const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().default(""),
});

export const productVariantSchema = z.object({
  id: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.string().optional()),
  title: z.string().min(1, "عنوان المتغير مطلوب"),
  sku: z.string().optional().nullable(),
  price: emptyToNullNum,
  quantity: z.coerce.number().int().min(0),
  options: z.record(z.string()).optional().default({}),
});

export const productAdminSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  slug: z
    .string()
    .min(1, "المسار مطلوب")
    .refine((s) => /^[\w\u0600-\u06FF]+(?:-[\w\u0600-\u06FF]+)*$/.test(s), "مسار غير صالح"),
  shortDescription: z.string().optional().default(""),
  description: z.string().default("<p></p>"),
  price: z.coerce.number().min(0),
  compareAtPrice: emptyToNullNum,
  costPerItem: emptyToNullNum,
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0),
  trackQuantity: z.boolean(),
  weight: emptyToNullNum,
  taxable: z.boolean(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  vendor: z.string().optional().nullable(),
  tags: z.array(z.string()),
  categoryIds: z.array(z.string()),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  images: z.array(productImageSchema),
  variants: z.array(productVariantSchema),
});

export type ProductAdminInput = z.infer<typeof productAdminSchema>;
