import { MenuItemForm } from "@/components/admin/menu-item-form";
import type { MenuItemAdminInput } from "@/lib/validations/admin-cms";

const defaults: MenuItemAdminInput = {
  location: "HEADER",
  label: "",
  url: "/",
  sortOrder: 0,
  parentId: null,
};

export default function NewMenuItemPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">عنصر قائمة جديد</h1>
      <MenuItemForm mode="create" defaultValues={defaults} />
    </div>
  );
}
