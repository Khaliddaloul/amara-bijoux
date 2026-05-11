import { z } from "zod";

const emptyToNull = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.string().nullable().optional(),
);

export const categoryAdminSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  slug: z
    .string()
    .min(1, "المسار مطلوب")
    .refine((s) => /^[\w\u0600-\u06FF]+(?:-[\w\u0600-\u06FF]+)*$/.test(s), "مسار غير صالح"),
  description: emptyToNull,
  image: emptyToNull,
  parentId: emptyToNull,
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: emptyToNull,
  seoDescription: emptyToNull,
});

export type CategoryAdminInput = z.infer<typeof categoryAdminSchema>;
