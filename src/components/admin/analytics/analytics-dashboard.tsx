"use client";

import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { ar } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { exportAnalyticsCsv } from "@/actions/admin/analytics-export";
import type { AnalyticsSnapshot } from "@/lib/admin/analytics-data";
import { formatMad } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
const COLORS = ["#000000", "#00BF0E", "#c9a24d", "#696969", "#F44336", "#2196F3"];

type Props = {
  initial: AnalyticsSnapshot;
  fromIso: string;
  toIso: string;
};

export function AnalyticsDashboard({ initial, fromIso, toIso }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [rangeOpen, setRangeOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(new Date(fromIso));
  const [customTo, setCustomTo] = useState<Date | undefined>(new Date(toIso));

  const from = useMemo(() => new Date(fromIso), [fromIso]);
  const to = useMemo(() => new Date(toIso), [toIso]);

  function applyRange(nextFrom: Date, nextTo: Date) {
    const sp = new URLSearchParams(params?.toString() ?? "");
    sp.set("from", nextFrom.toISOString());
    sp.set("to", nextTo.toISOString());
    router.push(`/admin/analytics?${sp.toString()}`);
  }

  function preset(kind: "today" | "week" | "month" | "year") {
    const end = endOfDay(new Date());
    let start = startOfDay(new Date());
    if (kind === "today") start = startOfDay(new Date());
    else if (kind === "week") start = startOfDay(subDays(end, 7));
    else if (kind === "month") start = startOfDay(subMonths(end, 1));
    else if (kind === "year") start = startOfDay(subYears(end, 1));
    applyRange(start, end);
  }

  function exportCsv() {
    startTransition(async () => {
      const res = await exportAnalyticsCsv(fromIso, toIso);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const bin = atob(res.data.base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل CSV");
    });
  }

  const axisDaily = useMemo(() => {
    const days = eachDayOfInterval({ start: from, end: to });
    const map = new Map(initial.dailySales.map((d) => [d.date, d.total]));
    return days.map((d) => ({
      label: format(d, "d MMM", { locale: ar }),
      total: map.get(format(d, "yyyy-MM-dd")) ?? 0,
    }));
  }, [from, to, initial.dailySales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">التحليلات</h1>
          <p className="text-sm text-muted-foreground">
            من {format(from, "PPP", { locale: ar })} إلى {format(to, "PPP", { locale: ar })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => preset("today")}>
            اليوم
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => preset("week")}>
            أسبوع
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => preset("month")}>
            شهر
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => preset("year")}>
            سنة
          </Button>
          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="secondary" size="sm">
                مخصص
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto space-y-3 p-3" align="end" dir="rtl">
              <p className="text-xs font-medium">من — إلى</p>
              <div className="flex gap-4">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">من</p>
                  <Calendar
                    mode="single"
                    selected={customFrom}
                    onSelect={(d) => setCustomFrom(d ?? undefined)}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">إلى</p>
                  <Calendar
                    mode="single"
                    selected={customTo}
                    onSelect={(d) => setCustomTo(d ?? undefined)}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (customFrom && customTo) {
                    applyRange(startOfDay(customFrom), endOfDay(customTo));
                    setRangeOpen(false);
                  }
                }}
              >
                تطبيق
              </Button>
            </PopoverContent>
          </Popover>
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => exportCsv()}>
            تصدير CSV
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => toast.message("تصدير PDF — قيد التطوير")}
          >
            PDF (قريباً)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi title="إجمالي المبيعات" value={formatMad(initial.totalSales)} />
        <Kpi title="عدد الطلبات" value={String(initial.orderCount)} />
        <Kpi title="متوسط الطلب" value={formatMad(initial.avgOrder)} />
        <Kpi title="عملاء جدد" value={String(initial.newCustomers)} />
        <Kpi
          title="معدل التحويل"
          hint="تقديري"
          value={`${(initial.conversionRate * 100).toFixed(1)}٪`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>مبيعات يومية</CardTitle>
            <CardDescription>مجموع الطلبات حسب اليوم</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={axisDaily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatMad(v)} />
                <Line type="monotone" dataKey="total" stroke="#000000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مبيعات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initial.salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatMad(v)} />
                <Bar dataKey="total" fill="#00BF0E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>حالات الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 md:flex-row">
          <div className="h-[280px] w-full max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={initial.ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {initial.ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <RankTable title="أفضل المنتجات (إيراد)" rows={initial.topProducts.map((r) => ({ a: r.name, b: formatMad(r.revenue) }))} />
        <RankTable title="أفضل العملاء (إنفاق)" rows={initial.topCustomers.map((r) => ({ a: r.name, b: formatMad(r.spend) }))} />
        <RankTable title="أفضل المدن (طلبات)" rows={initial.topCities.map((r) => ({ a: r.city, b: String(r.orders) }))} />
      </div>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1">
          {title}
          {hint ? <span className="text-[10px] text-muted-foreground">({hint})</span> : null}
        </CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function RankTable({
  title,
  rows,
}: {
  title: string;
  rows: { a: string; b: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead className="text-end">القيمة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((r, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell className="max-w-[140px] truncate">{r.a}</TableCell>
                <TableCell className="text-end font-medium">{r.b}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
