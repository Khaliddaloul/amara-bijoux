import { endOfMonth, format, startOfDay, startOfMonth, subDays } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { OrdersPieChart, SalesAreaChart } from "@/components/admin/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLocale, type Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/i18n-helpers";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const localeRaw = await getLocale();
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "ar";
  const t = await getTranslations("adminDashboard");

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
    where: { id: { in: topLines.map((tl) => tl.productId).filter(Boolean) as string[] } },
    select: { id: true, name: true, nameEn: true },
  });

  const topMap = new Map(
    topProducts.map((p) => [p.id, locale === "en" && p.nameEn ? p.nameEn : p.name]),
  );

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
      title: t("kpiTodaySales"),
      value: formatPrice(revenueToday._sum.total ?? 0, locale),
      hint: t("kpiOrdersN", { n: ordersToday }),
    },
    {
      title: t("kpiMonthSales"),
      value: formatPrice(revenueMonth._sum.total ?? 0, locale),
      hint: t("kpiOrdersN", { n: ordersMonth }),
    },
    {
      title: t("kpiActiveProducts"),
      value: String(productsActive),
      hint: t("kpiCategoriesN", { n: categoriesCount }),
    },
    {
      title: t("kpiAvgOrder"),
      value: formatPrice(
        ordersMonth > 0 ? (revenueMonth._sum.total ?? 0) / Math.max(ordersMonth, 1) : 0,
        locale,
      ),
      hint: t("kpiFromOrderData"),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">{t("viewStorefront")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.title}>
            <CardHeader className="pb-2">
              <CardDescription>{k.title}</CardDescription>
              <CardTitle className="text-3xl" dir="ltr">
                {k.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{k.hint}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("salesChartTitle")}</CardTitle>
            <CardDescription>{t("salesChartDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesAreaChart data={salesChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("orderStatusTitle")}</CardTitle>
            <CardDescription>{t("orderStatusDesc")}</CardDescription>
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
              <CardTitle>{t("topProductsTitle")}</CardTitle>
              <CardDescription>{t("topProductsDesc")}</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/products">{t("manageProducts")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {topLines.map((line) => (
              <div
                key={line.productId ?? "x"}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="truncate">
                  {line.productId ? topMap.get(line.productId) ?? t("productPlaceholder") : "—"}
                </div>
                <div className="font-semibold">{t("piecesN", { n: line._sum.quantity ?? 0 })}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("recentOrdersTitle")}</CardTitle>
              <CardDescription>{t("recentOrdersDesc")}</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders">{t("allOrders")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {ordersRecent.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div className="space-y-1">
                  <div className="font-semibold" dir="ltr">
                    #{o.orderNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">{o.customerName}</div>
                </div>
                <div className="text-left">
                  <div className="font-semibold" dir="ltr">
                    {formatPrice(o.total, locale)}
                  </div>
                  <div className="text-xs text-muted-foreground" dir="ltr">
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
