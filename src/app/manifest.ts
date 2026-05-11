import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { STORE_DEFAULT_DESCRIPTION, STORE_NAME_FULL } from "@/lib/constants/store-seo";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();
  return {
    name: STORE_NAME_FULL,
    short_name: "أمارا",
    description: STORE_DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c9a24d",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: `${base}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
