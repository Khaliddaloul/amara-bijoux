import {
  CollectionsTable,
  type CollectionRow,
} from "@/components/admin/collections/collections-table";
import { CollectionCreateButton } from "@/components/admin/collections/collection-form-dialog";
import {
  matchesAutomaticCollection,
  parseCollectionConditions,
} from "@/lib/collection-conditions";
import { prisma } from "@/lib/prisma";

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { name: "asc" },
      include: { products: { select: { id: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: { categories: { select: { slug: true, name: true } } },
    }),
  ]);

  const productOptions = products.map((p) => ({ id: p.id, name: p.name }));

  const rows: CollectionRow[] = collections.map((c) => {
    const store = parseCollectionConditions(c.conditions);
    const productCount =
      c.type === "AUTOMATIC"
        ? products.filter((p) =>
            matchesAutomaticCollection(
              {
                name: p.name,
                price: p.price,
                vendor: p.vendor,
                tags: p.tags,
                categories: p.categories,
              },
              store,
            ),
          ).length
        : c.products.length;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      type: c.type === "AUTOMATIC" ? "AUTOMATIC" : "MANUAL",
      productIds: c.products.map((p) => p.id),
      conditions: store.conditions,
      matchType: store.matchType,
      productCount,
    };
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المجموعات</h1>
          <p className="text-sm text-muted-foreground">
            مجموعات يدوية أو شروط تلقائية لتجميع المنتجات.
          </p>
        </div>
        <CollectionCreateButton products={productOptions} />
      </div>
      <CollectionsTable rows={rows} products={productOptions} />
    </div>
  );
}
