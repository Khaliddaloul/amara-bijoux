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
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <header>
          <h1 className="text-3xl font-semibold text-black">المدونة</h1>
          <p className="mt-2 text-sm text-[#696969]">نصائح وعناية واتجاهات حول المجوهرات المغربية والعالمية</p>
        </header>
        <ul className="space-y-6">
          {posts.map((p) => (
            <li key={p.id} className="border-b border-[#f0f0f0] pb-6">
              <article>
                <h2 className="text-xl font-semibold text-black">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h2>
                {p.excerpt ? <p className="mt-2 text-sm text-[#4d4d4d]">{p.excerpt}</p> : null}
                {p.publishedAt ? (
                  <time className="mt-2 block text-xs text-[#696969]" dateTime={p.publishedAt.toISOString()}>
                    {p.publishedAt.toLocaleDateString("ar-MA")}
                  </time>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </StorefrontShell>
  );
}
