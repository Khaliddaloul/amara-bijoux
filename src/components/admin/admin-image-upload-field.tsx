"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  label?: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: "products" | "banners" | "blog" | "categories" | "general";
};

export function AdminImageUploadField({ label = "الصورة", value, onChange, folder }: Props) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "فشل الرفع");
        return;
      }
      onChange(data.url);
      toast.success("تم الرفع");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium leading-none">{label}</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          dir="ltr"
          className="text-left font-mono text-xs"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="/uploads/..."
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => ref.current?.click()}
        >
          <Upload className="ms-1 h-4 w-4" />
          رفع
        </Button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
      </div>
    </div>
  );
}
