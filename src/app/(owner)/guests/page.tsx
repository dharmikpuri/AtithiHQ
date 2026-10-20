import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { GuestsScreen } from "@/features/guests/components/guests-screen";

export const metadata: Metadata = { title: getCopy().guests.list.metaTitle };

export default function GuestsPage() {
  return (
    <Suspense>
      <GuestsScreen />
    </Suspense>
  );
}
