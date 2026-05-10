"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Mirrors reference “Customer Information” block — navigates to product page for full COD checkout. */
export function ProductSpotlightForm({
  productId,
  slug,
  price,
}: {
  productId: string;
  slug: string;
  price: number;
}) {
  return (
    <div className="rounded-lg border border-[#f0f0f0] bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-black">معلومات العميل</h3>
      <p className="mb-4 text-xs text-[#747474]">
        الحقول مطابقة لترتيب المرجع (الاسم، الهاتف، العنوان). لإتمام الطلب الكامل استخدمي صفحة المنتج أو السلة.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-black">الاسم الكامل</label>
          <Input readOnly placeholder="Full Name" className="border-[#f0f0f0] bg-[#fafafa]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-black">الهاتف</label>
          <Input readOnly placeholder="Phone" className="border-[#f0f0f0] bg-[#fafafa]" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-black">العنوان</label>
          <Input readOnly placeholder="Home Address" className="border-[#f0f0f0] bg-[#fafafa]" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild className="bg-black text-white hover:bg-[#343434]">
          <Link href={`/product/${slug}`}>اطلب الآن — انتقلي للمنتج</Link>
        </Button>
        <span className="self-center text-xs text-[#696969]">
          معرّف المنتج: {productId.slice(0, 8)}… — السعر يبدأ من {price}
        </span>
      </div>
    </div>
  );
}
