import { PaymentsAdminForm } from "@/components/admin/payments/payments-admin-form";
import { getPaymentMethods } from "@/lib/payment-settings";

export default async function PaymentsPage() {
  const initial = await getPaymentMethods();
  return <PaymentsAdminForm initial={initial} />;
}
