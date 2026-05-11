"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveStorefrontCustomization } from "@/actions/admin/storefront-customize";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StorefrontPayload } from "@/lib/storefront-public";
import { storefrontSectionsSchema, storefrontThemeSchema } from "@/lib/validations/admin-cms";
import { z } from "zod";

const schema = z.object({
  theme: storefrontThemeSchema,
  sections: storefrontSectionsSchema,
});

type FormValues = z.infer<typeof schema>;

export function StorefrontCustomizeForm({ initial }: { initial: StorefrontPayload }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const defaults = useMemo<FormValues>(() => {
    const theme: Partial<NonNullable<StorefrontPayload["theme"]>> = initial.theme ?? {};
    const sections =
      initial.sections?.length ?? 0
        ? initial.sections!
        : [
            { id: "hero", type: "hero", visible: true, order: 0 },
            { id: "categories", type: "categories_grid", visible: true, order: 1 },
            { id: "featured", type: "featured_products", visible: true, order: 2 },
            { id: "spotlight", type: "spotlight", visible: true, order: 3 },
            { id: "promotions", type: "promotions", visible: true, order: 4 },
            { id: "testimonials", type: "testimonials", visible: false, order: 5 },
          ];
    return {
      theme: {
        primary: theme.primary ?? "#000000",
        accent: theme.accent ?? "#00bf0e",
        background: theme.background ?? "#ffffff",
        foreground: theme.foreground ?? "#000000",
        font: (theme.font as FormValues["theme"]["font"]) ?? "Cairo",
        logoUrl: theme.logoUrl ?? "/logo.png",
        faviconUrl: theme.faviconUrl ?? "/favicon.ico",
      },
      sections: [...sections].sort((a, b) => a.order - b.order),
    };
  }, [initial]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const { fields } = useFieldArray({ control: form.control, name: "sections" });

  const onSubmit = (data: FormValues) => {
    start(async () => {
      const res = await saveStorefrontCustomization({
        theme: data.theme,
        sections: data.sections.map((s, i) => ({ ...s, order: i })),
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حفظ التخصيص");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">يتم تطبيق الألوان والخط عبر `layout.tsx`.</p>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="ms-2 h-4 w-4" />
              افتح المتجر
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="colors">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="colors">الألوان</TabsTrigger>
            <TabsTrigger value="fonts">الخطوط</TabsTrigger>
            <TabsTrigger value="brand">الشعار</TabsTrigger>
            <TabsTrigger value="sections">الأقسام</TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>الألوان (Hex)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(["primary", "accent", "background", "foreground"] as const).map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`theme.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" className="font-mono text-sm" placeholder="#000000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fonts">
            <Card>
              <CardHeader>
                <CardTitle>الخط</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="theme.font"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>خط Google</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Tajawal">Tajawal</SelectItem>
                          <SelectItem value="Almarai">Almarai</SelectItem>
                          <SelectItem value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brand">
            <Card>
              <CardHeader>
                <CardTitle>الشعار والأيقونة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AdminImageUploadField
                  folder="general"
                  label="الشعار"
                  value={form.watch("theme.logoUrl")}
                  onChange={(u) => form.setValue("theme.logoUrl", u ?? "/logo.png")}
                />
                <AdminImageUploadField
                  folder="general"
                  label="الفافيكون"
                  value={form.watch("theme.faviconUrl")}
                  onChange={(u) => form.setValue("theme.faviconUrl", u ?? "/favicon.ico")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>أقسام الصفحة الرئيسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((f, index) => (
                  <div
                    key={f.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm"
                  >
                    <span className="min-w-[120px] font-medium">{f.type}</span>
                    <FormField
                      control={form.control}
                      name={`sections.${index}.visible`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormLabel className="text-xs">ظاهر</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`sections.${index}.order`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormLabel className="text-xs">ترتيب</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-8 w-20"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
          حفظ التخصيص
        </Button>
      </form>
    </Form>
  );
}
