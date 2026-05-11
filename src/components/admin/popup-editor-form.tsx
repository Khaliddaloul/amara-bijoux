"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPopup, updatePopup } from "@/actions/admin/popups";
import { AdminImageUploadField } from "@/components/admin/admin-image-upload-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { popupAdminSchema, type PopupAdminInput } from "@/lib/validations/admin-cms";
import { z } from "zod";

const formSchema = popupAdminSchema.omit({ targetPages: true }).extend({
  targetPagesRaw: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function toPayload(v: FormValues): PopupAdminInput {
  const raw = v.targetPagesRaw.trim();
  const targetPages =
    raw === "" || raw === "all"
      ? ["all"]
      : raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return {
    title: v.title,
    subtitle: v.subtitle,
    message: v.message,
    image: v.image,
    ctaLabel: v.ctaLabel,
    ctaHref: v.ctaHref,
    delaySec: v.delaySec,
    showOnExit: v.showOnExit,
    closeAfterSec: v.closeAfterSec,
    position: v.position,
    targetPages,
    viewCount: v.viewCount,
    isActive: v.isActive,
  };
}

type Props = {
  mode: "create" | "edit";
  popupId?: string;
  defaultValues: FormValues;
};

export function PopupEditorForm({ mode, popupId, defaultValues }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (vals: FormValues) => {
    const payload = toPayload(vals);
    const parsed = popupAdminSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.flatten().formErrors.join(" "));
      return;
    }
    start(async () => {
      const res =
        mode === "create" ? await createPopup(parsed.data) : await updatePopup(popupId!, parsed.data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم الحفظ");
      router.push("/admin/marketing/popups");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle>المحتوى</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان الفرعي</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النص</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AdminImageUploadField
              folder="banners"
              label="صورة"
              value={form.watch("image")}
              onChange={(u) => form.setValue("image", u)}
            />
            <FormField
              control={form.control}
              name="ctaLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>زر الدعوة</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaHref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط الزر</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} dir="ltr" className="text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>السلوك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="delaySec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تأخير الظهور (ثواني)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showOnExit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>عند مغادرة الصفحة</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closeAfterSec"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>إغلاق تلقائي بعد (ثواني، فارغ = لا)</FormLabel>
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
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموضع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="bottom-right">أسفل يمين</SelectItem>
                      <SelectItem value="bottom-left">أسفل يسار</SelectItem>
                      <SelectItem value="top">أعلى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetPagesRaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>صفحات الاستهداف (سطر لكل مسار أو `all`)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} dir="ltr" className="text-left font-mono text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="viewCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد المشاهدات (عرضي)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>نشط</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
            حفظ
          </Button>
        </div>
      </form>
    </Form>
  );
}
