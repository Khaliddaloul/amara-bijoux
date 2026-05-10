"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تفاصيل العميل</CardTitle>
        <CardDescription>صفحة تفاصيل ديناميكية — اربطي بيانات Prisma هنا.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        يمكن استبدال هذا القالب بمحرر كامل للمنتج/العميل مع حماية الصلاحيات حسب الدور.
      </CardContent>
    </Card>
  );
}
