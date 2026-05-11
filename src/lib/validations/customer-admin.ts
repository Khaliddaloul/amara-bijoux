import { z } from "zod";

const emptyToNull = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.string().nullable().optional(),
);

export const customerAdminSchema = z.object({
  firstName: emptyToNull,
  lastName: emptyToNull,
  email: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.union([z.string().email("بريد غير صالح"), z.null()]).optional(),
  ),
  phone: emptyToNull,
  tags: z.array(z.string()).default([]),
  notes: emptyToNull,
});

export type CustomerAdminInput = z.infer<typeof customerAdminSchema>;
