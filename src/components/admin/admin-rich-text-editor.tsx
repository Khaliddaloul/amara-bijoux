"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(
  () =>
    import("@/components/admin/product-rich-text-editor").then((m) => m.ProductRichTextEditor),
  {
    ssr: false,
    loading: () => <div className="min-h-[220px] animate-pulse rounded-md border bg-muted" />,
  },
);

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  className?: string;
};

/** Dynamic wrapper — keeps Tiptap out of the main bundle until needed. */
export function AdminRichTextEditor(props: Props) {
  return <Inner {...props} />;
}
