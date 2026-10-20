import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { BookingsScreen } from "@/features/bookings/components/bookings-screen";

export const metadata: Metadata = { title: getCopy().bookings.list.metaTitle };

export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsScreen />
    </Suspense>
  );
}
