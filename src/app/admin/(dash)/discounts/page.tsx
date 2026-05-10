"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الخصومات</CardTitle>
        <CardDescription>
          هذه الواجهة جزء من المنصة الموسّعة (تجربة Shopify للعربية). الهيكل، التوجيه، وقاعدة البيانات جاهزة —
          يمكن ربط الجداول الكاملة، النماذج، والرفع هنا دون تغيير المسارات.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        استخدمي نفس أنماط shadcn/ui وTanStack Table وReact Query المفعّلة في المشروع لإكمال CRUD والفلاتر.
      </CardContent>
    </Card>
  );
}
