import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Amarat-style clone — مجوهرات",
  description:
    "نسخة تجريبية RTL لمطابقة هيكل المتجر المرجعي مع لوحة تحكم كاملة.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
