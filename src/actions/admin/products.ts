"use server";

import { auth } from "@/auth";
import { logActivity } from "@/lib/admin/activity";
import { prisma } from "@/lib/prisma";
import { productAdminSchema, type ProductAdminInput } from "@/lib/validations/product-admin";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

function revalidateStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/collections");
}

async function revalidateCategories() {
  const cats = await prisma.category.findMany({ select: { slug: true } });
  for (const { slug } of cats) {
    revalidatePath(`/category/${slug}`);
  }
}

export async function createProduct(raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = productAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  const data = parsed.data;

  const exists = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (exists) {
    return { success: false as const, error: "المسار (slug) مستخدم بالفعل" };
  }

  if (data.sku) {
    const skuTaken = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuTaken) return { success: false as const, error: "SKU مستخدم" };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        costPerItem: data.costPerItem ?? null,
        sku: data.sku ?? null,
        barcode: data.barcode ?? null,
        quantity: data.quantity,
        trackQuantity: data.trackQuantity,
        weight: data.weight ?? null,
        taxable: data.taxable,
        status: data.status,
        featured: data.featured,
        vendor: data.vendor ?? null,
        tags: JSON.stringify(data.tags),
        images: JSON.stringify(data.images.map((im) => ({ url: im.url, alt: im.alt ?? "" }))),
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        categories:
          data.categoryIds.length > 0
            ? { connect: data.categoryIds.map((id) => ({ id })) }
            : undefined,
        variants:
          data.variants.length > 0
            ? {
                create: data.variants.map((v) => ({
                  title: v.title,
                  sku: v.sku ?? null,
                  price: v.price ?? null,
                  compareAtPrice: data.compareAtPrice ?? null,
                  quantity: v.quantity,
                  options: JSON.stringify(v.options ?? {}),
                })),
              }
            : undefined,
      },
    });

    revalidateStorefront();
    await revalidateCategories();

    await logActivity({
      userId: authz.session.user.id,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      metadata: { name: data.name, slug: data.slug },
    });

    return { success: true as const, data: { id: product.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل إنشاء المنتج" };
  }
}

export async function updateProduct(productId: string, raw: unknown) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const parsed = productAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(" ") };
  }

  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return { success: false as const, error: "المنتج غير موجود" };

  const slugTaken = await prisma.product.findFirst({
    where: { slug: data.slug, NOT: { id: productId } },
  });
  if (slugTaken) return { success: false as const, error: "المسار مستخدم لمنتج آخر" };

  if (data.sku) {
    const skuTaken = await prisma.product.findFirst({
      where: { sku: data.sku, NOT: { id: productId } },
    });
    if (skuTaken) return { success: false as const, error: "SKU مستخدم لمنتج آخر" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          costPerItem: data.costPerItem ?? null,
          sku: data.sku ?? null,
          barcode: data.barcode ?? null,
          quantity: data.quantity,
          trackQuantity: data.trackQuantity,
          weight: data.weight ?? null,
          taxable: data.taxable,
          status: data.status,
          featured: data.featured,
          vendor: data.vendor ?? null,
          tags: JSON.stringify(data.tags),
          images: JSON.stringify(data.images.map((im) => ({ url: im.url, alt: im.alt ?? "" }))),
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          categories: { set: data.categoryIds.map((id) => ({ id })) },
        },
      });

      const keptIds: string[] = [];
      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              title: v.title,
              sku: v.sku ?? null,
              price: v.price ?? null,
              compareAtPrice: data.compareAtPrice ?? null,
              quantity: v.quantity,
              options: JSON.stringify(v.options ?? {}),
            },
          });
          keptIds.push(v.id);
        } else {
          const nv = await tx.productVariant.create({
            data: {
              productId,
              title: v.title,
              sku: v.sku ?? null,
              price: v.price ?? null,
              compareAtPrice: data.compareAtPrice ?? null,
              quantity: v.quantity,
              options: JSON.stringify(v.options ?? {}),
            },
          });
          keptIds.push(nv.id);
        }
      }

      if (data.variants.length === 0) {
        await tx.productVariant.deleteMany({ where: { productId } });
      } else {
        await tx.productVariant.deleteMany({
          where: { productId, id: { notIn: keptIds } },
        });
      }
    });

    revalidateStorefront();
    await revalidateCategories();

    const after = await prisma.product.findUnique({ where: { id: productId } });
    if (after && after.trackQuantity && after.quantity < 5) {
      const owners = await prisma.user.findMany({ where: { role: "OWNER" }, select: { id: true } });
      for (const o of owners) {
        await prisma.notification.create({
          data: {
            userId: o.id,
            type: "STOCK",
            title: "تنبيه مخزون",
            body: `المنتج ${after.name} مخزونه أقل من 5`,
            link: `/admin/products/${productId}`,
            isRead: false,
          },
        });
      }
    }

    await logActivity({
      userId: authz.session.user.id,
      action: "UPDATE",
      entity: "Product",
      entityId: productId,
      metadata: { name: data.name },
    });

    return { success: true as const, data: { id: productId } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث" };
  }
}

