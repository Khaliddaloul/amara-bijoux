import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveShippingForCheckout } from "@/lib/shipping";

const schema = z.object({
  city: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const result = await resolveShippingForCheckout(parsed.data.city, parsed.data.subtotal);
  return NextResponse.json(result);
}
