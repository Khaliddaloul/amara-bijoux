import type { Metadata } from "next";
import { Playfair_Display, Tajawal } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "أمارا للمجوهرات",
  description: "متجر مجوهرات فاخرة — واجهة عربية RTL ولوحة تحكم احترافية.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${display.variable}`}
    >
      <body className="min-h-screen bg-brand-cream font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
