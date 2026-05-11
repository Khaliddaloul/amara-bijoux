"use client";

import { Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null | undefined;
  onChange: (next: string | null) => void;
  label?: string;
};

/** Single image uploader bound to /api/upload — used by category/collection/banner forms. */
export function SingleImageField({ value, onChange, label }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "فشل الرفع");
      onChange(data.url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "فشل الرفع";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label ? <div className="text-sm font-medium">{label}</div> : null}
      {value ? (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-2">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
            <Image
              src={value}
              alt={label ?? "image"}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized={value.startsWith("/uploads")}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Input
              dir="ltr"
              className="text-left font-mono text-xs"
              value={value}
              onChange={(e) => onChange(e.target.value || null)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2 className="ms-1 h-4 w-4" />
              إزالة
            </Button>
          </div>
        </div>
      ) : null}
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 px-6 py-6 text-center text-sm text-muted-foreground transition hover:bg-muted/40",
          uploading && "opacity-60",
        )}
      >
        <Upload className="h-6 w-6 opacity-60" />
        <span>{uploading ? "جاري الرفع..." : "ارفعي صورة"}</span>
        <span className="text-xs">JPEG / PNG / WebP · حتى 5MB</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
