"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

export function AddToCart({
  product,
}: {
  product: { id: string; name: string; price: number; image: string };
}) {
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-md border px-2 py-1">
        <Button type="button" variant="outline" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          -
        </Button>
        <div className="w-10 text-center text-sm font-semibold">{qty}</div>
        <Button type="button" variant="outline" size="icon" onClick={() => setQty((q) => q + 1)}>
          +
        </Button>
      </div>
      <Button
        type="button"
        className="bg-black text-white hover:bg-[#343434]"
        onClick={() => {
          add({ productId: product.id, name: product.name, price: product.price, image: product.image, qty });
          toast.success("تمت الإضافة إلى السلة");
        }}
      >
        أضف إلى السلة
      </Button>
      <Button
        type="button"
        variant="outline"
        className="border-black text-black hover:bg-black hover:text-white"
        onClick={() => {
          add({ productId: product.id, name: product.name, price: product.price, image: product.image, qty });
          window.location.href = "/checkout";
        }}
      >
        اشترِ الآن
      </Button>
    </div>
  );
}
