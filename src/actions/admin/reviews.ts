"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "يجب تسجيل الدخول" };
  }
  return { ok: true as const, session };
}

async function revalidateReviewProduct(reviewId: string) {
  const r = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { product: { select: { slug: true } } },
  });
  if (r?.product?.slug) revalidatePath(`/product/${r.product.slug}`);
  revalidatePath("/admin/reviews");
}

export async function approveReview(reviewId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
    await revalidateReviewProduct(reviewId);
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث" };
  }
}

export async function rejectReview(reviewId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: false },
    });
    await revalidateReviewProduct(reviewId);
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "فشل التحديث" };
  }
}

export async function deleteReview(reviewId: string) {
  const authz = await requireSession();
  if (!authz.ok) return { success: false as const, error: authz.error };

  try {
    const r = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { slug: true } } },
    });
    await prisma.review.delete({ where: { id: reviewId } });
    if (r?.product?.slug) revalidatePath(`/product/${r.product.slug}`);
    revalidatePath("/admin/reviews");
    return { success: true as const, data: {} };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "تعذر الحذف" };
  }
}
