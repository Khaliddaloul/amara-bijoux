"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createBlogPost, updateBlogPost } from "@/actions/admin/blog";
import { AdminImageUploadField } from "@/components/admin/admin-image-upload-field";
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { blogAdminSchema, type BlogAdminInput } from "@/lib/validations/admin-cms";
import { z } from "zod";

const blogFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  featuredImage: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  tagsCsv: z.string(),
  publishedAtStr: z.string().optional().nullable(),
  isPublished: z.boolean(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

function toPayload(v: BlogFormValues): BlogAdminInput {
  return {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt ?? null,
    content: v.content,
    featuredImage: v.featuredImage ?? null,
    author: v.author ?? null,
    tags: v.tagsCsv
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean),
    publishedAt: v.publishedAtStr ? new Date(v.publishedAtStr) : null,
    isPublished: v.isPublished,
    seoTitle: v.seoTitle ?? null,
    seoDescription: v.seoDescription ?? null,
  };
}

type Props = {
  mode: "create" | "edit";
  postId?: string;
  tagSuggestions: string[];
  defaultValues: BlogFormValues;
};

export function BlogEditorForm({ mode, postId, tagSuggestions: _tagSuggestions, defaultValues }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const suggestionsHint = useMemo(
    () => (_tagSuggestions.length ? _tagSuggestions.slice(0, 12).join("، ") : ""),
    [_tagSuggestions],
  );

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues,
  });

  const onSubmit = (vals: BlogFormValues) => {
    const payload = toPayload(vals);
    const parsed = blogAdminSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.flatten().formErrors.join(" "));
      return;
    }
    start(async () => {
      const res =
        mode === "create"
          ? await createBlogPost(parsed.data)
          : await updateBlogPost(postId!, parsed.data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === "create" ? "تم إنشاء المقال" : "تم حفظ المقال");
      router.push("/admin/content/blog");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسار</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مقتطف</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={3} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المقال</FormLabel>
                    <FormControl>
                      <AdminRichTextEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AdminImageUploadField
                folder="blog"
                label="صورة بارزة"
                value={form.watch("featuredImage")}
                onChange={(u) => form.setValue("featuredImage", u)}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكاتب</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagsCsv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوسوم (مفصولة بفاصلة)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="rtl" placeholder="عناية، مجوهرات، موضة" />
                    </FormControl>
                    {suggestionsHint ? (
                      <p className="text-xs text-muted-foreground">اقتراحات: {suggestionsHint}</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>النشر وSEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="publishedAtStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النشر</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="datetime-local" dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel>منشور</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان SEO</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} dir="rtl" />
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
                      <Textarea {...field} value={field.value ?? ""} rows={3} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

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
