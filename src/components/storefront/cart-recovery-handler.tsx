"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";

type RecoveredCart = {
  ok?: boolean;
  cart?: {
    id: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      qty: number;
      image?: string | null;
    }>;
  };
};

export function CartRecoveryHandler() {
  const params = useSearchParams();
  const token = params?.get("recover");
  const did = useRef(false);
  const setLinesAdd = useCartStore((s) => s.add);
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    if (!token || did.current) return;
    did.current = true;
    void (async () => {
      try {
        const res = await fetch(`/api/abandoned-carts/${encodeURIComponent(token)}`);
        if (!res.ok) return;
        const data = (await res.json()) as RecoveredCart;
        if (!data.ok || !data.cart?.items?.length) return;
        clear();
        for (const it of data.cart.items) {
          setLinesAdd({
            productId: it.productId,
            name: it.name,
            price: it.price,
            qty: it.qty,
            image: it.image ?? "",
          });
        }
        window.localStorage.setItem("amara-abandoned-cart-id", data.cart.id);
        toast.success("تم استرجاع سلتك");
      } catch {
        // silent
      }
    })();
  }, [token, setLinesAdd, clear]);

  return null;
}
