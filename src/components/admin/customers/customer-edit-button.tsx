"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import {
  CustomerFormDialog,
  type CustomerFormInitial,
} from "@/components/admin/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";

export function CustomerEditButton({ initial }: { initial: CustomerFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="ms-1 h-4 w-4" />
        تعديل
      </Button>
      <CustomerFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="edit"
        initial={initial}
      />
    </>
  );
}
