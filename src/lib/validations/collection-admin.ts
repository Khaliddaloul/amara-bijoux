import { z } from "zod";

const emptyToNull = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.string().nullable().optional(),
);

export const COLLECTION_CONDITION_FIELDS = [
  "price",
  "tag",
  "vendor",
  "name",
  "category",
] as const;
export const COLLECTION_CONDITION_OPERATORS = [
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "contains",
] as const;

export const collectionConditionSchema = z.object({
  field: z.enum(COLLECTION_CONDITION_FIELDS),
  operator: z.enum(COLLECTION_CONDITION_OPERATORS),
  value: z.string().min(1, "أدخلي قيمة"),
});

export type CollectionCondition = z.infer<typeof collectionConditionSchema>;

export const collectionAdminSchema = z
  .object({
    name: z.string().min(1, "الاسم مطلوب"),
    slug: z
      .string()
      .min(1, "المسار مطلوب")
      .refine(
        (s) => /^[\w\u0600-\u06FF]+(?:-[\w\u0600-\u06FF]+)*$/.test(s),
        "مسار غير صالح",
      ),
    description: emptyToNull,
    image: emptyToNull,
    type: z.enum(["MANUAL", "AUTOMATIC"]),
    productIds: z.array(z.string()).default([]),
    conditions: z.array(collectionConditionSchema).max(5, "حد أقصى 5 شروط").default([]),
    matchType: z.enum(["ALL", "ANY"]).default("ALL"),
  })
  .superRefine((val, ctx) => {
    if (val.type === "AUTOMATIC" && val.conditions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "أضيفي شرطاً واحداً على الأقل",
        path: ["conditions"],
      });
    }
  });

export type CollectionAdminInput = z.infer<typeof collectionAdminSchema>;
