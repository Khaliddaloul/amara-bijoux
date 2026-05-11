import { Link } from "@/i18n/routing";
import {
  ProductsBulkTable,
  type ProductTableRow,
} from "@/components/admin/products/products-bulk-table";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: { categories: { select: { id: true, name: true } } },
      take: 500,
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  const rows: ProductTableRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status:
      p.status === "ACTIVE"
        ? "ACTIVE"
        : p.status === "ARCHIVED"
          ? "ARCHIVED"
          : "DRAFT",
    quantity: p.quantity,
    price: p.price,
    images: p.images,
    categoryNames: p.categories.map((c) => c.name),
  }));

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-sm text-muted-foreground">
            CRUD كامل، إجراءات جماعية: تفعيل، أرشفة، تغيير فئة، تعديل سعر، حذف.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + منتج جديد
        </Link>
      </div>
      <ProductsBulkTable rows={rows} categories={categories} />
    </div>
  );
}
