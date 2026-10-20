import type { Metadata } from "next";
import { getCopy } from "@/content";
import { LegalPage } from "@/features/legal/legal-page";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

// A draft placeholder: kept out of search results until the final text is published.
export const metadata: Metadata = { title: getCopy().legal.privacy.metaTitle, robots: PRIVATE_ROBOTS };

export default function PrivacyPolicyPage() {
  return <LegalPage doc="privacy" />;
}
