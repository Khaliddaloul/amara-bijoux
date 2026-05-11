"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { AbandonedCartTracker } from "@/components/storefront/abandoned-cart-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/format";
import type { ResolveShippingResult } from "@/lib/shipping";
import type { PaymentMethodsInput } from "@/lib/validations/payment-methods";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

type Props = {
  cities: string[];
  paymentMethods: PaymentMethodsInput;
  currency: string;
};

export function CheckoutClient({ cities, paymentMethods, currency }: Props) {
  const { lines, clear, hasHydrated } = useCartStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(cities[0] ?? "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [applied, setApplied] = useState<{ amount: number; freeShipping: boolean; code: string } | null>(
    null,
  );
  const [shippingPayload, setShippingPayload] = useState<ResolveShippingResult | null>(null);
  const [rateId, setRateId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK" | "CARD">("COD");

  const subtotal = lines.reduce((acc, l) => acc + l.price * l.qty, 0);
  const netAfterDiscount = Math.max(0, subtotal - (applied?.amount ?? 0));

  useEffect(() => {
    if (!city.trim() || netAfterDiscount <= 0) {
      setShippingPayload(null);
      setRateId(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, subtotal: netAfterDiscount }),
        });
        const data = (await res.json()) as ResolveShippingResult;
        if (!cancelled) {
          setShippingPayload(data);
          const cheapest = data.cheapestRate?.id ?? data.applicableRates[0]?.id ?? null;
          setRateId((prev) => {
            if (prev && data.applicableRates.some((r) => r.id === prev)) return prev;
            return cheapest;
          });
        }
      } catch {
        if (!cancelled) {
          setShippingPayload(null);
          setRateId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city, netAfterDiscount]);

  useEffect(() => {
    if (applied?.freeShipping) setRateId(null);
  }, [applied?.freeShipping]);

  const shippingCost = useMemo(() => {
    if (applied?.freeShipping) return 0;
    const list = shippingPayload?.applicableRates ?? [];
    const picked = rateId ? list.find((r) => r.id === rateId) : shippingPayload?.cheapestRate;
    return picked?.price ?? 0;
  }, [applied?.freeShipping, shippingPayload, rateId]);

  const codFee = paymentMethod === "COD" ? paymentMethods.cod.extraFee ?? 0 : 0;

  const total = useMemo(
    () => netAfterDiscount + shippingCost + codFee,
    [netAfterDiscount, shippingCost, codFee],
  );

  useEffect(() => {
    if (paymentMethods.cod.enabled) setPaymentMethod("COD");
    else if (paymentMethods.bankTransfer.enabled) setPaymentMethod("BANK");
    else if (paymentMethods.card.enabled) setPaymentMethod("CARD");
  }, [paymentMethods]);

  async function applyDiscount() {
    if (!discountCode.trim()) {
      toast.error("أدخلي الكود");
      return;
    }
    const res = await fetch("/api/discounts/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountCode.trim(), subtotal }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      discountAmount?: number;
      freeShipping?: boolean;
      code?: string;
    };
    if (!data.ok) {
      toast.error(data.error ?? "كود غير صالح");
      return;
    }
    setApplied({
      amount: data.discountAmount ?? 0,
      freeShipping: Boolean(data.freeShipping),
      code: data.code ?? discountCode.trim(),
    });
    toast.success("تم تطبيق الكود");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    if (!city.trim()) {
      toast.error("اختيار المدينة مطلوب");
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
        discountCode: applied?.code ?? (discountCode.trim() || undefined),
        paymentMethod,
        shippingRateId: applied?.freeShipping ? undefined : rateId ?? undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error((err as { error?: string }).error ?? "تعذر إنشاء الطلب");
      return;
    }
    const data = await res.json();
    clear();
    setApplied(null);
    toast.success(`تم استلام الطلب #${data.orderNumber}`);
    window.location.href = "/";
  }

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-black">جاري تحميل السلة...</h1>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-black">لا توجد عناصر للدفع</h1>
        <Button asChild className="bg-black text-white hover:bg-[#343434]">
          <Link href="/collections">العودة للمجموعات</Link>
        </Button>
      </div>
    );
  }

  const enabledPayments: { id: "COD" | "BANK" | "CARD"; label: string }[] = [];
  if (paymentMethods.cod.enabled) enabledPayments.push({ id: "COD", label: "الدفع عند الاستلام" });
  if (paymentMethods.bankTransfer.enabled)
    enabledPayments.push({ id: "BANK", label: "تحويل بنكي" });
  if (paymentMethods.card.enabled) enabledPayments.push({ id: "CARD", label: "بطاقة (تجريبي)" });

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[2fr_1fr]">
      <AbandonedCartTracker contactPhone={phone} />
      <Card className="border-[#f0f0f0]">
        <CardHeader>
          <CardTitle>إتمام الطلب</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">الاسم الكامل</Label>
              <Input
                className="border-[#f0f0f0]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">الهاتف</Label>
              <Input
                className="border-[#f0f0f0]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">المدينة</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger className="border-[#f0f0f0]">
                  <SelectValue placeholder="اختيار المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">العنوان التفصيلي</Label>
              <Input
                className="border-[#f0f0f0]"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {shippingPayload?.zone && !applied?.freeShipping && shippingPayload.applicableRates.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-[#f0f0f0] p-3">
                <p className="text-sm font-medium text-black">
                  الشحن — {shippingPayload.zone.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {shippingPayload.applicableRates.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRateId(r.id)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        rateId === r.id
                          ? "border-black bg-black text-white"
                          : "border-[#f0f0f0] bg-white text-black hover:border-black/40"
                      }`}
                    >
                      {r.name} — {formatMoney(r.price, currency)}
                      {r.estimatedDays != null ? ` · ~${r.estimatedDays} يوم` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3 rounded-lg border border-[#f0f0f0] p-3">
              <Label className="text-sm font-medium text-black">طريقة الدفع</Label>
              <div className="flex flex-col gap-2">
                {enabledPayments.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-[#f0f0f0] p-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === p.id}
                      onChange={() => setPaymentMethod(p.id)}
                      className="accent-black"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === "COD" && paymentMethods.cod.customerMessage ? (
                <p className="text-xs text-muted-foreground">{paymentMethods.cod.customerMessage}</p>
              ) : null}
              {paymentMethod === "BANK" ? (
                <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
                  <p className="font-semibold text-black">بيانات التحويل</p>
                  <p>البنك: {paymentMethods.bankTransfer.bankName ?? "—"}</p>
                  <p>رقم الحساب: {paymentMethods.bankTransfer.accountNumber ?? "—"}</p>
                  <p>الاسم: {paymentMethods.bankTransfer.accountHolder ?? "—"}</p>
                  <p>RIB: {paymentMethods.bankTransfer.rib ?? "—"}</p>
                </div>
              ) : null}
              {paymentMethod === "CARD" ? (
                <p className="text-xs text-amber-700">{paymentMethods.card.disclaimer}</p>
              ) : null}
            </div>

            <div className="space-y-2 rounded-lg border border-[#f0f0f0] p-3">
              <Label className="text-sm font-medium text-black">كود الخصم</Label>
              <div className="flex gap-2">
                <Input
                  dir="ltr"
                  className="border-[#f0f0f0] font-mono text-left"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="WELCOME10"
                />
                <Button type="button" variant="outline" onClick={() => void applyDiscount()}>
                  تطبيق
                </Button>
              </div>
              {applied ? (
                <p className="text-xs text-[#00BF0E]">
                  تم تطبيق {applied.code}
                  {applied.freeShipping
                    ? " — شحن مجاني"
                    : applied.amount > 0
                      ? ` — خصم ${formatMoney(applied.amount, currency)}`
                      : ""}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full bg-black text-white hover:bg-[#343434]" disabled={loading}>
              {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit border-[#f0f0f0]">
        <CardHeader>
          <CardTitle>ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lines.map((l) => (
            <div key={l.productId} className="flex items-center justify-between gap-2">
              <div className="truncate">
                {l.name} × {l.qty}
              </div>
              <div className="font-semibold text-[#00BF0E]">{formatMoney(l.price * l.qty, currency)}</div>
            </div>
          ))}
          {applied && applied.amount > 0 ? (
            <div className="flex items-center justify-between text-[#F44336]">
              <span>الخصم</span>
              <span>- {formatMoney(applied.amount, currency)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-[#f0f0f0] pt-3">
            <span>الشحن</span>
            <span>
              {applied?.freeShipping ? "مجاني" : shippingCost === 0 ? "مجاني" : formatMoney(shippingCost, currency)}
            </span>
          </div>
          {codFee > 0 ? (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>رسوم الدفع عند الاستلام</span>
              <span>{formatMoney(codFee, currency)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-lg font-bold text-black">
            <span>الإجمالي</span>
            <span className="text-[#00BF0E]">{formatMoney(total, currency)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
