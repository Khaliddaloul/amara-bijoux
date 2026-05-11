import {
  CategoriesTable,
  type CategoryRow,
} from "@/components/admin/categories/categories-table";
import { CategoryCreateButton } from "@/components/admin/categories/category-form-dialog";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: true,
      _count: { select: { products: true } },
    },
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
    parentId: c.parentId,
    parentName: c.parent?.name ?? null,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
  }));

  const parents = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الفئات</h1>
          <p className="text-sm text-muted-foreground">
            تنظيم المنتجات حسب الفئات — اسحبي الصف لإعادة الترتيب.
          </p>
        </div>
        <CategoryCreateButton parents={parents} />
      </div>
      <CategoriesTable rows={rows} parents={parents} />
    </div>
  );
}
