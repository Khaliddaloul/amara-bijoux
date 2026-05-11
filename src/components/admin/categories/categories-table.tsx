"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategory, reorderCategories } from "@/actions/admin/categories";
import {
  CategoryFormDialog,
  type CategoryFormInitial,
} from "@/components/admin/categories/category-form-dialog";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  sortOrder: number;
  productCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

function toInitial(row: CategoryRow): CategoryFormInitial {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };
}

function SortableRow({
  row,
  onEdit,
  onDelete,
}: {
  row: CategoryRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn("border-t bg-card", isDragging && "z-10 shadow-md")}
    >
      <td className="w-10 p-2 align-middle">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="إعادة ترتيب"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="p-2 align-middle">
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
              href={`/category/${row.slug}`}
              target="_blank"
              className="text-xs text-muted-foreground hover:underline"
            >
              عرض في المتجر
            </Link>
          </div>
        </div>
      </td>
      <td className="p-2 font-mono text-xs align-middle">{row.slug}</td>
      <td className="p-2 text-sm text-muted-foreground align-middle">
        {row.parentName ?? "—"}
      </td>
      <td className="p-2 text-sm align-middle">{row.productCount}</td>
      <td className="p-2 text-sm align-middle">{row.sortOrder}</td>
      <td className="p-2 align-middle">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="ms-1 h-4 w-4" />
            تعديل
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="ms-1 h-4 w-4" />
            حذف
          </Button>
        </div>
      </td>
    </tr>
  );
}

type Props = {
  rows: CategoryRow[];
  parents: { id: string; name: string }[];
};

export function CategoriesTable({ rows: rowsProp, parents }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(rowsProp);
  const [editTarget, setEditTarget] = useState<CategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(rows, oldIndex, newIndex).map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    startTransition(async () => {
      const res = await reorderCategories(next.map((r) => r.id));
      if (!res.success) {
        toast.error(res.error);
        setRows(rowsProp);
        return;
      }
      toast.success("تم حفظ الترتيب");
      router.refresh();
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حذف الفئة");
      setRows((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="w-10 p-2" />
                <th className="p-2 text-right">الاسم</th>
                <th className="p-2 text-right">المسار</th>
                <th className="p-2 text-right">الأب</th>
                <th className="p-2 text-right">المنتجات</th>
                <th className="p-2 text-right">الترتيب</th>
                <th className="p-2 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={rows.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {rows.map((row) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    onEdit={() => setEditTarget(row)}
                    onDelete={() => setDeleteTarget(row)}
                  />
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      لا توجد فئات بعد. أنشئي فئة جديدة لتظهر هنا.
                    </td>
                  </tr>
                ) : null}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {editTarget ? (
        <CategoryFormDialog
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          mode="edit"
          initial={toInitial(editTarget)}
          parents={parents}
        />
      ) : null}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفئة «{deleteTarget?.name}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستفقد المنتجات ربطها بهذه الفئة. الفئات الفرعية ستصبح بدون أب. هذه العملية لا يمكن
              التراجع عنها.
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
