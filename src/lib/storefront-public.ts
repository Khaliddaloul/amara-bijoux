import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";

export type StorefrontTheme = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  font: string;
  logoUrl: string;
  faviconUrl: string;
};

export type StorefrontSection = {
  id: string;
  type: string;
  visible: boolean;
  order: number;
};

export type StorefrontPayload = {
  theme?: StorefrontTheme;
  sections?: StorefrontSection[];
};

const defaultTheme: StorefrontTheme = {
  primary: "#000000",
  accent: "#00bf0e",
  background: "#ffffff",
  foreground: "#000000",
  font: "Cairo",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
};

export async function getStorefrontPayload(): Promise<StorefrontPayload> {
  const row = await prisma.setting.findUnique({ where: { key: "storefront" } });
  return parseJson<StorefrontPayload>(row?.value, {});
}

export function mergeTheme(theme?: Partial<StorefrontTheme>): StorefrontTheme {
  return { ...defaultTheme, ...theme };
}

export type MarketingPixelsPayload = {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  gtmId?: string;
  gaId?: string;
  snapPixelId?: string;
};

export async function getMarketingPixelsPayload(): Promise<MarketingPixelsPayload> {
  const row = await prisma.setting.findUnique({ where: { key: "marketing.pixels" } });
  return parseJson<MarketingPixelsPayload>(row?.value, {});
}
