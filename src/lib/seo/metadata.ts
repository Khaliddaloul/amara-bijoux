import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { STORE_NAME_FULL } from "@/lib/constants/store-seo";

const DEFAULT_OG_W = 1200;
const DEFAULT_OG_H = 630;

export type BuildMetadataInput = {
  /** عنوان الصفحة — إما يُطبَّق عليه template الجذر أو يُستخدم كاملاً */
  title: string;
  /** إذا false، يُعرَض العنوان كما هو دون إضافة القالب (مناسب للصفحة الرئيسية وعناوين كاملة) */
  applyTitleTemplate?: boolean;
  description: string;
  /** مسار نسبي يبدأ بـ / */
  canonicalPath: string;
  keywords?: string[];
  ogType?: "website" | "article";
  ogImages?: NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;
};

function toTwitterImageUrls(
  ogImages: NonNullable<NonNullable<Metadata["openGraph"]>["images"]>,
  fallbackUrl: string,
): string[] {
  const list = Array.isArray(ogImages) ? ogImages : [ogImages];
  const base = getSiteUrl();
  return list.map((entry) => {
    if (typeof entry === "string") {
      return entry.startsWith("http") ? entry : `${base}${entry.startsWith("/") ? entry : `/${entry}`}`;
    }
    if (entry && typeof entry === "object" && "url" in entry && entry.url) {
      const u = entry.url;
      const s = typeof u === "string" ? u : u.toString();
      return s.startsWith("http") ? s : `${base}${s.startsWith("/") ? s : `/${s}`}`;
    }
    return fallbackUrl;
  });
}

/**
 * يبني كائناً Metadata موحّداً للصفحات العامة (عربي، ar_MA، فهرسة كاملة).
 */
export function buildPageMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    canonicalPath,
    keywords,
    ogType = "website",
    ogImages,
    applyTitleTemplate = true,
  } = input;

  const base = getSiteUrl();
  const canonical = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  const defaultOg = `${base}/og-default.jpg`;
  const resolvedOg: NonNullable<Metadata["openGraph"]>["images"] =
    ogImages ??
    ([
      {
        url: defaultOg,
        width: DEFAULT_OG_W,
        height: DEFAULT_OG_H,
        alt: STORE_NAME_FULL,
      },
    ] as const);

  const titleField: Metadata["title"] =
    applyTitleTemplate === false ? { absolute: title } : title;

  return {
    title: titleField,
    description,
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${base}${canonical}`,
      siteName: STORE_NAME_FULL,
      locale: "ar_MA",
      type: ogType,
      images: resolvedOg,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: toTwitterImageUrls(resolvedOg, defaultOg),
    },
  };
}

/** رابط صورة Open Graph الديناميكية من واجهة API */
export function getDynamicOgImageUrl(
  type: "product" | "article" | "category",
  id: string,
): string {
  const base = getSiteUrl();
  return `${base}/api/og/${type}/${id}`;
}
