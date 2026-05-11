"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteDiscount } from "@/actions/admin/discounts";
import {
  DiscountFormDialog,
  type DiscountFormInitial,
} from "@/components/admin/discounts/discount-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMad } from "@/lib/format";

export type DiscountRow = DiscountFormInitial & {
  usedCount: number;
  createdAt: Date;
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-MA");
}

function getStatus(row: DiscountRow): { label: string; variant: "success" | "secondary" | "destructive" } {
  if (!row.isActive) return { label: "غير نشط", variant: "secondary" };
  const now = new Date();
  if (row.endsAt && now > new Date(row.endsAt))
    return { label: "منتهٍ", variant: "destructive" };
  if (row.startsAt && now < new Date(row.startsAt))
    return { label: "مجدول", variant: "secondary" };
  if (row.usageLimit != null && row.usedCount >= row.usageLimit)
    return { label: "مستنفد", variant: "destructive" };
  return { label: "نشط", variant: "success" };
}

export function DiscountsTable({ rows }: { rows: DiscountRow[] }) {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState<DiscountRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiscountRow | null>(null);
  const [pending, startTransition] = useTransition();

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await deleteDiscount(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حذف الكود");
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">الكود</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">القيمة</th>
              <th className="p-3 text-right">الاستخدام</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">يبدأ — ينتهي</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد أكواد بعد.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const status = getStatus(row);
                return (
                  <tr key={row.id} className="border-t">
                    <td className="p-3 font-mono font-semibold">{row.code}</td>
                    <td className="p-3 text-xs">
                      {row.type === "PERCENTAGE"
                        ? "نسبة"
                        : row.type === "FIXED"
                          ? "قيمة"
                          : "شحن مجاني"}
                    </td>
                    <td className="p-3">
                      {row.type === "PERCENTAGE"
                        ? `${row.value}%`
                        : row.type === "FIXED"
                          ? formatMad(row.value)
                          : "—"}
                    </td>
                    <td className="p-3">
                      {row.usedCount}
                      {row.usageLimit != null ? ` / ${row.usageLimit}` : ""}
                    </td>
                    <td className="p-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {formatDate(row.startsAt)} — {formatDate(row.endsAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditTarget(row)}>
                          <Pencil className="ms-1 h-4 w-4" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 className="ms-1 h-4 w-4" />
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editTarget ? (
        <DiscountFormDialog
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          mode="edit"
          initial={editTarget}
        />
      ) : null}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف «{deleteTarget?.code}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              لن يعود الكود قابلاً للاستخدام. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelete();
              }}
            >
              {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
