import { CheckoutClient } from "./checkout-client";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { getPaymentMethods } from "@/lib/payment-settings";
import { listShippingCities } from "@/lib/shipping";

export default async function CheckoutPage() {
  const [paymentMethods, cities] = await Promise.all([getPaymentMethods(), listShippingCities()]);

  return (
    <StorefrontShell>
      <CheckoutClient cities={cities} paymentMethods={paymentMethods} />
    </StorefrontShell>
  );
}
