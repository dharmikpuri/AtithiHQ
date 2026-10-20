import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { BookingDetailScreen } from "@/features/bookings/detail/booking-detail-screen";

export const metadata: Metadata = { title: getCopy().bookings.detail.metaTitle };

export default async function BookingPage({ params }: PageProps<"/bookings/[bookingId]">) {
  const { bookingId } = await params;
  return (
    <Suspense>
      <BookingDetailScreen bookingId={bookingId} />
    </Suspense>
  );
}
