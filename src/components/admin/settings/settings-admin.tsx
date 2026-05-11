"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  saveSettingsEmailTemplates,
  saveSettingsGeneral,
  saveSettingsMessagingTemplates,
  saveSettingsSocial,
} from "@/actions/admin/settings";
import { inviteStaffUser } from "@/actions/admin/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  settingsEmailTemplatesSchema,
  settingsGeneralSchema,
  settingsMessagingTemplatesSchema,
  settingsSocialSchema,
  type SettingsGeneralInput,
  type SettingsSocialInput,
} from "@/lib/validations/settings-admin";
import type { z } from "zod";

type Props = {
  initialGeneral: SettingsGeneralInput;
  initialSocial: SettingsSocialInput;
  initialEmailTemplates: z.infer<typeof settingsEmailTemplatesSchema>;
  initialMessaging: { whatsappOrder: string; smsOrder: string };
  users: Array<{ id: string; name: string | null; email: string; role: string }>;
};

export function SettingsAdmin({
  initialGeneral,
  initialSocial,
  initialEmailTemplates,
  initialMessaging,
  users,
}: Props) {
  const [pendingG, startG] = useTransition();
  const [pendingS, startS] = useTransition();
  const [pendingE, startE] = useTransition();
  const [pendingM, startM] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [pendingInv, startInv] = useTransition();

  const formG = useForm({ resolver: zodResolver(settingsGeneralSchema), defaultValues: initialGeneral });
  const formS = useForm({ resolver: zodResolver(settingsSocialSchema), defaultValues: initialSocial });
  const formE = useForm({
    resolver: zodResolver(settingsEmailTemplatesSchema),
    defaultValues: initialEmailTemplates,
  });
  const formM = useForm({
    resolver: zodResolver(settingsMessagingTemplatesSchema),
    defaultValues: {
      whatsappOrder: initialMessaging.whatsappOrder,
      smsOrder: initialMessaging.smsOrder,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">إعدادات المتجر</h1>
        <p className="text-sm text-muted-foreground">تُحفظ الأقسام في مفاتيح settings.* داخل جدول الإعدادات.</p>
      </div>

      <Tabs defaultValue="general" dir="rtl" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="social">الاتصال والسوشيال</TabsTrigger>
          <TabsTrigger value="templates">قوالب البريد</TabsTrigger>
          <TabsTrigger value="messaging">واتساب / SMS</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Form {...formG}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={formG.handleSubmit((v) =>
                startG(async () => {
                  const res = await saveSettingsGeneral(v);
                  toast[res.success ? "success" : "error"](res.success ? "تم الحفظ" : res.error);
                }),
              )}
            >
              <FormField
                control={formG.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المتجر</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MAD">MAD — درهم</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="logo"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>شعار (URL)</FormLabel>
                    <FormControl>
                      <Input dir="ltr" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="favicon"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Favicon (URL)</FormLabel>
                    <FormControl>
                      <Input dir="ltr" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="storeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد</FormLabel>
                    <FormControl>
                      <Input dir="ltr" type="email" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="storePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الهاتف</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدينة</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البلد</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المنطقة الزمنية</FormLabel>
                    <FormControl>
                      <Input dir="ltr" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formG.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللغة</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Button type="submit" disabled={pendingG}>
                  {pendingG ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                  حفظ الإعدادات العامة
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="social" className="space-y-4 pt-4">
          <Form {...formS}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={formS.handleSubmit((v) =>
                startS(async () => {
                  const res = await saveSettingsSocial(v);
                  toast[res.success ? "success" : "error"](res.success ? "تم الحفظ" : res.error);
                }),
              )}
            >
              {(
                ["whatsapp", "instagram", "facebook", "tiktok", "youtube", "twitter"] as const
              ).map((key) => (
                <FormField
                  key={key}
                  control={formS.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <div className="md:col-span-2">
                <Button type="submit" disabled={pendingS}>
                  {pendingS ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                  حفظ التواصل والسوشيال
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 pt-4">
          <Form {...formE}>
            <form
              className="space-y-6"
              onSubmit={formE.handleSubmit((v) =>
                startE(async () => {
                  const res = await saveSettingsEmailTemplates(v);
                  toast[res.success ? "success" : "error"](res.success ? "تم الحفظ" : res.error);
                }),
              )}
            >
              {(
                [
                  ["orderConfirmation", "تأكيد طلب"],
                  ["shipping", "شحن"],
                  ["delivered", "تسليم"],
                  ["cancelled", "إلغاء"],
                ] as const
              ).map(([key, label]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <CardDescription>
                      متغيرات مقترحة: {"{{customerName}}"} ، {"{{orderNumber}}"} ، {"{{total}}"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-1">
                    <FormField
                      control={formE.control}
                      name={`${key}.subject`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموضوع</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formE.control}
                      name={`${key}.body`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المحتوى</FormLabel>
                          <FormControl>
                            <Textarea rows={5} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
              <Button type="submit" disabled={pendingE}>
                {pendingE ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                حفظ قوالب البريد
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4 pt-4">
          <Form {...formM}>
            <form
              className="space-y-4"
              onSubmit={formM.handleSubmit((v) =>
                startM(async () => {
                  const res = await saveSettingsMessagingTemplates(v);
                  toast[res.success ? "success" : "error"](res.success ? "تم الحفظ" : res.error);
                }),
              )}
            >
              <FormField
                control={formM.control}
                name="whatsappOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قالب واتساب — طلب</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formM.control}
                name="smsOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قالب SMS — طلب</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={pendingM}>
                {pendingM ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                حفظ القوالب
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(true)}>
              <MailPlus className="ms-2 h-4 w-4" />
              دعوة موظفة
            </Button>
          </div>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الدور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name ?? "—"}</TableCell>
                    <TableCell dir="ltr" className="text-left">
                      {u.email}
                    </TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>دعوة مستخدم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد</label>
                <Input
                  dir="ltr"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@example.ma"
                />
                <p className="text-xs text-muted-foreground">سيتم إنشاء كلمة مرور مؤقتة وعرضها مرة واحدة.</p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  disabled={pendingInv}
                  onClick={() =>
                    startInv(async () => {
                      const res = await inviteStaffUser({ email: inviteEmail.trim(), role: "STAFF" });
                      if (!res.success) {
                        toast.error(res.error);
                        return;
                      }
                      toast.success(`كلمة المرور المؤقتة: ${res.data.temporaryPassword}`);
                      setInviteOpen(false);
                      setInviteEmail("");
                      window.location.reload();
                    })
                  }
                >
                  {pendingInv ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
                  إنشاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="api" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API و Webhooks</CardTitle>
              <CardDescription>
                قيد التطوير — ربط الويب هوكس والمفاتيح الخارجية سيُضاف لاحقاً ضمن إعدادات آمنة.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              لا تُخزَّن مفاتيح API في الواجهة حتى يكتمل التصميم الأمني.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
