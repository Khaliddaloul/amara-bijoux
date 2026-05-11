"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveMarketingPixels } from "@/actions/admin/pixels";
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
import { pixelsAdminSchema, type PixelsAdminInput } from "@/lib/validations/admin-cms";

export function PixelsAdminForm({ defaultValues }: { defaultValues: PixelsAdminInput }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<PixelsAdminInput>({
    resolver: zodResolver(pixelsAdminSchema),
    defaultValues,
  });

  const onSubmit = (data: PixelsAdminInput) => {
    start(async () => {
      const res = await saveMarketingPixels(data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حفظ إعدادات التتبع");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle>معرّفات Pixels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["facebookPixelId", "Facebook Pixel"],
                ["tiktokPixelId", "TikTok Pixel"],
                ["gtmId", "Google Tag Manager"],
                ["gaId", "Google Analytics (GA4)"],
                ["snapPixelId", "Snapchat Pixel"],
              ] as const
            ).map(([key, label]) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} dir="ltr" className="text-left font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
          حفظ
        </Button>
      </form>
    </Form>
  );
}
