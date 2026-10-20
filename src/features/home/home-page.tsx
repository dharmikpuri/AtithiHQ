import { JsonLd } from "@/components/seo/json-ld";
import { getCopy } from "@/content";
import { homeStructuredData } from "@/lib/seo/structured-data";
import { GlanceBand, SourcesBand } from "./components/bands";
import { FaqSection } from "./components/faq-section";
import { FeaturesGrid } from "./components/features-grid";
import { FinalCta } from "./components/final-cta";
import { GuestPreview } from "./components/guest-preview";
import { Hero } from "./components/hero";
import { HomeFooter } from "./components/home-footer";
import { HomeHeader, MAIN_CONTENT_ID } from "./components/home-header";
import { HowItWorks } from "./components/how-it-works";
import { PrivacySection } from "./components/privacy-section";

/**
 * The public home page. Server-rendered with no client JavaScript of its own,
 * so it loads fast on mobile data and every word is visible to search engines.
 */
export function HomePage() {
  return (
    <>
      <JsonLd data={homeStructuredData(getCopy())} />
      <HomeHeader />
      <main id={MAIN_CONTENT_ID} className="overflow-x-clip">
        <Hero />
        <SourcesBand />
        <HowItWorks />
        <GlanceBand />
        <FeaturesGrid />
        <GuestPreview />
        <PrivacySection />
        <FaqSection />
        <FinalCta />
      </main>
      <HomeFooter />
    </>
  );
}
