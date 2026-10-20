import type { Metadata } from "next";
import { getCopy } from "@/content";
import { SetupScreen } from "@/features/onboarding/setup-screen";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: getCopy().auth.setup.metaTitle, robots: PRIVATE_ROBOTS };

export default function SetupPage() {
  return <SetupScreen />;
}
