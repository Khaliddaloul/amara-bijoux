import { NextResponse } from "next/server";
import { createCheckoutOrder } from "@/actions/admin/orders";
import { createOrderSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createCheckoutOrder(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id, orderNumber: result.orderNumber });
}
