import { CartClient } from "./cart-client";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { getStorePublicSettings } from "@/lib/store-settings";

export default async function CartPage() {
  const { general } = await getStorePublicSettings();
  return (
    <StorefrontShell>
      <CartClient currency={general.currency} />
    </StorefrontShell>
  );
}
