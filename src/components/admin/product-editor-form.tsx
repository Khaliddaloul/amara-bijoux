"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createProduct, deleteProduct, duplicateProduct, updateProduct } from "@/actions/admin/products";
import { ProductImagesField, type ProductImageItem } from "@/components/admin/product-images-field";
import { ProductRichTextEditor } from "@/components/admin/product-rich-text-editor";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugFromName } from "@/lib/slugify";
import { productAdminSchema, type ProductAdminInput } from "@/lib/validations/product-admin";

export type ProductEditorInitial = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string | null;
  barcode: string | null;
  quantity: number;
  trackQuantity: boolean;
  weight: number | null;
  taxable: boolean;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  vendor: string | null;
  tags: string[];
  categoryIds: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImageItem[];
  variants: {
    id?: string;
    title: string;
    sku: string | null;
    price: number | null;
    quantity: number;
    options: Record<string, string>;
  }[];
};

type CategoryOpt = { id: string; name: string };

const defaults = (): ProductAdminInput => ({
  name: "",
  slug: "منتج",
  shortDescription: "",
  description: "<p></p>",
  price: 0,
  compareAtPrice: null,
  costPerItem: null,
  sku: null,
  barcode: null,
  quantity: 0,
  trackQuantity: true,
  weight: null,
  taxable: true,
  status: "DRAFT",
  featured: false,
  vendor: null,
  tags: [],
  categoryIds: [],
  seoTitle: null,
  seoDescription: null,
  images: [],
  variants: [],
});

function toFormValues(initial?: ProductEditorInitial): ProductAdminInput {
  if (!initial) return defaults();
  return {
    name: initial.name,
    slug: initial.slug,
    shortDescription: initial.shortDescription ?? "",
    description: initial.description || "<p></p>",
    price: initial.price,
    compareAtPrice: initial.compareAtPrice,
    costPerItem: initial.costPerItem,
    sku: initial.sku,
    barcode: initial.barcode,
    quantity: initial.quantity,
    trackQuantity: initial.trackQuantity,
    weight: initial.weight,
    taxable: initial.taxable,
    status: initial.status,
    featured: initial.featured,
    vendor: initial.vendor,
    tags: initial.tags ?? [],
    categoryIds: initial.categoryIds ?? [],
    seoTitle: initial.seoTitle,
    seoDescription: initial.seoDescription,
    images: initial.images?.length ? initial.images : [],
    variants:
      initial.variants?.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        quantity: v.quantity,
        options: v.options ?? {},
      })) ?? [],
  };
}

type Props = {
  mode: "create" | "edit";
  initial?: ProductEditorInitial;
  categories: CategoryOpt[];
};

