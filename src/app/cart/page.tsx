import { CartClient } from "./cart-client";
import { StorefrontShell } from "@/components/storefront/storefront-shell";

export default function CartPage() {
  return (
    <StorefrontShell>
      <CartClient />
    </StorefrontShell>
  );
}
