import { BlogEditorForm } from "@/components/admin/blog-editor-form";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

async function tagSuggestions() {
  const rows = await prisma.blogPost.findMany({ select: { tags: true } });
  const set = new Set<string>();
  for (const r of rows) {
    parseJson<string[]>(r.tags, []).forEach((t) => set.add(t));
  }
  return Array.from(set);
}

export default async function NewBlogPostPage() {
  const suggestions = await tagSuggestions();

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">مقال جديد</h1>
        <p className="text-sm text-muted-foreground">سيظهر في `/blog` عند تفعيل النشر.</p>
      </div>
      <BlogEditorForm
        mode="create"
        tagSuggestions={suggestions}
        defaultValues={{
          title: "",
          slug: "",
          excerpt: "",
          content: "<p></p>",
          featuredImage: null,
          author: "",
          tagsCsv: "",
          publishedAtStr: "",
          isPublished: false,
          seoTitle: "",
          seoDescription: "",
        }}
      />
    </div>
  );
}
