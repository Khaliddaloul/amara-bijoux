import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(4000),
  guestName: z.string().min(2).max(120).optional(),
  guestEmail: z.union([z.string().email(), z.literal("")]).optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const { productId, rating, title, body, guestName, guestEmail } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "منتج غير متاح" }, { status: 400 });
  }

  await prisma.review.create({
    data: {
      productId,
      rating,
      title: title ?? null,
      body,
      guestName: guestName ?? null,
      guestEmail: guestEmail || null,
      isApproved: false,
    },
  });

  const owners = await prisma.user.findMany({ where: { role: "OWNER" }, select: { id: true } });
  for (const o of owners) {
    await prisma.notification.create({
      data: {
        userId: o.id,
        type: "REVIEW",
        title: "مراجعة بانتظار الموافقة",
        body: `تعليق جديد على ${product.name}`,
        link: "/admin/reviews",
        isRead: false,
      },
    });
  }

  revalidatePath(`/product/${product.slug}`);

  return NextResponse.json({ ok: true });
}
