import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductImage } from "@/components/storefront/product-image";
import { StoreBreadcrumb } from "@/components/storefront/store-breadcrumb";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";
import { BlogShareRow } from "@/components/storefront/blog-share-row";
import { parseJson } from "@/lib/json";
import { getSiteUrl } from "@/lib/site-url";
import { buildPageMetadata, getDynamicOgImageUrl } from "@/lib/seo/metadata";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.isPublished) return { title: "مقال" };
  const desc = post.seoDescription ?? post.excerpt ?? post.title;
  const tags = parseJson<string[]>(post.tags, []);

  return buildPageMetadata({
    title: post.seoTitle ?? post.title,
    description: desc,
    canonicalPath: `/blog/${post.slug}`,
    keywords: [...STORE_KEYWORDS, ...tags, "مدونة", "مجوهرات"],
    ogType: "article",
    ogImages: [
      {
        url: getDynamicOgImageUrl("article", post.id),
        width: 1200,
        height: 630,
        alt: post.title,
      },
    ],
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.isPublished) notFound();

  const postTags = parseJson<string[]>(post.tags, []);

  const [relatedPosts, featuredProducts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { isPublished: true, slug: { not: post.slug } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const jsonLd = [
    blogPostingJsonLd(post),
    breadcrumbJsonLd([
      { name: "الرئيسية", href: "/" },
      { name: "المدونة", href: "/blog" },
      { name: post.title, href: `/blog/${post.slug}` },
    ]),
  ];

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "المدونة", href: "/blog" },
    { label: post.title },
  ];

  return (
    <StorefrontShell>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12" itemScope itemType="https://schema.org/BlogPosting">
        <StoreBreadcrumb items={breadcrumbItems} />

        <header className="space-y-4">
          {post.featuredImage ? (
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-[#fafafa]">
              <Image
                src={post.featuredImage}
                alt=""
                fill
                className="object-cover"
                sizes="960px"
                priority
                unoptimized={post.featuredImage.startsWith("/uploads")}
              />
            </div>
          ) : null}
          <h1 className="text-3xl font-semibold text-black" itemProp="headline">
            {post.title}
          </h1>
          {post.author ? (
            <p className="mt-2 text-sm text-[#696969]" itemProp="author">
              {post.author}
            </p>
          ) : null}
          {post.publishedAt ? (
            <time itemProp="datePublished" dateTime={post.publishedAt.toISOString()} className="mt-2 block text-xs text-[#696969]">
              {post.publishedAt.toLocaleDateString("ar-MA")}
            </time>
          ) : null}
          {postTags.length > 0 ? (
            <p className="mt-3 text-xs text-[#696969]">وسوم: {postTags.join("، ")}</p>
          ) : null}
          <BlogShareRow title={post.title} url={`${getSiteUrl()}/blog/${post.slug}`} />
        </header>

        <div
          className="prose prose-neutral max-w-none prose-headings:text-black prose-p:text-[#4d4d4d]"
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {relatedPosts.length > 0 ? (
          <section className="border-t border-[#f0f0f0] pt-10" aria-labelledby="related-posts">
            <h2 id="related-posts" className="text-xl font-semibold text-black">
              مقالات ذات صلة
            </h2>
            <ul className="mt-4 space-y-4">
              {relatedPosts.map((r) => (
                <li key={r.id}>
                  <Link href={`/blog/${r.slug}`} className="font-medium text-black hover:underline">
                    {r.title}
                  </Link>
                  {r.excerpt ? <p className="mt-1 text-sm text-[#696969]">{r.excerpt}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {featuredProducts.length > 0 ? (
          <section className="border-t border-[#f0f0f0] pt-10" aria-labelledby="mentioned-products">
            <h2 id="mentioned-products" className="text-xl font-semibold text-black">
              منتجات قد تهمّكِ
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {featuredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="flex gap-4 rounded-xl border border-[#f0f0f0] p-3 transition hover:border-[#6a6a6a]"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#fafafa]">
                    <ProductImage src={pickProductImageUrl(p.images)} alt={p.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <div>
                    <div className="line-clamp-2 text-sm font-medium text-black">{p.name}</div>
                    <div className="mt-2 text-sm font-semibold text-[#00BF0E]">{formatMad(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </StorefrontShell>
  );
}
