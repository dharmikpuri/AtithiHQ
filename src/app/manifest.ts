import type { MetadataRoute } from "next";
import { OWNER_HOME } from "@/config/routes";
import { site } from "@/config/site";
import { themeColors } from "@/config/theme";
import { getCopy } from "@/content";

/** Lets owners add AtithiHQ to their home screen and open it like an app. Icons come from `npm run brand`. */
export default function manifest(): MetadataRoute.Manifest {
  const t = getCopy().common;
  return {
    name: `${site.name}: ${t.tagline}`,
    short_name: site.name,
    description: getCopy().home.meta.description,
    id: OWNER_HOME,
    start_url: OWNER_HOME,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: site.language,
    categories: ["business", "productivity", "travel"],
    background_color: themeColors.canvas,
    theme_color: themeColors.canvas,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
