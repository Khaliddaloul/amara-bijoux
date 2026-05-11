"use server";

import { revalidatePath } from "next/cache";
import { evaluateDiscountCode } from "@/lib/discount-engine";
import { getPaymentMethods } from "@/lib/payment-settings";
import { prisma } from "@/lib/prisma";
import { resolveShippingForCheckout } from "@/lib/shipping";
import { createOrderSchema } from "@/lib/validations";

export type CreateCheckoutOrderResult =
  | { ok: true; id: string; orderNumber: number }
  | { ok: false; error: string };

function mad(n: number) {
  return `${n.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م.`;
}

/** Storefront checkout — called from `/api/orders` after validation. */
export async function createCheckoutOrder(body: unknown): Promise<CreateCheckoutOrderResult> {
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "بيانات غير صالحة" };
  }

  const { customerName, phone, address, city, items, discountCode, paymentMethod, shippingRateId } =
    parsed.data;

  try {
    const paymentCfg = await getPaymentMethods();
    if (paymentMethod === "COD" && !paymentCfg.cod.enabled) {
      return { ok: false, error: "الدفع عند الاستلام غير متاح حالياً" };
    }
    if (paymentMethod === "BANK" && !paymentCfg.bankTransfer.enabled) {
      return { ok: false, error: "التحويل البنكي غير متاح" };
    }
    if (paymentMethod === "CARD" && !paymentCfg.card.enabled) {
      return { ok: false, error: "الدفع بالبطاقة غير متاح" };
    }

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

      let discountAmount = 0;
      let freeShipping = false;
      let appliedCode: string | undefined;
      let discountRowId: string | undefined;

      if (discountCode?.trim()) {
        const discountEval = await evaluateDiscountCode(discountCode, subtotal);
        if (!discountEval.ok) {
          throw new Error(discountEval.message);
        }
        discountAmount = discountEval.discountAmount;
        freeShipping = discountEval.freeShipping;
        appliedCode = discountEval.code;
        discountRowId = discountEval.discountId;
      }

      const netAfterDiscount = Math.max(0, subtotal - discountAmount);

      const resolved = await resolveShippingForCheckout(city, netAfterDiscount);
      let shippingCost = 0;
      let shippingLabel: string | undefined;

      if (!freeShipping) {
        const list = resolved.applicableRates;
        let rate = resolved.cheapestRate;
        if (shippingRateId != null) {
          const found = list.find((r) => r.id === shippingRateId);
          if (!found) throw new Error("خيار الشحن غير صالح");
          rate = found;
        }
        if (!rate) throw new Error("تعذر حساب الشحن");
        shippingCost = rate.price;
        shippingLabel = rate.name;
      }

      let feeExtra = 0;
      if (paymentMethod === "COD") {
        feeExtra = paymentCfg.cod.extraFee ?? 0;
      }

      const total = netAfterDiscount + shippingCost + feeExtra;

      const last = await tx.order.findFirst({
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });
      const orderNumber = (last?.orderNumber ?? 1000) + 1;

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
          discount: discountAmount,
          discountCode: appliedCode ?? null,
          total,
          currency: "MAD",
          status: "PENDING",
          paymentStatus: paymentMethod === "BANK" ? "PENDING" : "PENDING",
          paymentMethod,
          shippingMethod: shippingLabel ?? null,
          items: { create: lines },
        },
      });

      if (discountRowId) {
        await tx.discount.update({
          where: { id: discountRowId },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const line of items) {
        await tx.product.update({
          where: { id: line.productId },
          data: { quantity: { decrement: line.quantity } },
        });
      }

      const owners = await tx.user.findMany({
        where: { role: "OWNER" },
        select: { id: true },
      });
      const targets =
        owners.length > 0 ? owners : await tx.user.findMany({ take: 3, select: { id: true } });

      for (const u of targets) {
        await tx.notification.create({
          data: {
            userId: u.id,
            type: "ORDER",
            title: `طلب جديد #${orderNumber}`,
            body: `${customerName} — ${mad(total)}`,
            link: `/admin/orders/${created.id}`,
            isRead: false,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          action: "CREATE",
          entity: "Order",
          entityId: created.id,
          metadata: JSON.stringify({ orderNumber, total, paymentMethod }),
        },
      });

      return created;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/checkout");

    return { ok: true, id: order.id, orderNumber: order.orderNumber };
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطأ غير متوقع";
    return { ok: false, error: message };
  }
}
