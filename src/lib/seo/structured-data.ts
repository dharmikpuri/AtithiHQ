/**
 * Structured data (schema.org JSON-LD) that tells search engines and AI assistants
 * what AtithiHQ is, who makes it, how it works and the answers to common questions.
 * Everything is built from the home page copy, so the page and its data never disagree.
 */
import { absoluteUrl, site } from "@/config/site";
import type { Copy } from "@/content";

/** Section anchors on the home page, shared by the page and its structured data. */
export const HOME_SECTIONS = {
  howItWorks: "how-it-works",
  guests: "for-guests",
  features: "features",
  privacy: "privacy",
  faq: "faq",
} as const;

const id = (name: string) => `${site.url}/#${name}`;

export function homeStructuredData(t: Copy) {
  const { home } = t;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": id("organization"),
        name: site.company,
        url: site.url,
        logo: { "@type": "ImageObject", url: absoluteUrl("/icons/icon-512.png"), width: 512, height: 512 },
        brand: { "@type": "Brand", name: site.name },
      },
      {
        "@type": "WebSite",
        "@id": id("website"),
        url: site.url,
        name: site.name,
        description: t.common.tagline,
        inLanguage: site.language,
        publisher: { "@id": id("organization") },
      },
      {
        "@type": "WebApplication",
        "@id": id("app"),
        name: site.name,
        url: site.url,
        description: home.hero.lede,
        slogan: t.common.tagline,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Guest management for homestays",
        operatingSystem: "Any (runs in a web browser)",
        browserRequirements: "A modern web browser on a phone, tablet or computer",
        inLanguage: site.language,
        areaServed: { "@type": "Country", name: "India" },
        audience: { "@type": "BusinessAudience", audienceType: "Homestay owners and small guest houses" },
        featureList: home.features.items.map((item) => `${item.title}: ${item.body}`),
        publisher: { "@id": id("organization") },
      },
      {
        "@type": "WebPage",
        "@id": id("webpage"),
        url: site.url,
        name: home.meta.title,
        description: home.meta.description,
        inLanguage: site.language,
        isPartOf: { "@id": id("website") },
        about: { "@id": id("app") },
      },
      {
        "@type": "HowTo",
        "@id": id(HOME_SECTIONS.howItWorks),
        name: `How ${site.name} works`,
        description: home.how.title,
        step: home.how.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
          url: `${site.url}/#${HOME_SECTIONS.howItWorks}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": id(HOME_SECTIONS.faq),
        isPartOf: { "@id": id("webpage") },
        mainEntity: home.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}
