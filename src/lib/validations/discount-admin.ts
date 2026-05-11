import { z } from "zod";

const optionalNumber = z.preprocess((v) => {
  if (v === "" || v === undefined || v === null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}, z.number().nullable().optional());

const optionalDate = z.preprocess((v) => {
  if (v === "" || v === undefined || v === null) return null;
  if (v instanceof Date) return v;
  const d = new Date(String(v));
  return Number.isFinite(d.getTime()) ? d : null;
}, z.date().nullable().optional());

export const discountAdminSchema = z
  .object({
    code: z
      .string()
      .min(2, "الكود قصير")
      .max(40, "الكود طويل")
      .transform((s) => s.trim().toUpperCase()),
    type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
    value: z.coerce.number().min(0),
    minPurchase: optionalNumber,
    usageLimit: optionalNumber,
    startsAt: optionalDate,
    endsAt: optionalDate,
    isActive: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.type === "PERCENTAGE" && (val.value <= 0 || val.value > 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "النسبة بين 1 و 100",
      });
    }
    if (val.type === "FIXED" && val.value <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "القيمة يجب أن تكون أكبر من 0",
      });
    }
    if (val.startsAt && val.endsAt && val.startsAt > val.endsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "تاريخ الانتهاء قبل البداية",
      });
    }
  });

export type DiscountAdminInput = z.infer<typeof discountAdminSchema>;