export async function deleteProduct(productId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.orderItem.updateMany({
      where: { productId },
      data: { productId: null },
    });

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidateStorefront();
    await revalidateCategories();

    await logActivity({
      userId: authz.session.user.id,
      action: "DELETE",
      entity: "Product",
      entityId: productId,
    });

    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف — قد يكون هناك بيانات مرتبطة" };
  }
}

type BulkPriceAdjustment = {
  mode: "percentage" | "absolute";
  value: number;
};

export type BulkUpdateInput = {
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  setCategoryIds?: string[];
  priceAdjustment?: BulkPriceAdjustment;
};

export async function bulkUpdateProducts(ids: string[], data: BulkUpdateInput) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false as const, error: "اختاري منتجاً واحداً على الأقل" };
  }

  try {
    if (data.status) {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { status: data.status },
      });
    }

    if (data.setCategoryIds) {
      const catIds = data.setCategoryIds;
      await prisma.$transaction(
        ids.map((pid) =>
          prisma.product.update({
            where: { id: pid },
            data: { categories: { set: catIds.map((cid) => ({ id: cid })) } },
          }),
        ),
      );
    }

    if (data.priceAdjustment) {
      const adj = data.priceAdjustment;
      if (!Number.isFinite(adj.value)) {
        return { success: false as const, error: "قيمة غير صالحة" };
      }
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, price: true },
      });
      await prisma.$transaction(
        products.map((p) => {
          const next =
            adj.mode === "percentage"
              ? Math.max(0, Math.round(p.price * (1 + adj.value / 100) * 100) / 100)
              : Math.max(0, Math.round((p.price + adj.value) * 100) / 100);
          return prisma.product.update({
            where: { id: p.id },
            data: { price: next },
          });
        }),
      );
    }

    revalidateStorefront();
    await revalidateCategories();
    return { success: true as const, data: { count: ids.length } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث الجماعي" };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false as const, error: "اختاري منتجاً واحداً على الأقل" };
  }

  try {
    await prisma.orderItem.updateMany({
      where: { productId: { in: ids } },
      data: { productId: null },
    });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });

    revalidateStorefront();
    await revalidateCategories();
    return { success: true as const, data: { count: ids.length } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف الجماعي" };
  }
}

export async function duplicateProduct(productId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  const src = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true, categories: true },
  });

  if (!src) return { success: false as const, error: "المنتج غير موجود" };

  let baseSlug = `${src.slug}-copy`;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug: baseSlug } })) {
    baseSlug = `${src.slug}-copy-${n++}`;
  }

  const newSku = src.sku ? `${src.sku}-COPY-${Date.now().toString(36)}` : null;

  try {
    const dup = await prisma.product.create({
      data: {
        name: `${src.name} (نسخة)`,
        slug: baseSlug,
        description: src.description,
        shortDescription: src.shortDescription,
        price: src.price,
        compareAtPrice: src.compareAtPrice,
        costPerItem: src.costPerItem,
        sku: newSku,
        barcode: src.barcode,
        quantity: src.quantity,
        trackQuantity: src.trackQuantity,
        weight: src.weight,
        taxable: src.taxable,
        status: "DRAFT",
        featured: false,
        vendor: src.vendor,
        tags: src.tags,
        images: src.images,
        seoTitle: src.seoTitle,
        seoDescription: src.seoDescription,
        categories: {
          connect: src.categories.map((c) => ({ id: c.id })),
        },
        variants:
          src.variants.length > 0
            ? {
                create: src.variants.map((v) => ({
                  title: v.title,
                  sku: null,
                  price: v.price,
                  compareAtPrice: v.compareAtPrice,
                  quantity: v.quantity,
                  options: v.options,
                  image: v.image,
                })),
              }
            : undefined,
      },
    });

    revalidateStorefront();
    await revalidateCategories();

    await logActivity({
      userId: authz.session.user.id,
      action: "CREATE",
      entity: "Product",
      entityId: dup.id,
      metadata: { from: productId, slug: dup.slug },
    });

    return { success: true as const, data: { id: dup.id } };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل النسخ" };
  }
}

