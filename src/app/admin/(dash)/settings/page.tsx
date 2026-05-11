import { SettingsAdmin } from "@/components/admin/settings/settings-admin";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import type { SettingsGeneralInput, SettingsSocialInput } from "@/lib/validations/settings-admin";

const defaultGeneral = (): SettingsGeneralInput => ({
  storeName: "أمارا للمجوهرات",
  logo: "",
  favicon: "",
  storeEmail: "",
  storePhone: "",
  address: "",
  city: "",
  country: "المغرب",
  currency: "MAD",
  timezone: "Africa/Casablanca",
  language: "ar",
});

const defaultSocial = (): SettingsSocialInput => ({
  whatsapp: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  twitter: "",
});

export default async function SettingsPage() {
  const [generalRow, socialRow, emailRow, msgRow, users] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "settings.general" } }),
    prisma.setting.findUnique({ where: { key: "settings.social" } }),
    prisma.setting.findUnique({ where: { key: "settings.emailTemplates" } }),
    prisma.setting.findUnique({ where: { key: "settings.messagingTemplates" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  const general = parseJson<Partial<SettingsGeneralInput>>(generalRow?.value ?? "{}", {});
  const social = parseJson<Partial<SettingsSocialInput>>(socialRow?.value ?? "{}", {});
  const emailTemplates = parseJson<Record<string, { subject?: string; body?: string }>>(
    emailRow?.value ?? "{}",
    {},
  );
  const messagingTemplates = parseJson<{ whatsappOrder?: string; smsOrder?: string }>(
    msgRow?.value ?? "{}",
    {},
  );

  return (
    <SettingsAdmin
      initialGeneral={{ ...defaultGeneral(), ...general }}
      initialSocial={{ ...defaultSocial(), ...social }}
      initialEmailTemplates={{
        orderConfirmation: {
          subject: emailTemplates.orderConfirmation?.subject ?? "",
          body: emailTemplates.orderConfirmation?.body ?? "",
        },
        shipping: {
          subject: emailTemplates.shipping?.subject ?? "",
          body: emailTemplates.shipping?.body ?? "",
        },
        delivered: {
          subject: emailTemplates.delivered?.subject ?? "",
          body: emailTemplates.delivered?.body ?? "",
        },
        cancelled: {
          subject: emailTemplates.cancelled?.subject ?? "",
          body: emailTemplates.cancelled?.body ?? "",
        },
      }}
      initialMessaging={{
        whatsappOrder: messagingTemplates.whatsappOrder ?? "",
        smsOrder: messagingTemplates.smsOrder ?? "",
      }}
      users={users}
    />
  );
}
