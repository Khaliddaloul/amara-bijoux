import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateDiscountCode } from "@/lib/discount-engine";

const bodySchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
    }
    const res = await evaluateDiscountCode(parsed.data.code, parsed.data.subtotal);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.message });
    }
    return NextResponse.json({
      ok: true,
      discountAmount: res.discountAmount,
      freeShipping: res.freeShipping,
      code: res.code,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "خطأ في الخادم" }, { status: 500 });
  }
}
