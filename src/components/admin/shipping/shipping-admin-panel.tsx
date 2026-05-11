"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createShippingZone,
  deleteShippingZone,
  updateShippingZone,
} from "@/actions/admin/shipping";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  shippingZoneAdminSchema,
  type ShippingZoneAdminInput,
} from "@/lib/validations/shipping-admin";

export type ShippingZoneRow = {
  id: string;
  name: string;
  regions: string[];
  isActive: boolean;
  rates: Array<{
    id: string;
    name: string;
    price: number;
    minOrder: number;
    maxOrder: number | null;
    estimatedDays: number | null;
  }>;
};

function emptyForm(): ShippingZoneAdminInput {
  return {
    name: "",
    regions: ["الدار البيضاء"],
    isActive: true,
    rates: [{ name: "عادي", price: 35, minOrder: 0, maxOrder: null, estimatedDays: 3 }],
  };
}

export function ShippingAdminPanel({ initialZones }: { initialZones: ShippingZoneRow[] }) {
  const [zones, setZones] = useState(initialZones);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<ShippingZoneAdminInput>({
    resolver: zodResolver(shippingZoneAdminSchema),
    defaultValues: emptyForm(),
  });

  const { fields: rateFields, append: appendRate, remove: removeRate } = useFieldArray({
    control: form.control,
    name: "rates",
  });

  const regionsText = form.watch("regions");
  const regionsJoined = useMemo(() => (Array.isArray(regionsText) ? regionsText.join("\n") : ""), [regionsText]);

  function openCreate() {
    setEditingId(null);
    form.reset(emptyForm());
    setOpen(true);
  }

  function openEdit(z: ShippingZoneRow) {
    setEditingId(z.id);
    form.reset({
      name: z.name,
      regions: z.regions.length ? z.regions : [""],
      isActive: z.isActive,
      rates: z.rates.map((r) => ({
        name: r.name,
        price: r.price,
        minOrder: r.minOrder,
        maxOrder: r.maxOrder,
        estimatedDays: r.estimatedDays,
      })),
    });
    setOpen(true);
  }

  function onSubmit(values: ShippingZoneAdminInput) {
    startTransition(async () => {
      const res = editingId
        ? await updateShippingZone(editingId, values)
        : await createShippingZone(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(editingId ? "تم تحديث المنطقة" : "تم إنشاء المنطقة");
      setOpen(false);
      window.location.reload();
    });
  }

  function onDelete(id: string) {
    if (!confirm("حذف هذه المنطقة؟")) return;
    startTransition(async () => {
      const res = await deleteShippingZone(id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم الحذف");
      setZones((prev) => prev.filter((z) => z.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">مناطق الشحن</h1>
          <p className="text-sm text-muted-foreground">إدارة المدن وأسعار الشحن لكل منطقة.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="ms-2 h-4 w-4" />
          منطقة جديدة
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنطقة</TableHead>
              <TableHead className="w-28">المدن</TableHead>
              <TableHead>الأسعار</TableHead>
              <TableHead className="w-24">الحالة</TableHead>
              <TableHead className="w-32 text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((z) => (
              <TableRow key={z.id}>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell>{z.regions.length}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {z.rates.map((r) => (
                      <Badge key={r.id} variant="secondary" className="font-normal">
                        {r.name}: {r.price} د.م.
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{z.isActive ? "مفعّل" : "متوقف"}</TableCell>
                <TableCell className="text-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(z)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(z.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل المنطقة" : "منطقة شحن جديدة"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنطقة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regions"
                render={() => (
                  <FormItem>
                    <FormLabel>المدن (سطر لكل مدينة)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        value={regionsJoined}
                        onChange={(e) =>
                          form.setValue(
                            "regions",
                            e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel>منطقة نشطة</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>أسعار الشحن</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendRate({
                        name: "سعر جديد",
                        price: 0,
                        minOrder: 0,
                        maxOrder: null,
                        estimatedDays: null,
                      })
                    }
                  >
                    + سعر
                  </Button>
                </div>
                {rateFields.map((rf, idx) => (
                  <div key={rf.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`rates.${idx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>التسمية</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rates.${idx}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر (د.م.)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rates.${idx}.minOrder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حد أدنى للسلة</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rates.${idx}.maxOrder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حد أعلى (اختياري)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
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
                      name={`rates.${idx}.estimatedDays`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>أيام تقديرية</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
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
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeRate(idx)}
                      >
                        حذف السعر
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="gap-2 sm:justify-start">
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                  حفظ
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
