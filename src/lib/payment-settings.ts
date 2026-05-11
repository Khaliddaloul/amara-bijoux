import { prisma } from "@/lib/prisma";
import {
  defaultPaymentMethods,
  paymentMethodsSchema,
  type PaymentMethodsInput,
} from "@/lib/validations/payment-methods";

export async function getPaymentMethods(): Promise<PaymentMethodsInput> {
  const row = await prisma.setting.findUnique({ where: { key: "payment.methods" } });
  if (!row?.value) return defaultPaymentMethods();
  try {
    const parsed = paymentMethodsSchema.safeParse(JSON.parse(row.value));
    return parsed.success ? parsed.data : defaultPaymentMethods();
  } catch {
    return defaultPaymentMethods();
  }
}
