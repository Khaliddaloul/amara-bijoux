"use client";

import { Download, Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { exportCustomersCsv } from "@/actions/admin/customers";
import {
  CustomerFormDialog,
} from "@/components/admin/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CustomersToolbar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams(params?.toString() ?? "");
    if (q.trim()) sp.set("q", q.trim());
    else sp.delete("q");
    router.push(`/admin/customers?${sp.toString()}`);
  };

  const onExport = () => {
    startTransition(async () => {
      const res = await exportCustomersCsv();
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const blob = new Blob(["\ufeff", res.csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير CSV");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={onSearch} className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            dir="rtl"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحثي بالاسم، البريد، الهاتف..."
            className="ps-3 pe-8"
          />
        </div>
        <Button type="submit" variant="outline">
          بحث
        </Button>
      </form>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onExport} disabled={pending}>
          {pending ? (
            <Loader2 className="ms-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="ms-2 h-4 w-4" />
          )}
          تصدير CSV
        </Button>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          + عميل جديد
        </Button>
      </div>
      <CustomerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
    </div>
  );
}
