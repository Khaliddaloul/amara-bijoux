"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCollection } from "@/actions/admin/collections";
import {
  CollectionFormDialog,
  type CollectionFormInitial,
} from "@/components/admin/collections/collection-form-dialog";
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

export type CollectionRow = CollectionFormInitial & {
  productCount: number;
};

type Props = {
  rows: CollectionRow[];
  products: { id: string; name: string }[];
};

export function CollectionsTable({ rows, products }: Props) {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState<CollectionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CollectionRow | null>(null);
  const [pending, startTransition] = useTransition();

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await deleteCollection(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حذف المجموعة");
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">المنتجات</th>
              <th className="p-3 text-right">المسار</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد مجموعات. أنشئي مجموعة جديدة.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {row.image ? (
                          <Image
                            src={row.image}
                            alt={row.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized={row.image.startsWith("/uploads")}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{row.name}</div>
                        <Link
                          href={`/collection/${row.slug}`}
                          target="_blank"
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          عرض في المتجر
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={row.type === "AUTOMATIC" ? "success" : "secondary"}>
                      {row.type === "AUTOMATIC" ? "تلقائية" : "يدوية"}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    {row.type === "AUTOMATIC" ? `${row.productCount} (محسوب)` : row.productCount}
                  </td>
                  <td className="p-3 font-mono text-xs">{row.slug}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {editTarget ? (
        <CollectionFormDialog
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          mode="edit"
          initial={editTarget}
          products={products}
        />
      ) : null}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف «{deleteTarget?.name}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستُحذف المجموعة فقط — لن تُحذف المنتجات. لا يمكن التراجع.
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
