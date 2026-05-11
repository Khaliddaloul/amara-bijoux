"use client";

import { Check, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteAbandoned,
  markAbandonedRecovered,
} from "@/actions/admin/abandoned-carts";
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

export type AbandonedCartRow = {
  id: string;
  customerEmail: string | null;
  customerPhone: string | null;
  itemCount: number;
  subtotal: number;
  recoveredAt: Date | null;
  createdAt: Date;
};

function buildWhatsappLink(phone: string, cartId: string, siteOrigin: string) {
  const recoverUrl = `${siteOrigin}/cart?recover=${encodeURIComponent(cartId)}`;
  const msg = encodeURIComponent(
    `أهلاً! لاحظنا أنكِ تركتِ بعض القطع في سلتك في أمارا للمجوهرات 💎\nيمكنكِ إكمال الطلب من هنا:\n${recoverUrl}`,
  );
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${msg}`;
}

export function AbandonedCartsTable({ rows }: { rows: AbandonedCartRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AbandonedCartRow | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const onRecover = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await markAbandonedRecovered(id);
      setBusyId(null);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم تعليمها كمستردة");
      router.refresh();
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await deleteAbandoned(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم الحذف");
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">جهة الاتصال</th>
              <th className="p-3 text-right">عناصر</th>
              <th className="p-3 text-right">المجموع</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد سلات مهجورة بعد.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{row.customerPhone ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.customerEmail ?? "—"}
                    </div>
                  </td>
                  <td className="p-3">{row.itemCount}</td>
                  <td className="p-3 font-semibold">{formatMad(row.subtotal)}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString("ar-MA")}
                  </td>
                  <td className="p-3">
                    {row.recoveredAt ? (
                      <Badge variant="success">مستردة</Badge>
                    ) : (
                      <Badge variant="secondary">مهجورة</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {row.customerPhone ? (
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={buildWhatsappLink(row.customerPhone, row.id, origin)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="ms-1 h-4 w-4" />
                            واتساب
                          </a>
                        </Button>
                      ) : null}
                      {!row.recoveredAt ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700"
                          disabled={pending && busyId === row.id}
                          onClick={() => onRecover(row.id)}
                        >
                          {pending && busyId === row.id ? (
                            <Loader2 className="ms-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="ms-1 h-4 w-4" />
                          )}
                          مستردة
                        </Button>
                      ) : null}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف السلة المهجورة؟</AlertDialogTitle>
            <AlertDialogDescription>لن يمكن استرجاعها بعد الحذف.</AlertDialogDescription>
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
