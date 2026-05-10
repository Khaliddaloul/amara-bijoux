import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

function pickImage(raw: string) {
  const imgs = parseJson<Array<{ url: string }>>(raw, []);
  return (
    imgs[0]?.url ??
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80"
  );
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="font-display text-3xl">{category.name}</h1>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((p) => (
          <Card key={p.id} className="overflow-hidden border shadow-card">
            <Link href={`/product/${p.slug}`} className="block">
              <div className="relative aspect-square bg-muted">
                <Image src={pickImage(p.images)} alt={p.name} fill className="object-cover" sizes="360px" />
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="line-clamp-2 min-h-[48px] text-sm font-semibold">{p.name}</div>
                <div className="text-lg font-bold text-primary">{formatMad(p.price)}</div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
