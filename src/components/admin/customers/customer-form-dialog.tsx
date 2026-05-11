"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CustomerFormInitial = {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  tags: string[];
  notes: string | null;
};

/** نموذج مبسّط — يُوسَّع لاحقاً بحقول كاملة وربط server actions. */
export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: CustomerFormInitial;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "عميل جديد" : "تعديل العميل"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" && initial
              ? `${initial.firstName ?? ""} ${initial.lastName ?? ""} — ${initial.email ?? initial.phone ?? ""}`
              : "نموذج إضافة/تعديل العملاء سيتم ربطه لاحقاً بـ server actions."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
