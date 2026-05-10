import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page || !page.isPublished) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="font-display text-3xl">{page.title}</h1>
      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
