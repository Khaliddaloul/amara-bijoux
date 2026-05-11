import { z } from "zod";

export const pageAdminSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  slug: z.string().min(1, "المسار مطلوب"),
  content: z.string(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  isPublished: z.boolean(),
});

export type PageAdminInput = z.infer<typeof pageAdminSchema>;

export const blogAdminSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  featuredImage: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  publishedAt: z.coerce.date().nullable().optional(),
  isPublished: z.boolean(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export type BlogAdminInput = z.infer<typeof blogAdminSchema>;

export const bannerAdminSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "الصورة مطلوبة"),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int(),
  isActive: z.boolean(),
});

export type BannerAdminInput = z.infer<typeof bannerAdminSchema>;

export const menuItemAdminSchema = z.object({
  location: z.enum(["HEADER", "FOOTER"]),
  label: z.string().min(1),
  url: z.string().min(1),
  sortOrder: z.coerce.number().int(),
  parentId: z.string().optional().nullable(),
});

export type MenuItemAdminInput = z.infer<typeof menuItemAdminSchema>;

export const popupAdminSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  message: z.string(),
  image: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  delaySec: z.coerce.number().int().min(0),
  showOnExit: z.boolean(),
  closeAfterSec: z.coerce.number().int().min(0).nullable().optional(),
  position: z.enum(["center", "bottom-right", "bottom-left", "top"]),
  targetPages: z.array(z.string()).default(["all"]),
  viewCount: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
});

export type PopupAdminInput = z.infer<typeof popupAdminSchema>;

export const pixelsAdminSchema = z.object({
  facebookPixelId: z.string().optional(),
  tiktokPixelId: z.string().optional(),
  gtmId: z.string().optional(),
  gaId: z.string().optional(),
  snapPixelId: z.string().optional(),
});

export type PixelsAdminInput = z.infer<typeof pixelsAdminSchema>;

export const campaignAdminSchema = z.object({
  title: z.string().min(1),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
  subject: z.string().optional().nullable(),
  body: z.string(),
  recipientFilter: z.enum(["all_customers", "tag", "segment"]).default("all_customers"),
  recipientTag: z.string().optional().nullable(),
});

export type CampaignAdminInput = z.infer<typeof campaignAdminSchema>;

export const storefrontThemeSchema = z.object({
  primary: z.string(),
  accent: z.string(),
  background: z.string(),
  foreground: z.string(),
  font: z.enum(["Cairo", "Tajawal", "Almarai", "IBM Plex Sans Arabic"]),
  logoUrl: z.string(),
  faviconUrl: z.string(),
});

export const storefrontSectionsSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string(),
    visible: z.boolean(),
    order: z.number(),
  }),
);
