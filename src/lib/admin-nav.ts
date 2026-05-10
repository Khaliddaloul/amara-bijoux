import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Package,
  Palette,
  Percent,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Users,
  Wallet,
  FileText,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = { label: string; items: NavItem[] };

export const adminNavigation: NavSection[] = [
  {
    label: "عام",
    items: [
      { title: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
      { title: "التحليلات", href: "/admin/analytics", icon: BarChart3 },
      { title: "الإشعارات", href: "/admin/notifications", icon: Bell },
      { title: "سجل النشاط", href: "/admin/activity", icon: Activity },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { title: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
      { title: "العملاء", href: "/admin/customers", icon: Users },
      { title: "سلات مهجورة", href: "/admin/abandoned-carts", icon: ShoppingCart },
    ],
  },
  {
    label: "المنتجات",
    items: [
      { title: "المنتجات", href: "/admin/products", icon: Package },
      { title: "المخزون", href: "/admin/inventory", icon: Boxes },
      { title: "الفئات", href: "/admin/categories", icon: FolderTree },
      { title: "المجموعات", href: "/admin/collections", icon: LayoutDashboard },
      { title: "الخصومات", href: "/admin/discounts", icon: Percent },
      { title: "المراجعات", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "المحتوى والمتجر",
    items: [
      { title: "تخصيص الواجهة", href: "/admin/storefront", icon: Palette },
      { title: "المحتوى", href: "/admin/content", icon: FileText },
      { title: "التسويق", href: "/admin/marketing", icon: Megaphone },
      { title: "مكتبة الوسائط", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "التشغيل",
    items: [
      { title: "الشحن", href: "/admin/shipping", icon: Truck },
      { title: "المدفوعات", href: "/admin/payments", icon: Wallet },
      { title: "الإعدادات", href: "/admin/settings", icon: Settings },
      { title: "عرض المتجر", href: "/", icon: Store, badge: "public" },
    ],
  },
];
