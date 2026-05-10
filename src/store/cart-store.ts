"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) => {
        const existing = get().lines.find((l) => l.productId === line.productId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.productId === line.productId ? { ...l, qty: l.qty + line.qty } : l,
            ),
          });
        } else {
          set({ lines: [...get().lines, line] });
        }
      },
      remove: (productId) => set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      setQty: (productId, qty) =>
        set({
          lines:
            qty <= 0
              ? get().lines.filter((l) => l.productId !== productId)
              : get().lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        }),
      clear: () => set({ lines: [] }),
    }),
    { name: "amara-cart" },
  ),
);
