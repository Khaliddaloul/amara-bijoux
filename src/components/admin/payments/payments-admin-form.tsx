"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { savePaymentMethods } from "@/actions/admin/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  paymentMethodsSchema,
  type PaymentMethodsInput,
} from "@/lib/validations/payment-methods";

export function PaymentsAdminForm({ initial }: { initial: PaymentMethodsInput }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<PaymentMethodsInput>({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: initial,
  });

  function onSubmit(values: PaymentMethodsInput) {
    startTransition(async () => {
      const res = await savePaymentMethods(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("تم حفظ طرق الدفع");
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="text-2xl font-semibold">طرق الدفع</h1>
          <p className="text-sm text-muted-foreground">تُحفظ في الإعدادات تحت المفتاح payment.methods</p>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                الدفع عند الاستلام
                <FormField
                  control={form.control}
                  name="cod.enabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardTitle>
              <CardDescription>COD — رسوم إضافية اختيارية ورسالة للعميلة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="cod.extraFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسوم إضافية (د.م.)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cod.customerMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسالة للعميلة</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                تحويل بنكي
                <FormField
                  control={form.control}
                  name="bankTransfer.enabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardTitle>
              <CardDescription>يظهر رقم الحساب في صفحة الدفع عند الاختيار.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="bankTransfer.bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم البنك</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankTransfer.accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الحساب</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="text-left" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankTransfer.accountHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم صاحب الحساب</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankTransfer.rib"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RIB</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="text-left" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                بطاقة بنكية
                <FormField
                  control={form.control}
                  name="card.enabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardTitle>
              <CardDescription>وضع تجريبي — إخلاء مسؤولية للعميلة.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="card.disclaimer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>إخلاء مسؤولية</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : null}
          حفظ طرق الدفع
        </Button>
      </form>
    </Form>
  );
}
