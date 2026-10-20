/**
 * Facts about the product and the company: names, the public URL, locale.
 * Used by page metadata, structured data, the web app manifest and share links.
 * Screen copy lives in `src/content`; this file holds facts that don't get translated.
 */

/** Production domain. Override with NEXT_PUBLIC_SITE_URL (e.g. for a staging deploy). */
const DEFAULT_SITE_URL = "https://atithihq.com";

export const site = {
  name: "AtithiHQ",
  company: "Futurise Solutions",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, ""),
  /** BCP 47 language tag for `<html lang>`. */
  language: "en-IN",
  /** Open Graph locale. */
  locale: "en_IN",
  country: "IN",
  /** First year of the product, for the copyright line. */
  since: 2026,
} as const;

/**
 * Origin used in links that leave the app (the guest link sent on WhatsApp).
 * In production this is the configured site URL; in development it is wherever
 * the app is running, so links work on localhost.
 */
export function publicOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return site.url;
  return typeof window === "undefined" ? site.url : window.location.origin;
}

/** Absolute URL for a path on the site, e.g. for structured data. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${site.url}/`).toString();
}
