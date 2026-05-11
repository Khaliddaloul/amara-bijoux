import { notFound } from "next/navigation";
import { ProductEditorForm, type ProductEditorInitial } from "@/components/admin/product-editor-form";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true, categories: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const tags = parseJson<string[]>(product.tags, []);
  const imgs = parseJson<Array<{ url: string; alt?: string }>>(product.images, []);

  const initial: ProductEditorInitial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    costPerItem: product.costPerItem,
    sku: product.sku,
    barcode: product.barcode,
    quantity: product.quantity,
    trackQuantity: product.trackQuantity,
    weight: product.weight,
    taxable: product.taxable,
    status: product.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
    featured: product.featured,
    vendor: product.vendor,
    tags,
    categoryIds: product.categories.map((c) => c.id),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    images: imgs.map((im) => ({ url: im.url, alt: im.alt ?? "" })),
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      quantity: v.quantity,
      options: parseJson<Record<string, string>>(v.options, {}),
    })),
  };

  return (
    <ProductEditorForm
      mode="edit"
      initial={initial}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
