"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ProductReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rating,
        title: title || undefined,
        body,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
      }),
    });
    setPending(false);
    if (!res.ok) {
      toast.error("تعذر إرسال المراجعة");
      return;
    }
    toast.success("شكراً! ستُنشر المراجعة بعد الاعتماد.");
    setBody("");
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-[#f0f0f0] p-4">
      <p className="text-sm font-medium text-black">أضيفي تقييماً</p>
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#696969]">التقييم</label>
        <select
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} نجوم
            </option>
          ))}
        </select>
      </div>
      <Input dir="rtl" placeholder="عنوان اختياري" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        dir="rtl"
        required
        minLength={10}
        placeholder="رأيكِ بالتفصيل..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input dir="rtl" placeholder="الاسم (اختياري)" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
        <Input
          dir="ltr"
          type="email"
          className="text-left"
          placeholder="البريد (اختياري)"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending} className="bg-black text-white hover:bg-[#343434]">
        إرسال
      </Button>
    </form>
  );
}
