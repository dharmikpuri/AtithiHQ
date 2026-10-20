/**
 * Page metadata (titles, descriptions, social cards, indexing rules) built in one place,
 * so every public page is described the same way.
 */
import type { Metadata } from "next";
import { site } from "@/config/site";
import { getCopy } from "@/content";

/** Site-wide defaults, set once in the root layout. */
export function baseMetadata(): Metadata {
  const { meta } = getCopy().home;
  return {
    metadataBase: new URL(site.url),
    title: { default: meta.title, template: `%s · ${site.name}` },
    description: meta.description,
    applicationName: site.name,
    keywords: meta.keywords,
    authors: [{ name: site.company }],
    creator: site.company,
    publisher: site.company,
    category: "business",
    openGraph: openGraph({ title: meta.title, description: meta.description, path: "/" }),
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
    formatDetection: { telephone: false },
  };
}

function openGraph({ title, description, path }: { title: string; description: string; path: string }) {
  return { type: "website", siteName: site.name, locale: site.locale, url: path, title, description } as const;
}

/**
 * Metadata for a public, indexable page. Sets the canonical URL and keeps the social card in step.
 * `absoluteTitle` skips the "· AtithiHQ" suffix (for the home page, whose title already leads with the name).
 */
export function publicPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: openGraph({ title, description, path }),
    twitter: { card: "summary_large_image", title, description },
  };
}

/** For signed-in areas and personal guest links: never indexed, links not followed. */
export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false };
