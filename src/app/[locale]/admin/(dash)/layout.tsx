import { AdminChrome } from "@/components/admin/admin-chrome";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
