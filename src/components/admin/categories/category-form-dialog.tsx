"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
} from "@/actions/admin/categories";
import { SingleImageField } from "@/components/admin/single-image-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { slugFromName } from "@/lib/slugify";
import {
  categoryAdminSchema,
  type CategoryAdminInput,
} from "@/lib/validations/category-admin";

export type CategoryFormInitial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

type ParentOpt = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: CategoryFormInitial;
  parents: ParentOpt[];
};

const NONE_VALUE = "__none__";

function toDefaults(initial?: CategoryFormInitial): CategoryAdminInput {
  return {
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? null,
    image: initial?.image ?? null,
    parentId: initial?.parentId ?? null,
    sortOrder: initial?.sortOrder ?? 0,
    seoTitle: initial?.seoTitle ?? null,
    seoDescription: initial?.seoDescription ?? null,
  };
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  parents,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const slugManual = useRef(mode === "edit");

  const form = useForm<CategoryAdminInput>({
    resolver: zodResolver(categoryAdminSchema),
    defaultValues: toDefaults(initial),
  });

  useEffect(() => {
    if (open) {
      form.reset(toDefaults(initial));
      slugManual.current = mode === "edit";
    }
  }, [open, initial, mode, form]);

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");

  useEffect(() => {
    if (mode === "edit" || slugManual.current) return;
    const next = slugFromName(watchedName || "");
    if (next && next !== watchedSlug) {
      form.setValue("slug", next, { shouldDirty: true });
    }
  }, [mode, watchedName, watchedSlug, form]);

  const onSubmit = (values: CategoryAdminInput) => {
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createCategory(values)
          : await updateCategory(initial!.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === "create" ? "تم إنشاء الفئة" : "تم حفظ الفئة");
      onOpenChange(false);
      router.refresh();
    });
  };

  const parentOptions = parents.filter((p) => p.id !== initial?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "فئة جديدة" : "تعديل الفئة"}</DialogTitle>
          <DialogDescription>
            ستظهر الفئة في القائمة العامة وصفحة /category/
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input dir="rtl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المسار (slug)</FormLabel>
                  <FormControl>
                    <Input
                      dir="ltr"
                      className="text-left font-mono text-sm"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        slugManual.current = true;
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>يُولَّد تلقائياً من الاسم</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      dir="rtl"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصورة</FormLabel>
                  <SingleImageField value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة الأب</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === NONE_VALUE ? null : v)}
                      value={field.value ?? NONE_VALUE}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="بدون" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_VALUE}>— بدون —</SelectItem>
                        {parentOptions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الترتيب</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        dir="ltr"
                        className="text-left"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان SEO</FormLabel>
                  <FormControl>
                    <Input
                      dir="rtl"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف SEO</FormLabel>
                  <FormControl>
                    <Textarea
                      dir="rtl"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="ms-2 h-4 w-4" />
                )}
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type TriggerProps = {
  parents: ParentOpt[];
  buttonLabel?: string;
};

export function CategoryCreateButton({ parents, buttonLabel = "+ فئة جديدة" }: TriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        parents={parents}
      />
    </>
  );
}
