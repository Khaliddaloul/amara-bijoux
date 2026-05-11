"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("review");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

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
      toast.error(t("errorSubmit"));
      return;
    }
    toast.success(t("successSubmit"));
    setBody("");
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-[#f0f0f0] p-4">
      <p className="text-sm font-medium text-black">{t("addReview")}</p>
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#696969]">{t("rating")}</label>
        <select
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {t("starsCount", { n })}
            </option>
          ))}
        </select>
      </div>
      <Input dir={dir} placeholder={t("titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        dir={dir}
        required
        minLength={10}
        placeholder={t("bodyPlaceholder")}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input dir={dir} placeholder={t("namePlaceholder")} value={guestName} onChange={(e) => setGuestName(e.target.value)} />
        <Input
          dir="ltr"
          type="email"
          className="text-left"
          placeholder={t("emailPlaceholder")}
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending} className="bg-black text-white hover:bg-[#343434]">
        {t("submit")}
      </Button>
    </form>
  );
}
