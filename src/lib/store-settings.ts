import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";

export type StoreGeneralPublic = {
  storeName: string;
  logo: string;
  favicon: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  language: string;
};

export type StoreSocialPublic = {
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  twitter: string;
};

const generalFallback = (): StoreGeneralPublic => ({
  storeName: "أمارا للمجوهرات",
  logo: "",
  favicon: "",
  storeEmail: "",
  storePhone: "",
  address: "",
  city: "",
  country: "المغرب",
  currency: "MAD",
  timezone: "Africa/Casablanca",
  language: "ar",
});

const socialFallback = (): StoreSocialPublic => ({
  whatsapp: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  twitter: "",
});

async function loadStorePublicSettings(): Promise<{
  general: StoreGeneralPublic;
  social: StoreSocialPublic;
}> {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: ["settings.general", "settings.social", "general", "contact", "socialLinks"],
      },
    },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const legacyGeneral = parseJson<Partial<StoreGeneralPublic> & { primaryColor?: string }>(
    map.general ?? "{}",
    {},
  );
  const newGeneral = parseJson<Partial<StoreGeneralPublic>>(map["settings.general"] ?? "{}", {});

  const general: StoreGeneralPublic = {
    ...generalFallback(),
    storeName: newGeneral.storeName ?? legacyGeneral.storeName ?? generalFallback().storeName,
    logo: newGeneral.logo ?? legacyGeneral.logo ?? "",
    favicon: newGeneral.favicon ?? legacyGeneral.favicon ?? "",
    storeEmail: newGeneral.storeEmail ?? "",
    storePhone: newGeneral.storePhone ?? parseJson<{ phone?: string }>(map.contact ?? "{}", {}).phone ?? "",
    address:
      newGeneral.address ??
      parseJson<{ address?: string }>(map.contact ?? "{}", {}).address ??
      "",
    city: newGeneral.city ?? "",
    country: newGeneral.country ?? "المغرب",
    currency: newGeneral.currency ?? legacyGeneral.currency ?? "MAD",
    timezone: newGeneral.timezone ?? "Africa/Casablanca",
    language: newGeneral.language ?? "ar",
  };

  const legacySocial = parseJson<Partial<StoreSocialPublic>>(map.socialLinks ?? "{}", {});
  const newSocial = parseJson<Partial<StoreSocialPublic>>(map["settings.social"] ?? "{}", {});

  const social: StoreSocialPublic = {
    ...socialFallback(),
    whatsapp:
      newSocial.whatsapp ??
      parseJson<{ whatsapp?: string }>(map.contact ?? "{}", {}).whatsapp ??
      "",
    instagram: newSocial.instagram ?? legacySocial.instagram ?? "",
    facebook: newSocial.facebook ?? legacySocial.facebook ?? "",
    tiktok: newSocial.tiktok ?? legacySocial.tiktok ?? "",
    youtube: newSocial.youtube ?? "",
    twitter: newSocial.twitter ?? "",
  };

  return { general, social };
}

/** Cached until `revalidateTag("store-settings")` (see admin settings save). */
export const getStorePublicSettings = unstable_cache(loadStorePublicSettings, ["store-public-settings"], {
  tags: ["store-settings"],
});
