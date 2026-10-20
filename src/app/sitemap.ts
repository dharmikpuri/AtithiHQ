import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { absoluteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl(routes.home), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl(routes.login), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
