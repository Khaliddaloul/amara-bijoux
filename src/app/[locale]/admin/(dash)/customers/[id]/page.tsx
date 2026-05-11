import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { CustomerEditButton } from "@/components/admin/customers/customer-edit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMad } from "@/lib/format";
import { parseJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      addressRows: true,
      orders: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) notFound();

  const tags = parseJson<string[]>(customer.tags, []);
  const ordersCount = customer.orders.length;
  const totalSpent = customer.orders.reduce((s, o) => s + o.total, 0);
  const avgOrder = ordersCount > 0 ? totalSpent / ordersCount : 0;

  const phoneDigits = (customer.phone ?? "").replace(/[^\d]/g, "");
  const whatsappHref = phoneDigits ? `https://wa.me/${phoneDigits}` : null;

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  const addressesFromOrders = customer.orders
    .map((o) => o.shippingAddress)
    .filter(Boolean)
    .filter((addr, i, arr) => arr.indexOf(addr) === i)
    .slice(0, 5);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/customers"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← العملاء
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{fullName || "عميل"}</h1>
          <p className="text-sm text-muted-foreground">
            عميل منذ {new Date(customer.createdAt).toLocaleDateString("ar-MA")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {whatsappHref ? (
            <Button asChild variant="outline" size="sm">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="ms-1 h-4 w-4" />
                افتح واتساب
              </a>
            </Button>
          ) : null}
          <CustomerEditButton
            initial={{
              id: customer.id,
              firstName: customer.firstName,
              lastName: customer.lastName,
              email: customer.email,
              phone: customer.phone,
              tags,
              notes: customer.notes,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>إجمالي الإنفاق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMad(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>عدد الطلبات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>متوسط الطلب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMad(avgOrder)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الاتصال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">البريد: </span>
              {customer.email ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">الهاتف: </span>
              {customer.phone ?? "—"}
            </div>
            <div className="space-x-1 space-x-reverse">
              <span className="text-muted-foreground">الوسوم: </span>
              {tags.length === 0 ? (
                "—"
              ) : (
                tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))
              )}
            </div>
            {customer.notes ? (
              <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <div className="mb-1 font-medium text-foreground">ملاحظات</div>
                {customer.notes}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>العناوين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.addressRows.length === 0 && addressesFromOrders.length === 0 ? (
              <p className="text-muted-foreground">لا يوجد عناوين محفوظة.</p>
            ) : null}
            {customer.addressRows.map((a) => (
              <div key={a.id} className="rounded-md border p-2">
                <div className="font-medium">{a.name}</div>
                <div className="text-muted-foreground">{a.phone}</div>
                <div className="text-xs">
                  {a.city} {a.region ? `· ${a.region}` : ""}
                </div>
                <div className="text-xs text-muted-foreground">{a.address}</div>
              </div>
            ))}
            {customer.addressRows.length === 0 &&
              addressesFromOrders.map((addr, idx) => (
                <div key={idx} className="rounded-md border p-2 text-xs text-muted-foreground">
                  {addr}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جميع الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد طلبات.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3 text-right">#</th>
                    <th className="p-3 text-right">التاريخ</th>
                    <th className="p-3 text-right">الحالة</th>
                    <th className="p-3 text-right">المجموع</th>
                    <th className="p-3 text-right">عرض</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="p-3 font-mono">#{o.orderNumber}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString("ar-MA")}
                      </td>
                      <td className="p-3 text-xs">{o.status}</td>
                      <td className="p-3 font-semibold">{formatMad(o.total)}</td>
                      <td className="p-3">
                        <Link
                          className="text-primary hover:underline"
                          href={`/admin/orders/${o.id}`}
                        >
                          عرض
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
