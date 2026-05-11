import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  qty: z.number().int().min(1),
  image: z.string().optional().nullable(),
});

const bodySchema = z.object({
  customerEmail: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  customerPhone: z.string().max(40).optional().nullable(),
  items: z.array(itemSchema).min(1),
  subtotal: z.number().min(0),
  cartId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "بيانات غير صالحة" },
        { status: 400 },
      );
    }
    const { customerEmail, customerPhone, items, subtotal, cartId } = parsed.data;

    const data = {
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      items: JSON.stringify(items),
      subtotal,
    };

    if (cartId) {
      const existing = await prisma.abandonedCart.findUnique({ where: { id: cartId } });
      if (existing) {
        await prisma.abandonedCart.update({
          where: { id: cartId },
          data: { ...data, recoveredAt: null },
        });
        return NextResponse.json({ ok: true, cartId });
      }
    }

    const created = await prisma.abandonedCart.create({ data });
    return NextResponse.json({ ok: true, cartId: created.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "خطأ في الخادم" }, { status: 500 });
  }
}
