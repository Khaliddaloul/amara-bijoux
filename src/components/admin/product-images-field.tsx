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
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ProductImageItem = { url: string; alt: string };

function SortableImage({
  item,
  index,
  isPrimary,
  onAltChange,
  onRemove,
  onMakePrimary,
}: {
  item: ProductImageItem;
  index: number;
  isPrimary: boolean;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
  onMakePrimary: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex gap-3 rounded-lg border bg-card p-2",
        isDragging && "z-10 opacity-90 shadow-lg",
        isPrimary && "ring-2 ring-primary",
      )}
    >
      <button
        type="button"
        className="mt-6 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
        <Image src={item.url} alt={item.alt || ""} fill className="object-cover" sizes="96px" unoptimized={item.url.startsWith("/uploads")} />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {isPrimary ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">رئيسية</span>
          ) : (
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onMakePrimary}>
              <Star className="h-3 w-3" />
              تعيين رئيسية
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">نص بديل (alt)</Label>
          <Input
            dir="rtl"
            value={item.alt}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder={`صورة ${index + 1}`}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute left-1 top-1 h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

type Props = {
  images: ProductImageItem[];
  onChange: (next: ProductImageItem[]) => void;
};

export function ProductImagesField({ images, onChange }: Props) {
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.url === active.id);
    const newIndex = images.findIndex((i) => i.url === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(images, oldIndex, newIndex));
  };

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const list = Array.from(files);
      for (const file of list) {
        setUploading((u) => [...u, { name: file.name, progress: 10 }]);
        const fd = new FormData();
        fd.append("file", file);
        try {
          setUploading((u) => u.map((x) => (x.name === file.name ? { ...x, progress: 60 } : x)));
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = (await res.json()) as { url?: string; error?: string };
          if (!res.ok || !data.url) throw new Error(data.error ?? "فشل الرفع");
          setUploading((u) => u.map((x) => (x.name === file.name ? { ...x, progress: 100 } : x)));
          onChange([...images, { url: data.url, alt: "" }]);
        } catch {
          setUploading((u) => u.filter((x) => x.name !== file.name));
          continue;
        }
        setTimeout(() => {
          setUploading((u) => u.filter((x) => x.name !== file.name));
        }, 400);
      }
    },
    [images, onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>الصور</CardTitle>
        <CardDescription>اسحبي لإعادة الترتيب — الأولى تُعرض كصورة رئيسية في المتجر.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={images.map((i) => i.url)} strategy={rectSortingStrategy}>
            <div className="space-y-3">
              {images.map((im, index) => (
                <SortableImage
                  key={im.url}
                  item={im}
                  index={index}
                  isPrimary={index === 0}
                  onAltChange={(alt) => {
                    const next = [...images];
                    next[index] = { ...next[index], alt };
                    onChange(next);
                  }}
                  onRemove={() => onChange(images.filter((_, i) => i !== index))}
                  onMakePrimary={() => {
                    if (index === 0) return;
                    const next = [...images];
                    const [item] = next.splice(index, 1);
                    next.unshift(item);
                    onChange(next);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground transition hover:bg-muted/40",
          )}
        >
          <Upload className="h-8 w-8 opacity-60" />
          <span>اسحبي الصور هنا أو انقري للاختيار</span>
          <span className="text-xs">JPEG / PNG / WebP · حتى 5MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            className="hidden"
            onChange={(e) => {
              void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {uploading.length > 0 ? (
          <div className="space-y-2 text-xs text-muted-foreground">
            {uploading.map((u) => (
              <div key={u.name} className="flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${u.progress}%` }} />
                </div>
                <span className="truncate">{u.name}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
