import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { AppProviders } from "@/components/providers";
import { getSiteUrl } from "@/lib/site-url";
import { isLocale, type Locale, getDirection } from "@/i18n/config";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-ar",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-en",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const t = await getTranslations({ locale, namespace: "common" });
  void t;
  const siteUrl = getSiteUrl();

  if (locale === "en") {
    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: "Amara Jewelry",
        template: "%s | Amara Jewelry",
      },
      description:
        "A refined Moroccan jewelry store — rings, necklaces, bracelets, earrings and sets. Cash on delivery and shipping across Morocco.",
      keywords: ["jewelry", "rings", "necklaces", "Morocco", "Amara", "gold", "silver"],
      authors: [{ name: "Amara Jewelry" }],
      creator: "Amara Jewelry",
      openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Amara Jewelry",
        title: "Amara Jewelry",
        description: "Refined jewelry with a fully bilingual shopping experience.",
      },
      twitter: {
        card: "summary_large_image",
        title: "Amara Jewelry",
        description: "Refined jewelry with a fully bilingual shopping experience.",
      },
      robots: { index: true, follow: true },
      alternates: {
        canonical: `/en`,
        languages: {
          "ar-MA": `/ar`,
          "en-US": `/en`,
        },
      },
    };
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "أمارا للمجوهرات",
      template: "%s | أمارا للمجوهرات",
    },
    description:
      "متجر مجوهرات مغربي فاخر — خواتم، قلائد، أساور، أقراط وأطقم. الدفع عند الاستلام والشحن داخل المغرب.",
    keywords: ["مجوهرات", "خواتم", "قلائد", "المغرب", "أمارا", "ذهب", "فضة"],
    authors: [{ name: "أمارا للمجوهرات" }],
    creator: "أمارا للمجوهرات",
    openGraph: {
      type: "website",
      locale: "ar_MA",
      siteName: "أمارا للمجوهرات",
      title: "أمارا للمجوهرات",
      description: "مجوهرات راقية مع تجربة شراء عربية بالكامل.",
    },
    twitter: {
      card: "summary_large_image",
      title: "أمارا للمجوهرات",
      description: "مجوهرات راقية مع تجربة شراء عربية بالكامل.",
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/ar`,
      languages: {
        "ar-MA": `/ar`,
        "en-US": `/en`,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#c9a24d",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale: Locale = params.locale;
  setRequestLocale(locale);
  const dir = getDirection(locale);
  const messages = await getMessages();

  const fontVar = locale === "ar" ? cairo.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={`${cairo.variable} ${inter.variable}`}>
      <body
        className="min-h-screen bg-white antialiased"
        style={{
          fontFamily:
            locale === "ar"
              ? "var(--font-sans-ar), Cairo, system-ui, sans-serif"
              : "var(--font-sans-en), Inter, system-ui, sans-serif",
        }}
        data-locale={locale}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
