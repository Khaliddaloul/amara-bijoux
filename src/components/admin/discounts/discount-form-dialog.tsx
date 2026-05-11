"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createDiscount,
  updateDiscount,
} from "@/actions/admin/discounts";
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
import { Switch } from "@/components/ui/switch";
import {
  discountAdminSchema,
  type DiscountAdminInput,
} from "@/lib/validations/discount-admin";

export type DiscountFormInitial = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minPurchase: number | null;
  usageLimit: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

function toIsoLocal(d: Date | null | undefined): string {
  if (!d) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

function toDefaults(initial?: DiscountFormInitial): DiscountAdminInput {
  return {
    code: initial?.code ?? "",
    type: initial?.type ?? "PERCENTAGE",
    value: initial?.value ?? 10,
    minPurchase: initial?.minPurchase ?? null,
    usageLimit: initial?.usageLimit ?? null,
    startsAt: initial?.startsAt ?? null,
    endsAt: initial?.endsAt ?? null,
    isActive: initial?.isActive ?? true,
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: DiscountFormInitial;
};

export function DiscountFormDialog({ open, onOpenChange, mode, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<DiscountAdminInput>({
    resolver: zodResolver(discountAdminSchema),
    defaultValues: toDefaults(initial),
  });

  useEffect(() => {
    if (open) form.reset(toDefaults(initial));
  }, [open, initial, form]);

  const watchedType = form.watch("type");

  const onSubmit = (values: DiscountAdminInput) => {
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createDiscount(values)
          : await updateDiscount(initial!.id, values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === "create" ? "تم إنشاء الكود" : "تم الحفظ");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "كود خصم جديد" : "تعديل الكود"}
          </DialogTitle>
          <DialogDescription>تطبَّق الأكواد في صفحة الدفع.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكود</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        className="text-left font-mono uppercase"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>يُحوَّل تلقائياً إلى حروف كبيرة</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>النوع</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">نسبة %</SelectItem>
                        <SelectItem value="FIXED">قيمة ثابتة (د.م.)</SelectItem>
                        <SelectItem value="FREE_SHIPPING">شحن مجاني</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchedType === "PERCENTAGE"
                        ? "النسبة"
                        : watchedType === "FIXED"
                          ? "القيمة"
                          : "—"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        dir="ltr"
                        className="text-left"
                        disabled={watchedType === "FREE_SHIPPING"}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حد أدنى للشراء (د.م.)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        dir="ltr"
                        className="text-left"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حد الاستخدام</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        dir="ltr"
                        className="text-left"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      اتركيه فارغاً للاستخدام غير المحدود
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>يبدأ من</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        dir="ltr"
                        className="text-left"
                        value={toIsoLocal(field.value)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ينتهي في</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        dir="ltr"
                        className="text-left"
                        value={toIsoLocal(field.value)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>نشط</FormLabel>
                    <FormDescription className="text-xs">
                      اجعليه غير نشط لمنع الاستخدام بدون حذف
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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

export function DiscountCreateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>+ كود جديد</Button>
      <DiscountFormDialog open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
