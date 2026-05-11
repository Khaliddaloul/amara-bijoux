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
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMenuItem, reorderMenuItems } from "@/actions/admin/menus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MenuRow = {
  id: string;
  location: string;
  label: string;
  url: string;
  sortOrder: number;
  parentId: string | null;
};

function SortRow({ row, hrefEdit }: { row: MenuRow; hrefEdit: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-3",
        isDragging && "z-10 opacity-90 shadow-lg",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{row.label}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">{row.url}</div>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href={hrefEdit}>تعديل</Link>
      </Button>
      <MenuDeleteButton id={row.id} />
    </div>
  );
}

function MenuDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-destructive"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await deleteMenuItem(id);
          if (!res.success) toast.error(res.error);
          else {
            toast.success("تم الحذف");
            router.refresh();
          }
        })
      }
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function MenusAdmin({ initial }: { initial: MenuRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const split = useMemo(() => {
    const h = initial
      .filter((i) => i.location === "HEADER" && !i.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const f = initial
      .filter((i) => i.location === "FOOTER" && !i.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return { h, f };
  }, [initial]);

  const [headerRows, setHeaderRows] = useState(split.h);
  const [footerRows, setFooterRows] = useState(split.f);

  useEffect(() => {
    setHeaderRows(split.h);
    setFooterRows(split.f);
  }, [split]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function makeDragEnd(location: "HEADER" | "FOOTER", rows: MenuRow[], setRows: (r: MenuRow[]) => void) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = rows.map((r) => r.id);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      const moved = arrayMove(rows, oldIndex, newIndex);
      setRows(moved);
      start(async () => {
        const res = await reorderMenuItems(
          location,
          moved.map((r) => r.id),
        );
        if (!res.success) toast.error(res.error);
        else {
          toast.success("تم حفظ الترتيب");
          router.refresh();
        }
      });
    };
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">قوائم التنقل</h1>
          <p className="text-sm text-muted-foreground">اسحب لإعادة الترتيب.</p>
        </div>
        <Button asChild>
          <Link href="/admin/content/menus/new">+ عنصر جديد</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HEADER</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={makeDragEnd("HEADER", headerRows, setHeaderRows)}
          >
            <SortableContext items={headerRows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {headerRows.map((row) => (
                  <SortRow key={row.id} row={row} hrefEdit={`/admin/content/menus/${row.id}`} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {pending ? <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FOOTER</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={makeDragEnd("FOOTER", footerRows, setFooterRows)}
          >
            <SortableContext items={footerRows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {footerRows.map((row) => (
                  <SortRow key={row.id} row={row} hrefEdit={`/admin/content/menus/${row.id}`} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}
