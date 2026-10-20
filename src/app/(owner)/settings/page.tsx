import type { Metadata } from "next";
import { getCopy } from "@/content";
import { SettingsScreen } from "@/features/settings/components/settings-screen";

export const metadata: Metadata = { title: getCopy().settings.metaTitle };

export default function SettingsPage() {
  return <SettingsScreen />;
}
