"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ProductOption = { id: string; name: string };

type Props = {
  options: ProductOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export function ProductsMultiSelect({
  options,
  value,
  onChange,
  placeholder = "اختاري المنتجات",
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    const set = new Set(value);
    return options.filter((o) => set.has(o.id));
  }, [options, value]);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate text-start">
              {selected.length === 0
                ? placeholder
                : `${selected.length} منتج محدد`}
            </span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="ابحثي بالاسم..." />
            <CommandList>
              <CommandEmpty>لا توجد نتائج</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = value.includes(opt.id);
                  return (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => toggle(opt.id)}
                    >
                      <Check
                        className={cn(
                          "ms-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{opt.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selected.map((s) => (
            <Badge key={s.id} variant="secondary" className="gap-1">
              {s.name}
              <button
                type="button"
                aria-label="إزالة"
                className="rounded hover:bg-muted"
                onClick={() => toggle(s.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
