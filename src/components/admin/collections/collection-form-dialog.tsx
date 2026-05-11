"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createCollection,
  updateCollection,
} from "@/actions/admin/collections";
import { ProductsMultiSelect } from "@/components/admin/collections/products-multiselect";
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
  collectionAdminSchema,
  type CollectionAdminInput,
  type CollectionCondition,
} from "@/lib/validations/collection-admin";

export type CollectionFormInitial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  type: "MANUAL" | "AUTOMATIC";
  productIds: string[];
  conditions: CollectionCondition[];
  matchType: "ALL" | "ANY";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: CollectionFormInitial;
  products: { id: string; name: string }[];
};

function toDefaults(initial?: CollectionFormInitial): CollectionAdminInput {
  return {
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? null,
    image: initial?.image ?? null,
    type: initial?.type ?? "MANUAL",
    productIds: initial?.productIds ?? [],
    conditions: initial?.conditions ?? [],
    matchType: initial?.matchType ?? "ALL",
  };
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  products,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const slugManual = useRef(mode === "edit");

  const form = useForm<CollectionAdminInput>({
    resolver: zodResolver(collectionAdminSchema),
    defaultValues: toDefaults(initial),
  });

  const conditions = useFieldArray({ control: form.control, name: "conditions" });

  useEffect(() => {
    if (open) {
      form.reset(toDefaults(initial));
      slugManual.current = mode === "edit";
    }
  }, [open, initial, mode, form]);

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const watchedType = form.watch("type");

  useEffect(() => {
    if (mode === "edit" || slugManual.current) return;
    const next = slugFromName(watchedName || "");
    if (next && next !== watchedSlug) {
      form.setValue("slug", next, { shouldDirty: true });
    }
  }, [mode, watchedName, watchedSlug, form]);

  const onSubmit = (values: CollectionAdminInput) => {
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createCollection(values)
          : await updateCollection(initial!.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === "create" ? "تم إنشاء المجموعة" : "تم الحفظ");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "مجموعة جديدة" : "تعديل المجموعة"}
          </DialogTitle>
          <DialogDescription>
            المجموعات اليدوية تختار منتجاتها مباشرة. التلقائية تستخدم شروطاً.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <FormLabel>المسار</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        className="text-left font-mono text-sm"
                        {...field}
                        onChange={(e) => {
                          slugManual.current = true;
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المجموعة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MANUAL">يدوية — اختاري منتجات</SelectItem>
                      <SelectItem value="AUTOMATIC">تلقائية — شروط</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedType === "MANUAL" ? (
              <FormField
                control={form.control}
                name="productIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المنتجات</FormLabel>
                    <ProductsMultiSelect
                      options={products}
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                    <FormDescription>
                      ابحثي وأضيفي المنتجات التي تنتمي لهذه المجموعة.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">الشروط (حد أقصى 5)</div>
                    <div className="text-xs text-muted-foreground">
                      المنتجات التي تستوفي الشروط ستظهر تلقائياً.
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="matchType"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ALL">تطابق كل الشروط</SelectItem>
                            <SelectItem value="ANY">تطابق أي شرط</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  {conditions.fields.length === 0 ? (
                    <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      لا شروط بعد — أضيفي شرطاً.
                    </p>
                  ) : (
                    conditions.fields.map((f, index) => (
                      <div
                        key={f.id}
                        className="grid grid-cols-[1fr_1fr_2fr_auto] items-end gap-2"
                      >
                        <Controller
                          control={form.control}
                          name={`conditions.${index}.field`}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <label className="text-xs">الحقل</label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="price">السعر</SelectItem>
                                  <SelectItem value="tag">الوسم</SelectItem>
                                  <SelectItem value="vendor">المورّد</SelectItem>
                                  <SelectItem value="name">الاسم</SelectItem>
                                  <SelectItem value="category">الفئة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`conditions.${index}.operator`}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <label className="text-xs">الشرط</label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="eq">يساوي</SelectItem>
                                  <SelectItem value="contains">يحتوي</SelectItem>
                                  <SelectItem value="gt">{">"}</SelectItem>
                                  <SelectItem value="gte">{"≥"}</SelectItem>
                                  <SelectItem value="lt">{"<"}</SelectItem>
                                  <SelectItem value="lte">{"≤"}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`conditions.${index}.value`}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <label className="text-xs">القيمة</label>
                              <Input
                                dir="rtl"
                                value={field.value ?? ""}
                                onChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => conditions.remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                  {form.formState.errors.conditions?.message ? (
                    <p className="text-xs text-destructive">
                      {String(form.formState.errors.conditions.message)}
                    </p>
                  ) : null}
                  {conditions.fields.length < 5 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        conditions.append({ field: "price", operator: "gt", value: "" })
                      }
                    >
                      <Plus className="ms-1 h-4 w-4" />
                      شرط جديد
                    </Button>
                  ) : null}
                </div>
              </div>
            )}

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

type CreateBtnProps = {
  products: { id: string; name: string }[];
};

export function CollectionCreateButton({ products }: CreateBtnProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ مجموعة جديدة</Button>
      <CollectionFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        products={products}
      />
    </>
  );
}
