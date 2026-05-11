import { CheckoutClient } from "./checkout-client";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { getPaymentMethods } from "@/lib/payment-settings";
import { listShippingCities } from "@/lib/shipping";
import { getStorePublicSettings } from "@/lib/store-settings";

export default async function CheckoutPage() {
  const [paymentMethods, cities, { general }] = await Promise.all([
    getPaymentMethods(),
    listShippingCities(),
    getStorePublicSettings(),
  ]);

  return (
    <StorefrontShell>
      <CheckoutClient cities={cities} paymentMethods={paymentMethods} currency={general.currency} />
    </StorefrontShell>
  );
}
