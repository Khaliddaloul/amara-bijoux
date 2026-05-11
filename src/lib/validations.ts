import { z } from "zod";

export const orderItemInput = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب").max(120),
  phone: z.string().min(8, "رقم هاتف صالح").max(32),
  address: z.string().min(5, "العنوان مطلوب").max(500),
  city: z.string().min(2, "المدينة مطلوبة").max(80),
  items: z.array(orderItemInput).min(1, "السلة فارغة"),
  discountCode: z.string().max(40).optional(),
  paymentMethod: z.enum(["COD", "BANK", "CARD"]).optional().default("COD"),
  shippingRateId: z.string().optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(5).max(5000),
  price: z.coerce.number().positive(),
  oldPrice: z.coerce.number().nonnegative().optional().nullable(),
  categoryId: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string().min(4)).min(1).max(8),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "رابط المنتج: أحرف لاتينية صغيرة وأرقام وشرطات"),
});

export const categoryFormSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  image: z.string().min(4).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const settingsSchema = z.object({
  storeName: z.string().min(1).max(120),
  logo: z.string().max(500).optional(),
  whatsapp: z.string().max(40).optional(),
  instagram: z.string().max(120).optional(),
  facebook: z.string().max(120).optional(),
  announcement: z.string().max(500).optional(),
});
