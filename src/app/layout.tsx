import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { STORE_DEFAULT_DESCRIPTION, STORE_KEYWORDS, STORE_NAME_FULL } from "@/lib/constants/store-seo";
import { getLocalBusinessSchema, getOrganizationSchema } from "@/lib/seo/structured-data";
import { getSiteUrl } from "@/lib/site-url";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "أمارا للمجوهرات | مجوهرات مغربية فاخرة",
    template: "%s | أمارا للمجوهرات",
  },
  description: STORE_DEFAULT_DESCRIPTION,
  keywords: [...STORE_KEYWORDS],
  authors: [{ name: STORE_NAME_FULL }],
  creator: STORE_NAME_FULL,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ar_MA",
    siteName: STORE_NAME_FULL,
    title: STORE_NAME_FULL,
    description: STORE_DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: STORE_NAME_FULL,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: STORE_NAME_FULL,
    description: STORE_DEFAULT_DESCRIPTION,
    images: [`${getSiteUrl()}/og-default.jpg`],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#c9a24d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaOrg = getOrganizationSchema({
    logoUrl: "/og-default.jpg",
    phone: "+212600000000",
    email: "contact@amara.ma",
  });
  const schemaLocal = getLocalBusinessSchema({
    phone: "+212600000000",
    email: "contact@amara.ma",
  });

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased">
        <JsonLd data={[schemaOrg, schemaLocal]} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
