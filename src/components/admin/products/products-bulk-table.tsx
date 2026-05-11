"use client";

import { Archive, ChevronDown, Loader2, Percent, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  bulkDeleteProducts,
  bulkUpdateProducts,
} from "@/actions/admin/products";
import { AdminProductDeleteButton } from "@/components/admin/admin-product-delete-button";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/storefront/product-image";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";

export type ProductTableRow = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  quantity: number;
  price: number;
  images: string;
  categoryNames: string[];
};

type CategoryOpt = { id: string; name: string };

type Props = {
  rows: ProductTableRow[];
  categories: CategoryOpt[];
};

export function ProductsBulkTable({ rows, categories }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [pickedCats, setPickedCats] = useState<string[]>([]);
  const [priceMode, setPriceMode] = useState<"percentage" | "absolute">("percentage");
  const [priceValue, setPriceValue] = useState<string>("10");

  const allChecked = rows.length > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && selected.size < rows.length;
  const selectedCount = selected.size;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set());
  };

  const runBulk = (
    fn: () => Promise<{ success: boolean; error?: string }>,
    successMsg: string,
  ) => {
    startTransition(async () => {
      const res = await fn();
      if (!res.success) {
        toast.error(res.error ?? "فشل");
        return;
      }
      toast.success(successMsg);
      setSelected(new Set());
      router.refresh();
    });
  };

  const onActivate = () =>
    runBulk(
      () => bulkUpdateProducts(selectedIds, { status: "ACTIVE" }),
      `تم تفعيل ${selectedCount} منتج`,
    );
  const onArchive = () =>
    runBulk(
      () => bulkUpdateProducts(selectedIds, { status: "ARCHIVED" }),
      `تم أرشفة ${selectedCount} منتج`,
    );

  const onApplyCategory = () => {
    setCategoryOpen(false);
    runBulk(
      () => bulkUpdateProducts(selectedIds, { setCategoryIds: pickedCats }),
      `تم تحديث الفئات لـ ${selectedCount} منتج`,
    );
    setPickedCats([]);
  };

  const onApplyPrice = () => {
    const v = Number(priceValue);
    if (!Number.isFinite(v)) {
      toast.error("أدخلي قيمة عددية");
      return;
    }
    setPriceOpen(false);
    runBulk(
      () =>
        bulkUpdateProducts(selectedIds, {
          priceAdjustment: { mode: priceMode, value: v },
        }),
      `تم تعديل أسعار ${selectedCount} منتج`,
    );
  };

  const onConfirmBulkDelete = () => {
    setDeleteOpen(false);
    runBulk(
      () => bulkDeleteProducts(selectedIds),
      `تم حذف ${selectedCount} منتج`,
    );
  };

  return (
    <>
      {selectedCount > 0 ? (
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-primary/10 px-3 py-2 text-sm">
          <span className="font-medium">{selectedCount} محدد</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" disabled={pending} onClick={onActivate}>
              تفعيل
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={onArchive}>
              <Archive className="ms-1 h-4 w-4" />
              أرشفة
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setCategoryOpen(true)}
            >
              <Tag className="ms-1 h-4 w-4" />
              تغيير الفئة
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setPriceOpen(true)}
            >
              <Percent className="ms-1 h-4 w-4" />
              تعديل السعر
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => setDeleteOpen(true)}
            >
              {pending ? (
                <Loader2 className="ms-1 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="ms-1 h-4 w-4" />
              )}
              حذف
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setSelected(new Set())}
            >
              إلغاء التحديد
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-10 p-3 text-right">
                <Checkbox
                  aria-label="تحديد الكل"
                  checked={allChecked || (someChecked && "indeterminate")}
                  onCheckedChange={(v) => toggleAll(v === true)}
                />
              </th>
              <th className="p-3 text-right">صورة</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">المخزون</th>
              <th className="p-3 text-right">السعر</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد منتجات.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <Checkbox
                      aria-label={`تحديد ${p.name}`}
                      checked={selected.has(p.id)}
                      onCheckedChange={(v) => toggleOne(p.id, v === true)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                      <ProductImage
                        src={pickProductImageUrl(p.images)}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.categoryNames.join(" · ") || "—"}
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    <Badge
                      variant={
                        p.status === "ACTIVE"
                          ? "success"
                          : p.status === "ARCHIVED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {p.status === "ACTIVE"
                        ? "نشط"
                        : p.status === "ARCHIVED"
                          ? "مؤرشف"
                          : "مسودة"}
                    </Badge>
                  </td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3 font-semibold">{formatMad(p.price)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        className="text-primary hover:underline"
                        href={`/admin/products/${p.id}`}
                      >
                        تعديل
                      </Link>
                      <AdminProductDeleteButton
                        productId={p.id}
                        productName={p.name}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تغيير الفئات</DialogTitle>
            <DialogDescription>
              ستُستبدل فئات {selectedCount} منتج بالفئات المحددة.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3">
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={pickedCats.includes(c.id)}
                  onCheckedChange={(v) =>
                    setPickedCats((prev) =>
                      v === true
                        ? [...prev, c.id]
                        : prev.filter((id) => id !== c.id),
                    )
                  }
                />
                {c.name}
              </label>
            ))}
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد فئات.</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCategoryOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={onApplyCategory} disabled={pending}>
              تطبيق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={priceOpen} onOpenChange={setPriceOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل السعر</DialogTitle>
            <DialogDescription>
              سيُعدَّل سعر {selectedCount} منتج. مثال: +10 لزيادة، أو -5 لخصم.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>طريقة التعديل</Label>
              <Select
                value={priceMode}
                onValueChange={(v) => setPriceMode(v as "percentage" | "absolute")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">نسبة %</SelectItem>
                  <SelectItem value="absolute">قيمة ثابتة (د.م.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>القيمة</Label>
              <Input
                type="number"
                step="0.01"
                dir="ltr"
                className="text-left"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                مثال: <span className="font-mono">10</span> لزيادة 10%، أو{" "}
                <span className="font-mono">-5</span> لتخفيض 5%.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPriceOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={onApplyPrice} disabled={pending}>
              تطبيق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selectedCount} منتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع. الطلبات القديمة تبقى بدون ربط بالمنتجات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                onConfirmBulkDelete();
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
