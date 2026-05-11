"use client";

import { Copy, Loader2, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMedia } from "@/actions/admin/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MediaRow = {
  id: string;
  name: string | null;
  url: string;
  type: string;
  size: number | null;
  folder: string;
  createdAt: string;
};

function formatBytes(n: number | null) {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ initial }: { initial: MediaRow[] }) {
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return initial.filter((m) => {
      if (folder !== "all" && m.folder !== folder) return false;
      if (!q.trim()) return true;
      const t = q.trim().toLowerCase();
      return (
        m.url.toLowerCase().includes(t) ||
        (m.name ?? "").toLowerCase().includes(t) ||
        m.folder.toLowerCase().includes(t)
      );
    });
  }, [initial, q, folder]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    start(async () => {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      fd.append("folder", folder === "all" ? "general" : folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { urls?: string[]; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "فشل الرفع");
        return;
      }
      toast.success(`تم رفع ${data.urls?.length ?? 0} ملف`);
      window.location.reload();
    });
  }

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(typeof window !== "undefined" ? `${window.location.origin}${url}` : url);
    toast.success("تم نسخ الرابط");
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">بحث</label>
          <div className="relative">
            <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pe-8" value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم أو مسار..." />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">المجلد</label>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="products">products</SelectItem>
              <SelectItem value="banners">banners</SelectItem>
              <SelectItem value="blog">blog</SelectItem>
              <SelectItem value="categories">categories</SelectItem>
              <SelectItem value="general">general</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={pending}>
          {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Upload className="ms-2 h-4 w-4" />}
          رفع ملفات
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">معاينة</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الحجم</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">المجلد</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" className="h-12 w-16 rounded object-cover" />
                </td>
                <td className="max-w-[200px] truncate p-3 font-mono text-xs">{m.name ?? m.url}</td>
                <td className="p-3">{formatBytes(m.size)}</td>
                <td className="p-3 text-xs">{m.type}</td>
                <td className="p-3">{m.folder}</td>
                <td className="p-3 text-xs text-muted-foreground">{m.createdAt}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => copyUrl(m.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        start(async () => {
                          const res = await deleteMedia(m.id);
                          if (!res.success) toast.error(res.error);
                          else {
                            toast.success("تم الحذف");
                            window.location.reload();
                          }
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
