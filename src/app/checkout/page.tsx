"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMad } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { lines, clear } = useCartStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = lines.reduce((acc, l) => acc + l.price * l.qty, 0);
  const shipping = subtotal > 500 ? 0 : 35;
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        phone,
        city,
        address,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.qty })),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error ?? "تعذر إنشاء الطلب");
      return;
    }
    const data = await res.json();
    clear();
    toast.success(`تم استلام الطلب #${data.orderNumber}`);
    window.location.href = "/";
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <h1 className="font-display text-2xl">لا توجد عناصر للدفع</h1>
        <Button asChild>
          <Link href="/shop">العودة للمتجر</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>بيانات الدفع عند الاستلام</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم الكامل</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الهاتف</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المدينة</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان التفصيلي</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lines.map((l) => (
            <div key={l.productId} className="flex items-center justify-between gap-2">
              <div className="truncate">
                {l.name} × {l.qty}
              </div>
              <div className="font-semibold">{formatMad(l.price * l.qty)}</div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3">
            <span>الشحن</span>
            <span>{shipping === 0 ? "مجاني" : formatMad(shipping)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span>الإجمالي</span>
            <span>{formatMad(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
