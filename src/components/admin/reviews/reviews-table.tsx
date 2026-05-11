"use client";

import { Check, Loader2, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  approveReview,
  deleteReview,
  rejectReview,
} from "@/actions/admin/reviews";
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

export type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
  customerLabel: string;
  customerEmail: string | null;
  productId: string;
  productName: string;
  productSlug: string;
  createdAt: Date;
};

function Stars({ count }: { count: number }) {
  return (
    <span aria-label={`${count} نجوم`} className="text-amber-500">
      {"★".repeat(count)}
      <span className="text-muted-foreground">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export function ReviewsTable({ rows }: { rows: ReviewRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);

  const onApprove = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await approveReview(id);
      setBusyId(null);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم قبول المراجعة");
      router.refresh();
    });
  };

  const onReject = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await rejectReview(id);
      setBusyId(null);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم رفض المراجعة");
      router.refresh();
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await deleteReview(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حذف المراجعة");
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">المنتج</th>
              <th className="p-3 text-right">العميل</th>
              <th className="p-3 text-right">التقييم</th>
              <th className="p-3 text-right">المراجعة</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد مراجعات.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="p-3">
                    <Link
                      href={`/product/${row.productSlug}`}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {row.productName}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{row.customerLabel}</div>
                    {row.customerEmail ? (
                      <div className="text-xs text-muted-foreground">{row.customerEmail}</div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <Stars count={row.rating} />
                  </td>
                  <td className="max-w-[280px] p-3 text-xs">
                    {row.title ? <div className="font-medium">{row.title}</div> : null}
                    <p className="line-clamp-2 text-muted-foreground">{row.body}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={row.isApproved ? "success" : "secondary"}>
                      {row.isApproved ? "موافق" : "في انتظار"}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleDateString("ar-MA")}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {row.isApproved ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending && busyId === row.id}
                          onClick={() => onReject(row.id)}
                        >
                          <X className="ms-1 h-4 w-4" />
                          إلغاء الاعتماد
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700"
                          disabled={pending && busyId === row.id}
                          onClick={() => onApprove(row.id)}
                        >
                          {pending && busyId === row.id ? (
                            <Loader2 className="ms-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="ms-1 h-4 w-4" />
                          )}
                          قبول
                        </Button>
                      )}
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
            <AlertDialogTitle>حذف المراجعة؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع.</AlertDialogDescription>
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
