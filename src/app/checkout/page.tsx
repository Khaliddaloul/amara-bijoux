import { CheckoutClient } from "./checkout-client";
import { StorefrontShell } from "@/components/storefront/storefront-shell";

export default function CheckoutPage() {
  return (
    <StorefrontShell>
      <CheckoutClient />
    </StorefrontShell>
  );
}
