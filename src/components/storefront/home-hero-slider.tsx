"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export type HeroBanner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export function HomeHeroSlider({ banners }: { banners: HeroBanner[] }) {
  const valid = useMemo(() => banners.filter((b) => b.image), [banners]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (valid.length <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % valid.length);
    }, 6500);
    return () => window.clearInterval(t);
  }, [valid.length]);

  if (!valid.length) return null;

  const b = valid[idx];

  return (
    <section className="relative border-b border-[#f0f0f0]">
      <div className="relative aspect-[4/3] md:aspect-[21/9]">
        <Image
          src={b.image}
          alt={b.title ? `${b.title} — أمارا للمجوهرات` : "بانر الصفحة الرئيسية لمتجر أمارا للمجوهرات — مجوهرات مغربية"}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized={b.image.startsWith("/uploads")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-10 pt-24 text-white md:pb-14">
          {b.title ? <h2 className="text-2xl font-semibold md:text-4xl">{b.title}</h2> : null}
          {b.subtitle ? <p className="mt-2 max-w-xl text-sm text-white/90 md:text-base">{b.subtitle}</p> : null}
          {b.ctaLabel && b.ctaHref ? (
            <Button asChild className="mt-6 bg-white text-black hover:bg-white/90">
              <Link href={b.ctaHref}>{b.ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
      {valid.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="السابق"
            className="absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
            onClick={() => setIdx((i) => (i - 1 + valid.length) % valid.length)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="التالي"
            className="absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
            onClick={() => setIdx((i) => (i + 1) % valid.length)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {valid.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`شريحة ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
