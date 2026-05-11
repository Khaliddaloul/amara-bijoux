import { z } from "zod";

export const paymentMethodsSchema = z.object({
  cod: z.object({
    enabled: z.boolean(),
    extraFee: z.coerce.number().min(0),
    customerMessage: z.string().max(500).optional().nullable(),
  }),
  bankTransfer: z.object({
    enabled: z.boolean(),
    bankName: z.string().max(120).optional().nullable(),
    accountNumber: z.string().max(80).optional().nullable(),
    accountHolder: z.string().max(120).optional().nullable(),
    rib: z.string().max(80).optional().nullable(),
  }),
  card: z.object({
    enabled: z.boolean(),
    disclaimer: z.string().max(500).optional().nullable(),
  }),
});

export type PaymentMethodsInput = z.infer<typeof paymentMethodsSchema>;

export const defaultPaymentMethods = (): PaymentMethodsInput => ({
  cod: { enabled: true, extraFee: 0, customerMessage: "ادفعي عند استلام الطلب." },
  bankTransfer: {
    enabled: true,
    bankName: "CIH Bank",
    accountNumber: "—",
    accountHolder: "أمارا للمجوهرات",
    rib: "—",
  },
  card: { enabled: false, disclaimer: "قيد التطوير — الدفع بالبطاقة غير متاح حالياً." },
});
