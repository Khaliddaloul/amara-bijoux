"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blogAdminSchema, type BlogAdminInput } from "@/lib/validations/admin-cms";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "يجب تسجيل الدخول" };
  return { ok: true as const };
}

function tagsJson(tags: string[]) {
  return JSON.stringify(tags);
}

export async function createBlogPost(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = blogAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data: BlogAdminInput = parsed.data;

  const exists = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
  if (exists) return { success: false as const, error: "المسار مستخدم" };

  await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      featuredImage: data.featuredImage ?? null,
      author: data.author ?? null,
      tags: tagsJson(data.tags ?? []),
      publishedAt: data.publishedAt ?? null,
      isPublished: data.isPublished,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
  revalidatePath("/admin/content/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  return { success: true as const };
}

export async function updateBlogPost(id: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = blogAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }
  const data = parsed.data;

  const cur = await prisma.blogPost.findUnique({ where: { id } });
  if (!cur) return { success: false as const, error: "المقال غير موجود" };

  if (data.slug !== cur.slug) {
    const taken = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
    if (taken) return { success: false as const, error: "المسار مستخدم" };
  }

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      content: data.content,
      featuredImage: data.featuredImage ?? null,
      author: data.author ?? null,
      tags: tagsJson(data.tags ?? []),
      publishedAt: data.publishedAt ?? null,
      isPublished: data.isPublished,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
  revalidatePath("/admin/content/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  if (cur.slug !== data.slug) revalidatePath(`/blog/${cur.slug}`);
  return { success: true as const };
}

export async function deleteBlogPost(id: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const cur = await prisma.blogPost.findUnique({ where: { id } });
  if (!cur) return { success: false as const, error: "غير موجود" };

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/content/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${cur.slug}`);
  return { success: true as const };
}