export function ProductEditorForm({ mode, initial, categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savedHint, setSavedHint] = useState(false);
  const slugManual = useRef(false);

  const form = useForm<ProductAdminInput>({
    resolver: zodResolver(productAdminSchema),
    defaultValues: toFormValues(initial),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const watchedStatus = form.watch("status");
  const watchedSeoTitle = form.watch("seoTitle");
  const watchedSeoDesc = form.watch("seoDescription");
  const watchedImages = form.watch("images");
  const watchedTags = form.watch("tags");

  useEffect(() => {
    if (mode === "edit") return;
    if (slugManual.current) return;
    const next = slugFromName(watchedName || "");
    if (next && next !== watchedSlug) {
      form.setValue("slug", next, { shouldDirty: true });
    }
  }, [mode, watchedName, watchedSlug, form]);

  const isDirty = form.formState.isDirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const cur = form.getValues("tags");
    if (cur.includes(t)) return;
    form.setValue("tags", [...cur, t], { shouldDirty: true });
    if (tagInputRef.current) tagInputRef.current.value = "";
  };

  const onSave = (values: ProductAdminInput) => {
    startTransition(async () => {
      if (mode === "create") {
        const res = await createProduct(values);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        toast.success("تم إنشاء المنتج");
        router.push(`/admin/products/${res.data.id}`);
        router.refresh();
        return;
      }
      if (!initial) return;
      const res = await updateProduct(initial.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حفظ المنتج");
      setSavedHint(true);
      setTimeout(() => setSavedHint(false), 2500);
      form.reset(values);
      router.refresh();
    });
  };

  const onDuplicate = () => {
    if (!initial) return;
    startTransition(async () => {
      const res = await duplicateProduct(initial.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم نسخ المنتج");
      router.push(`/admin/products/${res.data.id}`);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!initial) return;
    startTransition(async () => {
      const res = await deleteProduct(initial.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حذف المنتج");
      router.push("/admin/products");
      router.refresh();
    });
  };

  const backHref = "/admin/products";
  const previewHref =
    mode === "edit" && initial ? `/product/${initial.slug}` : null;

  const statusLabel = useMemo(() => {
    if (watchedStatus === "ACTIVE") return "نشط";
    if (watchedStatus === "ARCHIVED") return "مؤرشف";
    return "مسودة";
  }, [watchedStatus]);

  const googlePreview = useMemo(() => {
    const title = watchedSeoTitle || watchedName || "عنوان";
    const desc = watchedSeoDesc || "";
    const url = typeof window !== "undefined" ? `${window.location.origin}/product/${watchedSlug}` : `/product/${watchedSlug}`;
    return { title, desc, url };
  }, [watchedSeoTitle, watchedSeoDesc, watchedName, watchedSlug]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6" dir="rtl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="-me-2 h-8 px-2" type="button" asChild>
              <Link
                href={backHref}
                onClick={(e) => {
                  if (isDirty && !window.confirm("لديك تغييرات غير محفوظة. المتابعة؟")) {
                    e.preventDefault();
                  }
                }}
              >
                ← رجوع للمنتجات
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{watchedName || "منتج جديد"}</h1>
              <Badge variant={watchedStatus === "ACTIVE" ? "success" : "secondary"}>{statusLabel}</Badge>
              {savedHint ? (
                <span className="text-sm text-accent">تم الحفظ</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mode === "edit" && initial ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      نسخ المنتج
                      <ChevronDown className="me-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="ms-2 h-4 w-4" />
                      نسخ إلى منتج جديد
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="ms-1 h-4 w-4" />
                  حذف
                </Button>
              </>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
              حفظ
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">الحالة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">مسودة</SelectItem>
                          <SelectItem value="ACTIVE">نشط</SelectItem>
                          <SelectItem value="ARCHIVED">مؤرشف</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">منتج مميز</FormLabel>
                        <FormDescription className="text-xs">يظهر في أقسام المنتجات المميزة</FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">التصنيف والوسوم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئات</FormLabel>
                      <FormDescription className="text-xs">اختيار أكثر من فئة</FormDescription>
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                        {categories.map((c) => (
                          <div key={c.id} className="flex flex-row items-center gap-2">
                            <Checkbox
                              id={`cat-${c.id}`}
                              checked={field.value?.includes(c.id)}
                              onCheckedChange={(checked) =>
                                checked
                                  ? field.onChange([...(field.value ?? []), c.id])
                                  : field.onChange(field.value?.filter((id) => id !== c.id) ?? [])
                              }
                            />
                            <Label htmlFor={`cat-${c.id}`} className="cursor-pointer font-normal">
                              {c.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المورّد</FormLabel>
                      <FormControl>
                        <Input dir="rtl" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>الوسوم</Label>
                  <div className="flex flex-wrap gap-1">
                    {watchedTags?.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button
                          type="button"
                          className="ms-1 rounded hover:bg-muted"
                          onClick={() =>
                            form.setValue(
                              "tags",
                              watchedTags.filter((x) => x !== t),
                              { shouldDirty: true },
                            )
                          }
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    ref={tagInputRef}
                    dir="rtl"
                    placeholder="أضيفي وسمًا ثم Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">إجراءات</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {previewHref ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link href={previewHref} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="ms-2 h-4 w-4" />
                      معاينة المتجر
                    </Link>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">احفظي المنتج أولاً للمعاينة</p>
                )}
                {mode === "edit" ? (
                  <>
                    <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
                      <Copy className="ms-2 h-4 w-4" />
                      نسخ
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                      حذف المنتج
                    </Button>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الأساسيات</CardTitle>
                <CardDescription>الاسم والمسار والوصف</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المنتج</FormLabel>
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
                          onChange={(e) => {
                            slugManual.current = true;
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>يُولَّد تلقائياً من الاسم حتى تعدّلينه يدوياً</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف قصير</FormLabel>
                      <FormControl>
                        <Textarea dir="rtl" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف الكامل</FormLabel>
                      <FormControl>
                        <ProductRichTextEditor value={field.value} onChange={field.onChange} disabled={pending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <ProductImagesField images={field.value as ProductImageItem[]} onChange={field.onChange} />
              )}
            />

            <Card>
              <CardHeader>
                <CardTitle>السعر والمخزون</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر (د.م.)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          dir="ltr"
                          className="text-left"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر قبل التخفيض</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          dir="ltr"
                          className="text-left"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costPerItem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التكلفة للقطعة</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          dir="ltr"
                          className="text-left"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input dir="ltr" className="text-left font-mono" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input dir="ltr" className="text-left font-mono" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكمية</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          dir="ltr"
                          className="text-left"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوزن (كغ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          dir="ltr"
                          className="text-left"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackQuantity"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2">
                      <div>
                        <FormLabel>تتبع المخزون</FormLabel>
                        <FormDescription className="text-xs">عند الإيقاف لا يُخصم المخزون تلقائياً</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>المتغيرات</CardTitle>
                  <CardDescription>لون، مقاس، أو خيارات أخرى</CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({
                      title: "متغير جديد",
                      sku: null,
                      price: null,
                      quantity: 0,
                      options: {},
                    })
                  }
                >
                  <Plus className="ms-1 h-4 w-4" />
                  إضافة
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا متغيرات — منتج بسيط دون خيارات.</p>
                ) : (
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b text-right">
                        <th className="p-2">العنوان</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">السعر</th>
                        <th className="p-2">الكمية</th>
                        <th className="p-2">خيارات JSON</th>
                        <th className="w-10 p-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((f, index) => (
                        <tr key={f.id} className="border-b">
                          <td className="p-2 align-top">
                            <input type="hidden" {...form.register(`variants.${index}.id`)} />
                            <Input dir="rtl" {...form.register(`variants.${index}.title`)} />
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              dir="ltr"
                              className="font-mono text-left"
                              {...form.register(`variants.${index}.sku`)}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Controller
                              control={form.control}
                              name={`variants.${index}.price`}
                              render={({ field: pf }) => (
                                <Input
                                  type="number"
                                  step="0.01"
                                  dir="ltr"
                                  className="text-left"
                                  value={pf.value ?? ""}
                                  onChange={(e) =>
                                    pf.onChange(e.target.value === "" ? null : Number(e.target.value))
                                  }
                                />
                              )}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              type="number"
                              dir="ltr"
                              className="text-left"
                              {...form.register(`variants.${index}.quantity`, { valueAsNumber: true })}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Controller
                              control={form.control}
                              name={`variants.${index}.options`}
                              render={({ field: of }) => (
                                <Input
                                  dir="ltr"
                                  className="font-mono text-left text-xs"
                                  placeholder='{"size":"52"}'
                                  value={JSON.stringify(of.value ?? {})}
                                  onChange={(e) => {
                                    try {
                                      of.onChange(JSON.parse(e.target.value || "{}") as Record<string, string>);
                                    } catch {
                                      /* wait for valid JSON */
                                    }
                                  }}
                                  onBlur={(e) => {
                                    try {
                                      of.onChange(JSON.parse(e.target.value || "{}") as Record<string, string>);
                                    } catch {
                                      toast.error("JSON غير صالح للخيارات");
                                    }
                                  }}
                                />
                              )}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>ظهور محركات البحث</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان SEO</FormLabel>
                      <FormControl>
                        <Input dir="rtl" {...field} value={field.value ?? ""} />
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
                        <Textarea dir="rtl" rows={3} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="rounded-lg border bg-muted/30 p-4 text-start" dir="ltr">
                  <p className="mb-1 text-xs text-muted-foreground">معاينة Google</p>
                  <div className="text-blue-700 underline decoration-blue-700">{googlePreview.url}</div>
                  <div className="text-lg text-[#1a0dab]">{googlePreview.title}</div>
                  <div className="text-sm text-[#4d5156] line-clamp-2">{googlePreview.desc || "—"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>حذف المنتج؟</AlertDialogTitle>
              <AlertDialogDescription>لا يمكن التراجع. الطلبات القديمة تبقى بدون ربط بالمنتج.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  setDeleteOpen(false);
                  onDelete();
                }}
              >
                حذف نهائي
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}
