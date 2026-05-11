import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const cart = await prisma.abandonedCart.findUnique({ where: { id: params.id } });
  if (!cart) {
    return NextResponse.json({ ok: false, error: "غير موجود" }, { status: 404 });
  }
  let items: unknown = [];
  try {
    items = JSON.parse(cart.items);
  } catch {
    items = [];
  }
  return NextResponse.json({
    ok: true,
    cart: {
      id: cart.id,
      items,
      subtotal: cart.subtotal,
      customerEmail: cart.customerEmail,
      customerPhone: cart.customerPhone,
    },
  });
}
