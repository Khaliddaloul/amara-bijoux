import { notFound } from "next/navigation";
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

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const [post, suggestions] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id: params.id } }),
    tagSuggestions(),
  ]);
  if (!post) notFound();

  const tags = parseJson<string[]>(post.tags, []);
  const publishedAtStr = post.publishedAt
    ? new Date(post.publishedAt.getTime() - post.publishedAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">تعديل المقال</h1>
        <p className="text-sm text-muted-foreground">{post.title}</p>
      </div>
      <BlogEditorForm
        mode="edit"
        postId={post.id}
        tagSuggestions={suggestions}
        defaultValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          featuredImage: post.featuredImage,
          author: post.author ?? "",
          tagsCsv: tags.join("، "),
          publishedAtStr,
          isPublished: post.isPublished,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }}
      />
    </div>
  );
}
