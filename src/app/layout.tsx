import type { ReactNode } from "react";

/**
 * Root layout: real `<html>` / `<body>` live in `[locale]/layout.tsx`.
 * Next.js requires a root layout; next-intl uses this passthrough pattern.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
