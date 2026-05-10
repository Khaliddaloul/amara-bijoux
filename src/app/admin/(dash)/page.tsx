import { endOfMonth, format, startOfDay, startOfMonth, subDays } from "date-fns";
import Link from "next/link";
import { OrdersPieChart, SalesAreaChart } from "@/components/admin/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    ordersToday,
    revenueToday,
    ordersMonth,
    revenueMonth,
    productsActive,
    categoriesCount,
    ordersRecent,
    ordersLast30,
    statusGroups,
    topLines,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: subDays(now, 30) } },
      select: { createdAt: true, total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const topProducts = await prisma.product.findMany({
    where: { id: { in: topLines.map((t) => t.productId).filter(Boolean) as string[] } },
    select: { id: true, name: true },
  });

  const topMap = new Map(topProducts.map((p) => [p.id, p.name]));

  const salesByDay = new Map<string, number>();
  for (const o of ordersLast30) {
    const key = format(o.createdAt, "yyyy-MM-dd");
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + o.total);
  }
  const salesChart = Array.from(salesByDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date, total }));

  const pieData = statusGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
  }));

  const kpis = [
    {
      title: "مبيعات اليوم",
      value: formatMad(revenueToday._sum.total ?? 0),
      hint: `${ordersToday} طلب`,
    },
    {
      title: "مبيعات الشهر",
      value: formatMad(revenueMonth._sum.total ?? 0),
      hint: `${ordersMonth} طلب`,
    },
    {
      title: "منتجات نشطة",
      value: String(productsActive),
      hint: `${categoriesCount} فئة`,
    },
    {
      title: "متوسط قيمة الطلب (تقريبي)",
      value: formatMad(
        ordersMonth > 0 ? (revenueMonth._sum.total ?? 0) / Math.max(ordersMonth, 1) : 0,
      ),
      hint: "من بيانات الطلبات",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            نظرة شاملة على المبيعات والطلبات — تجربة مستوى Shopify مبسطة للعربية.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">عرض المتجر</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.title}>
            <CardHeader className="pb-2">
              <CardDescription>{k.title}</CardDescription>
              <CardTitle className="text-3xl">{k.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{k.hint}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المبيعات — آخر 30 يوماً</CardTitle>
            <CardDescription>مجموع إجمالي الطلبات يومياً</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesAreaChart data={salesChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
            <CardDescription>ملخص حي من قاعدة البيانات</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersPieChart data={pieData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>حسب كمية بنود الطلبات</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/products">إدارة المنتجات</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {topLines.map((line) => (
              <div
                key={line.productId ?? "x"}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="truncate">
                  {line.productId ? topMap.get(line.productId) ?? "منتج" : "—"}
                </div>
                <div className="font-semibold">{line._sum.quantity ?? 0} قطعة</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>آخر الطلبات</CardTitle>
              <CardDescription>آخر 10 طلبات مسجّلة</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders">كل الطلبات</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {ordersRecent.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div className="space-y-1">
                  <div className="font-semibold">#{o.orderNumber}</div>
                  <div className="text-xs text-muted-foreground">{o.customerName}</div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">{formatMad(o.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(o.createdAt, "yyyy/MM/dd HH:mm")}
                  </div>
                </div>
                <div className="text-xs">
                  <span className="rounded-full bg-muted px-2 py-1">{o.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
