import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { StoreBreadcrumb } from "@/components/storefront/store-breadcrumb";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { STORE_FAQ_ITEMS } from "@/lib/constants/faq";
import { STORE_KEYWORDS } from "@/lib/constants/store-seo";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/structured-data";
import { prisma } from "@/lib/prisma";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || !page.isPublished) return { title: "صفحة" };

  const title = page.seoTitle ?? page.title;
  const excerpt = stripHtml(page.content).slice(0, 155);
  const description =
    page.seoDescription ?? (excerpt.length ? `${excerpt}${excerpt.length >= 155 ? "…" : ""}` : page.title);

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/pages/${page.slug}`,
    keywords: [...STORE_KEYWORDS, page.title],
    ogImages: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: title }],
  });
}

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || !page.isPublished) notFound();

  const isFaq = page.slug === "faq";

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "الرئيسية", href: "/" },
      { name: page.title, href: `/pages/${page.slug}` },
    ]),
    ...(isFaq ? [faqPageJsonLd(STORE_FAQ_ITEMS)] : []),
  ];

  const breadcrumbItems = [{ label: "الرئيسية", href: "/" }, { label: page.title }];

  return (
    <StorefrontShell>
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <StoreBreadcrumb items={breadcrumbItems} />

        <header>
          <h1 className="text-3xl font-semibold text-black">{page.title}</h1>
        </header>

        <div
          className="prose prose-neutral max-w-none prose-headings:text-black prose-p:text-[#4d4d4d]"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {isFaq ? (
          <section className="border-t border-[#f0f0f0] pt-8" aria-label="أسئلة موسّعة">
            <h2 className="text-xl font-semibold text-black">مزيد من الأسئلة</h2>
            <dl className="mt-6 space-y-6">
              {STORE_FAQ_ITEMS.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-black">{item.question}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[#4d4d4d]">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
    </StorefrontShell>
  );
}
