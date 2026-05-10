import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { customerName, phone, address, city, items } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) }, status: "ACTIVE" },
      });

      if (products.length !== items.length) {
        throw new Error("منتج غير متاح");
      }

      let subtotal = 0;
      const lines: Array<{
        productId: string;
        name: string;
        sku: string | null;
        price: number;
        quantity: number;
        total: number;
      }> = [];

      for (const line of items) {
        const product = products.find((p) => p.id === line.productId)!;
        if (product.trackQuantity && product.quantity < line.quantity) {
          throw new Error("الكمية غير متوفرة");
        }
        const lineTotal = product.price * line.quantity;
        subtotal += lineTotal;
        lines.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: line.quantity,
          total: lineTotal,
        });
      }

      const last = await tx.order.findFirst({
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });
      const orderNumber = (last?.orderNumber ?? 1000) + 1;
      const shippingCost = subtotal > 500 ? 0 : 35;
      const total = subtotal + shippingCost;

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone: phone,
          shippingAddress: JSON.stringify({ city, address, region: "المغرب" }),
          billingAddress: JSON.stringify({ city, address }),
          subtotal,
          shippingCost,
          tax: 0,
          discount: 0,
          total,
          currency: "MAD",
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: "COD",
          items: { create: lines },
        },
      });

      for (const line of items) {
        await tx.product.update({
          where: { id: line.productId },
          data: { quantity: { decrement: line.quantity } },
        });
      }

      return created;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber });
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطأ غير متوقع";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
