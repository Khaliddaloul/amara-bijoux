import { z } from "zod";

export const shippingRateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "اسم السعر مطلوب").max(120),
  price: z.coerce.number().min(0),
  minOrder: z.coerce.number().min(0),
  maxOrder: z.coerce.number().min(0).nullable().optional(),
  estimatedDays: z.coerce.number().int().min(0).max(365).nullable().optional(),
});

export const shippingZoneAdminSchema = z.object({
  name: z.string().min(1, "اسم المنطقة مطلوب").max(120),
  regions: z.array(z.string().min(1).max(80)).min(1, "أضيفي مدينة واحدة على الأقل"),
  isActive: z.boolean(),
  rates: z.array(shippingRateSchema).min(1, "أضيفي سعر شحن واحد على الأقل"),
});

export type ShippingZoneAdminInput = z.infer<typeof shippingZoneAdminSchema>;
