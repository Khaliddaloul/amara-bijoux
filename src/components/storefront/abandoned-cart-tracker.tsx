"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";

const STORAGE_KEY = "amara-abandoned-cart-id";
const DEBOUNCE_MS = 30_000;

type Props = {
  contactEmail?: string;
  contactPhone?: string;
};

/** Lightweight tracker — records the active cart state 30s after the last change. */
export function AbandonedCartTracker({ contactEmail, contactPhone }: Props) {
  const lines = useCartStore((s) => s.lines);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSignatureRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lines.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const signature = JSON.stringify({
      lines: lines.map((l) => ({ id: l.productId, qty: l.qty })),
      email: contactEmail ?? null,
      phone: contactPhone ?? null,
    });
    if (signature === lastSignatureRef.current) return;
    lastSignatureRef.current = signature;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
          const cartId = window.localStorage.getItem(STORAGE_KEY);
          const res = await fetch("/api/abandoned-carts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerEmail: contactEmail || null,
              customerPhone: contactPhone || null,
              items: lines.map((l) => ({
                productId: l.productId,
                name: l.name,
                price: l.price,
                qty: l.qty,
                image: l.image ?? null,
              })),
              subtotal,
              cartId,
            }),
          });
          const data = (await res.json().catch(() => null)) as
            | { ok?: boolean; cartId?: string }
            | null;
          if (data?.ok && data.cartId) {
            window.localStorage.setItem(STORAGE_KEY, data.cartId);
          }
        } catch {
          // silent — tracking is best-effort
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lines, contactEmail, contactPhone]);

  return null;
}
