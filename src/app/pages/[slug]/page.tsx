import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { prisma } from "@/lib/prisma";

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || !page.isPublished) notFound();

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-black">{page.title}</h1>
        <div
          className="prose prose-neutral max-w-none prose-headings:text-black prose-p:text-[#4d4d4d]"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </StorefrontShell>
  );
}
