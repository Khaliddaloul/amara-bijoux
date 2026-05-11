"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ActivityRow = {
  id: string;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: string | null;
  createdAt: Date;
};

export type UserOpt = { id: string; name: string | null; email: string };

export function ActivityAdmin({
  rows,
  users,
  filters,
}: {
  rows: ActivityRow[];
  users: UserOpt[];
  filters: { userId?: string; entity?: string; action?: string; from?: string; to?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [userId, setUserId] = useState(filters.userId ?? "");
  const [entity, setEntity] = useState(filters.entity ?? "");
  const [action, setAction] = useState(filters.action ?? "");
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(params?.toString() ?? "");
    const setOrDel = (k: string, v: string) => {
      if (v.trim()) sp.set(k, v.trim());
      else sp.delete(k);
    };
    setOrDel("userId", userId);
    setOrDel("entity", entity);
    setOrDel("action", action);
    setOrDel("from", from);
    setOrDel("to", to);
    router.push(`/admin/activity?${sp.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">سجل النشاط</h1>
        <p className="text-sm text-muted-foreground">أحدث الإجراءات في لوحة التحكم.</p>
      </div>

      <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5" onSubmit={apply}>
        <div className="space-y-1">
          <Label>المستخدم</Label>
          <Select value={userId || "__all"} onValueChange={(v) => setUserId(v === "__all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">الكل</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name ?? u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>الكيان</Label>
          <Input value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="Product" />
        </div>
        <div className="space-y-1">
          <Label>الإجراء</Label>
          <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="CREATE" />
        </div>
        <div className="space-y-1">
          <Label>من (ISO)</Label>
          <Input dir="ltr" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-01-01" />
        </div>
        <div className="space-y-1">
          <Label>إلى (ISO)</Label>
          <Input dir="ltr" value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-12-31" />
        </div>
        <div className="md:col-span-5 flex justify-end">
          <Button type="submit">تطبيق الفلاتر</Button>
        </div>
      </form>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>إجراء</TableHead>
              <TableHead>كيان</TableHead>
              <TableHead>معرّف</TableHead>
              <TableHead className="max-w-[200px]">بيانات</TableHead>
              <TableHead>وقت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.userName ?? "—"}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell>{r.entity}</TableCell>
                <TableCell className="font-mono text-xs">{r.entityId ?? "—"}</TableCell>
                <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                  {r.metadata ?? "—"}
                </TableCell>
                <TableCell className="text-xs">{format(r.createdAt, "PPp", { locale: ar })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
