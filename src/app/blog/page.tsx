import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "المدونة",
    description:
      "مدونة أمارا للمجوهرات — عناية بالمجوهرات، صيحات، وإلهام لإطلالتكِ اليومية والمناسبات بالعربية.",
    canonicalPath: "/blog",
    keywords: [...STORE_KEYWORDS, "المدونة", "عناية بالمجوهرات", "نصائح"],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "مدونة أمارا للمجوهرات" }],
  });
}

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        <header>
          <h1 className="text-3xl font-semibold text-black">المدونة</h1>
          <p className="mt-2 text-sm text-[#696969]">نصائح وعناية واتجاهات حول المجوهرات المغربية والعالمية</p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[#f0f0f0] bg-white shadow-sm transition hover:border-[#d4d4d4]"
            >
              <Link href={`/blog/${p.slug}`} className="relative aspect-[16/10] w-full bg-[#fafafa]">
                {p.featuredImage ? (
                  <Image
                    src={p.featuredImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 33vw"
                    unoptimized={p.featuredImage.startsWith("/uploads")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#696969]">بدون صورة</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-lg font-semibold leading-snug text-black">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h2>
                {p.excerpt ? <p className="mt-2 line-clamp-3 flex-1 text-sm text-[#4d4d4d]">{p.excerpt}</p> : null}
                {p.publishedAt ? (
                  <time className="mt-3 block text-xs text-[#696969]" dateTime={p.publishedAt.toISOString()}>
                    {p.publishedAt.toLocaleDateString("ar-MA")}
                  </time>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </StorefrontShell>
  );
}
