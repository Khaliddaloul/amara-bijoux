import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { prisma } from "@/lib/prisma";

export default async function AdminProductNewPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return <ProductEditorForm mode="create" categories={categories.map((c) => ({ id: c.id, name: c.name }))} />;
}
