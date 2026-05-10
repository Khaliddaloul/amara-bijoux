import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="font-display text-3xl">تواصل معنا</h1>
      <Card>
        <CardHeader>
          <CardTitle>خدمة العملاء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed">
          <div>الهاتف / واتساب: +212600000000</div>
          <div>البريد: contact@amara.ma</div>
          <div>العنوان: الدار البيضاء، المغرب</div>
        </CardContent>
      </Card>
    </div>
  );
}
