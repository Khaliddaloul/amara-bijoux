import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <StorefrontShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-black">اتصل بنا</h1>
        <Card className="border-[#f0f0f0]">
          <CardHeader>
            <CardTitle>خدمة العملاء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-[#4d4d4d]">
            <div>الهاتف / واتساب: +212600000000</div>
            <div>البريد: contact@amara.ma</div>
            <div>العنوان: الدار البيضاء، المغرب</div>
          </CardContent>
        </Card>
      </div>
    </StorefrontShell>
  );
}
