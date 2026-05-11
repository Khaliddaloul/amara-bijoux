import { Fragment } from "react";
import { Link } from "@/i18n/routing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbEntry = { label: string; href?: string };

export function StoreBreadcrumb({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb className="text-xs text-[#696969]">
      <BreadcrumbList className="flex-wrap">
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 ? <BreadcrumbSeparator className="text-[#696969]" /> : null}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-black">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
