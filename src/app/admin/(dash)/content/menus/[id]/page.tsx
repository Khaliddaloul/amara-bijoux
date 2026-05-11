import { notFound } from "next/navigation";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { prisma } from "@/lib/prisma";
import type { MenuItemAdminInput } from "@/lib/validations/admin-cms";

export default async function EditMenuItemPage({ params }: { params: { id: string } }) {
  const row = await prisma.menuItem.findUnique({ where: { id: params.id } });
  if (!row) notFound();

  const defaultValues: MenuItemAdminInput = {
    location: row.location as "HEADER" | "FOOTER",
    label: row.label,
    url: row.url,
    sortOrder: row.sortOrder,
    parentId: row.parentId,
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">تعديل عنصر القائمة</h1>
      <MenuItemForm mode="edit" itemId={row.id} defaultValues={defaultValues} />
    </div>
  );
}
