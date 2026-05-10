"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

export function CartClient() {
  const { lines, setQty, remove } = useCartStore();

  const subtotal = lines.reduce((acc, l) => acc + l.price * l.qty, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black">سلة التسوق</h1>
        <p className="mt-1 text-sm text-[#696969]">
          My Cart {lines.length} Items — مطابق لتسمية المرجع
        </p>
      </div>

      {lines.length === 0 ? (
        <Card className="border-[#f0f0f0]">
          <CardHeader>
            <CardTitle>سلة التسوق فارغة</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-black text-white hover:bg-[#343434]">
              <Link href="/collections">تصفحي المجموعات</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {lines.map((line) => (
              <Card key={line.productId} className="border-[#f0f0f0]">
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md bg-[#fafafa]">
                    <Image src={line.image} alt={line.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="font-semibold text-black">{line.name}</div>
                    <div className="text-sm text-[#00BF0E]">{formatMad(line.price)}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-[#f0f0f0]"
                        onClick={() => setQty(line.productId, line.qty - 1)}
                      >
                        -
                      </Button>
                      <div className="w-10 text-center text-sm font-semibold">{line.qty}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-[#f0f0f0]"
                        onClick={() => setQty(line.productId, line.qty + 1)}
                      >
                        +
                      </Button>
                      <Button variant="ghost" className="text-destructive" onClick={() => remove(line.productId)}>
                        حذف
                      </Button>
                    </div>
                  </div>
                  <div className="font-bold text-[#00BF0E]">{formatMad(line.price * line.qty)}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit border-[#f0f0f0]">
            <CardHeader>
              <CardTitle>ملخص السلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>المجموع الفرعي</span>
                <span className="font-semibold text-[#00BF0E]">{formatMad(subtotal)}</span>
              </div>
              <Button asChild className="w-full bg-black text-white hover:bg-[#343434]">
                <Link href="/checkout">إتمام الطلب</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white">
                <Link href="/collections">متابعة التسوق</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
