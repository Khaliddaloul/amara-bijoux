"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StorefrontPopupPayload = {
  id: string;
  title: string;
  subtitle: string | null;
  message: string;
  image: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  delaySec: number;
  showOnExit: boolean;
  closeAfterSec: number | null;
  position: string;
  targetPages: string[];
};

const POS: Record<string, string> = {
  center: "items-center justify-center",
  "bottom-right": "items-end justify-end p-4 md:p-8",
  "bottom-left": "items-end justify-start p-4 md:p-8",
  top: "items-start justify-center p-4 pt-10",
};

function useMatchTarget(targetPages: string[], pathname: string) {
  return useMemo(() => {
    if (targetPages.includes("all")) return true;
    return targetPages.some(
      (p) => p === pathname || (p !== "/" && pathname.startsWith(p)),
    );
  }, [targetPages, pathname]);
}

export function StorefrontPopup({ popup }: { popup: StorefrontPopupPayload | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const match = useMatchTarget(popup?.targetPages ?? [], pathname ?? "");
  const storageKey = popup ? `storefront-popup-${popup.id}` : "";

  const tryOpen = useCallback(() => {
    if (!popup || !match) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey) === "1") return;
    setOpen(true);
  }, [popup, match, storageKey]);

  useEffect(() => {
    if (!popup || !match) return;
    const delay = Math.max(0, popup.delaySec) * 1000;
    const t = window.setTimeout(tryOpen, delay);
    return () => window.clearTimeout(t);
  }, [popup, match, tryOpen]);

  useEffect(() => {
    if (!popup?.showOnExit || !match) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) tryOpen();
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => document.documentElement.removeEventListener("mouseleave", onLeave);
  }, [popup?.showOnExit, match, tryOpen, popup]);

  useEffect(() => {
    if (!open || !popup?.closeAfterSec) return;
    const sec = Math.max(1, popup.closeAfterSec);
    const t = window.setTimeout(() => {
      setOpen(false);
    }, sec * 1000);
    return () => window.clearTimeout(t);
  }, [open, popup?.closeAfterSec]);

  if (!popup || !open) return null;

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* private mode */
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex bg-black/50",
        POS[popup.position] ?? POS.center,
      )}
      role="dialog"
    >
      <div
        className={cn(
          "relative max-w-lg rounded-xl border border-[#f0f0f0] bg-white p-6 shadow-2xl",
          popup.position === "center" ? "" : "mb-0 ms-0",
        )}
      >
        <button
          type="button"
          className="absolute left-3 top-3 rounded-full p-1 hover:bg-muted"
          onClick={dismiss}
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>
        {popup.image ? (
          <div className="relative mb-4 aspect-[21/9] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={popup.image}
              alt=""
              fill
              className="object-cover"
              sizes="480px"
              unoptimized={popup.image.startsWith("/uploads")}
            />
          </div>
        ) : null}
        <h3 className="text-xl font-bold text-black">{popup.title}</h3>
        {popup.subtitle ? (
          <p className="mt-1 text-sm font-medium text-[#696969]">{popup.subtitle}</p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-[#4d4d4d]">{popup.message}</p>
        {popup.ctaLabel && popup.ctaHref ? (
          <Button asChild className="mt-6 w-full bg-black text-white hover:bg-[#343434]">
            <Link href={popup.ctaHref}>{popup.ctaLabel}</Link>
          </Button>
        ) : null}
      </div>
      {popup.position === "center" ? (
        <button type="button" className="absolute inset-0 -z-10" aria-label="إغلاق" onClick={dismiss} />
      ) : null}
    </div>
  );
}

/** @deprecated use StorefrontPopup */
export const StorePopup = StorefrontPopup;
