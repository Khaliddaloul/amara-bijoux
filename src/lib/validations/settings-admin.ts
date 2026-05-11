import { z } from "zod";

const templatePair = z.object({
  subject: z.string().max(200).optional().nullable(),
  body: z.string().max(8000).optional().nullable(),
});

export const settingsGeneralSchema = z.object({
  storeName: z.string().min(1).max(200),
  logo: z.string().max(2000).optional().nullable(),
  favicon: z.string().max(2000).optional().nullable(),
  storeEmail: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  storePhone: z.string().max(40).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  currency: z.string().min(1).max(12),
  timezone: z.string().max(80).optional().nullable(),
  language: z.string().max(20).optional().nullable(),
});

export const settingsSocialSchema = z.object({
  whatsapp: z.string().max(40).optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  tiktok: z.string().max(200).optional().nullable(),
  youtube: z.string().max(200).optional().nullable(),
  twitter: z.string().max(200).optional().nullable(),
});

export const settingsEmailTemplatesSchema = z.object({
  orderConfirmation: templatePair,
  shipping: templatePair,
  delivered: templatePair,
  cancelled: templatePair,
});

export const settingsMessagingTemplatesSchema = z.object({
  whatsappOrder: z.string().max(4000).optional().nullable(),
  smsOrder: z.string().max(4000).optional().nullable(),
});

export type SettingsGeneralInput = z.infer<typeof settingsGeneralSchema>;
export type SettingsSocialInput = z.infer<typeof settingsSocialSchema>;
