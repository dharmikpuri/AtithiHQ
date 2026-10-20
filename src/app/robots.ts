import type { MetadataRoute } from "next";
import { OWNER_AREAS, routes } from "@/config/routes";
import { absoluteUrl } from "@/config/site";

/**
 * Public pages are open to every crawler, including AI assistants that answer questions
 * about homestay tools. Owner areas, personal guest links and shared receipts are off limits.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [routes.home, "/llms.txt"],
      disallow: [...OWNER_AREAS, "/g/", "/r/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
