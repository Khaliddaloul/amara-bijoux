import { getSiteUrl } from "@/lib/site-url";

const SITE_NAME = "أمارا للمجوهرات";
const BRAND_NAME = "أمارا";

export function organizationJsonLd(params: {
  logoUrl?: string;
  sameAs?: string[];
  phone?: string;
  email?: string;
}) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: base,
    logo: params.logoUrl ? `${base}${params.logoUrl}` : `${base}/og-default.jpg`,
    sameAs: params.sameAs?.length ? params.sameAs : undefined,
    contactPoint: params.phone
      ? {
          "@type": "ContactPoint",
          telephone: params.phone,
          contactType: "customer service",
          areaServed: "MA",
          availableLanguage: ["Arabic", "French"],
        }
      : undefined,
    email: params.email,
  };
}

export function webSiteJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base,
    inLanguage: "ar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${getSiteUrl()}${it.href}`,
    })),
  };
}

export function productJsonLd(
  p: {
    name: string;
    slug: string;
    shortDescription: string | null;
    description?: string | null;
    sku: string | null;
    quantity: number;
    price: number;
    vendor: string | null;
    /** ISO 4217 from store settings (e.g. QAR); defaults to MAD. */
    priceCurrency?: string;
  },
  images: string[],
  rating?: { average: number; count: number },
) {
  const base = getSiteUrl();
  const availability =
    p.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const img = images.length ? images.map((u) => (u.startsWith("http") ? u : `${base}${u}`)) : undefined;
  const plainDesc =
    (p.shortDescription?.replace(/<[^>]+>/g, "").trim() ||
      p.description?.replace(/<[^>]+>/g, "").trim().slice(0, 320) ||
      p.name) ?? p.name;
  const priceCurrency =
    p.priceCurrency?.trim().length === 3 ? p.priceCurrency.trim().toUpperCase() : "MAD";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: plainDesc,
    sku: p.sku ?? undefined,
    image: img,
    brand: { "@type": "Brand", name: BRAND_NAME },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${base}/product/${p.slug}`,
      priceCurrency,
      price: p.price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function collectionPageJsonLd(name: string, description: string | null, urlPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: description ?? undefined,
    url: `${getSiteUrl()}${urlPath}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: getSiteUrl() },
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string | null;
  publishedAt: Date | null;
  updatedAt?: Date;
  author: string | null;
  featuredImage: string | null;
}) {
  const base = getSiteUrl();
  const url = `${base}/blog/${post.slug}`;
  const wordCount =
    post.content?.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length ?? undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    abstract: post.excerpt ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME, url: base },
    image: post.featuredImage
      ? post.featuredImage.startsWith("http")
        ? post.featuredImage
        : `${base}${post.featuredImage}`
      : `${base}/og-default.jpg`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "ar",
    ...(wordCount ? { wordCount } : {}),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function localBusinessJsonLd(params?: {
  phone?: string;
  email?: string;
  streetAddress?: string;
}) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SITE_NAME,
    url: base,
    image: `${base}/og-default.jpg`,
    telephone: params?.phone ?? "+212600000000",
    email: params?.email ?? "contact@amara.ma",
    address: {
      "@type": "PostalAddress",
      streetAddress: params?.streetAddress ?? "الدار البيضاء",
      addressLocality: "الدار البيضاء",
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.5731,
      longitude: -7.5898,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    priceRange: "$$",
    paymentAccepted: "Cash, BankTransfer",
    currenciesAccepted: "MAD",
    areaServed: { "@type": "Country", name: "Morocco" },
  };
}

/** أسماء مطابقة لمواصفات المشروع */
export const getOrganizationSchema = organizationJsonLd;
export const getWebsiteSchema = webSiteJsonLd;
export const getProductSchema = productJsonLd;
export const getBreadcrumbSchema = breadcrumbJsonLd;
export const getCollectionPageSchema = collectionPageJsonLd;
export const getArticleSchema = blogPostingJsonLd;
export const getFAQPageSchema = faqPageJsonLd;
export const getLocalBusinessSchema = localBusinessJsonLd;
