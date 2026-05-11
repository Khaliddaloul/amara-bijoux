"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCampaign, updateCampaign } from "@/actions/admin/campaigns";
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
import { Textarea } from "@/components/ui/textarea";
import { campaignAdminSchema, type CampaignAdminInput } from "@/lib/validations/admin-cms";

type Props = {
  mode: "create" | "edit";
  campaignId?: string;
  defaultValues: CampaignAdminInput;
};

export function CampaignEditorForm({ mode, campaignId, defaultValues }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<CampaignAdminInput>({
    resolver: zodResolver(campaignAdminSchema),
    defaultValues,
  });

  const filter = form.watch("recipientFilter");

  const onSubmit = (data: CampaignAdminInput) => {
    start(async () => {
      const res =
        mode === "create" ? await createCampaign(data) : await updateCampaign(campaignId!, data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم الحفظ");
      router.push("/admin/marketing/campaigns");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle>الحملة</CardTitle>
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
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القناة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMAIL">بريد</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">واتساب</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موضوع البريد (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المحتوى</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientFilter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الجمهور</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_customers">كل العملاء</SelectItem>
                      <SelectItem value="tag">وسم</SelectItem>
                      <SelectItem value="segment">شريحة (تجريبي)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {filter === "tag" ? (
              <FormField
                control={form.control}
                name="recipientTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوسم</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
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
