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
  /** Translation key under the `adminNav.items` namespace */
  titleKey: string;
  /** Default Arabic title (fallback if translation missing) */
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  /** Translation key under the `adminNav.sections` namespace */
  labelKey: string;
  /** Default Arabic label */
  label: string;
  items: NavItem[];
};

export const adminNavigation: NavSection[] = [
  {
    labelKey: "general",
    label: "عام",
    items: [
      { titleKey: "dashboard", title: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
      { titleKey: "analytics", title: "التحليلات", href: "/admin/analytics", icon: BarChart3 },
      { titleKey: "notifications", title: "الإشعارات", href: "/admin/notifications", icon: Bell },
      { titleKey: "activity", title: "سجل النشاط", href: "/admin/activity", icon: Activity },
    ],
  },
  {
    labelKey: "sales",
    label: "المبيعات",
    items: [
      { titleKey: "orders", title: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
      { titleKey: "customers", title: "العملاء", href: "/admin/customers", icon: Users },
      {
        titleKey: "abandonedCarts",
        title: "سلات مهجورة",
        href: "/admin/abandoned-carts",
        icon: ShoppingCart,
      },
    ],
  },
  {
    labelKey: "products",
    label: "المنتجات",
    items: [
      { titleKey: "products", title: "المنتجات", href: "/admin/products", icon: Package },
      { titleKey: "inventory", title: "المخزون", href: "/admin/inventory", icon: Boxes },
      { titleKey: "categories", title: "الفئات", href: "/admin/categories", icon: FolderTree },
      {
        titleKey: "collections",
        title: "المجموعات",
        href: "/admin/collections",
        icon: LayoutDashboard,
      },
      { titleKey: "discounts", title: "الخصومات", href: "/admin/discounts", icon: Percent },
      { titleKey: "reviews", title: "المراجعات", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    labelKey: "contentStore",
    label: "المحتوى والمتجر",
    items: [
      {
        titleKey: "customizeStore",
        title: "تخصيص الواجهة",
        href: "/admin/storefront",
        icon: Palette,
      },
      { titleKey: "content", title: "المحتوى", href: "/admin/content", icon: FileText },
      { titleKey: "marketing", title: "التسويق", href: "/admin/marketing", icon: Megaphone },
      { titleKey: "media", title: "مكتبة الوسائط", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    labelKey: "operations",
    label: "التشغيل",
    items: [
      { titleKey: "shipping", title: "الشحن", href: "/admin/shipping", icon: Truck },
      { titleKey: "payments", title: "المدفوعات", href: "/admin/payments", icon: Wallet },
      { titleKey: "settings", title: "الإعدادات", href: "/admin/settings", icon: Settings },
      {
        titleKey: "viewStore",
        title: "عرض المتجر",
        href: "/",
        icon: Store,
        badge: "public",
      },
    ],
  },
];
