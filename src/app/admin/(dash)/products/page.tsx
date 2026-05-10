import Link from "next/link";
import { AdminProductDeleteButton } from "@/components/admin/admin-product-delete-button";
import { ProductImage } from "@/components/storefront/product-image";
import { prisma } from "@/lib/prisma";
import { formatMad } from "@/lib/format";
import { pickProductImageUrl } from "@/lib/images";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { categories: true },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-sm text-muted-foreground">عرض سريع — CRUD الكامل عبر صفحات التحرير.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + منتج جديد
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-right">صورة</th>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">المخزون</th>
              <th className="p-3 text-right">السعر</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                    <ProductImage src={pickProductImageUrl(p.images)} alt={p.name} fill className="object-cover" sizes="48px" />
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.categories.map((c) => c.name).join(" · ")}
                  </div>
                </td>
                <td className="p-3 text-xs">{p.status}</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3 font-semibold">{formatMad(p.price)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link className="text-primary hover:underline" href={`/admin/products/${p.id}`}>
                      تعديل
                    </Link>
                    <AdminProductDeleteButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
