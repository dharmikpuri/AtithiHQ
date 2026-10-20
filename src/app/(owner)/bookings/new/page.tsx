import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { NewBookingScreen } from "@/features/bookings/booking-form/booking-form-screens";

export const metadata: Metadata = { title: getCopy().bookings.form.metaNew };

export default function NewBookingPage() {
  return (
    <Suspense>
      <NewBookingScreen />
    </Suspense>
  );
}
