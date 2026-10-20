import type { Metadata } from "next";
import { getCopy } from "@/content";
import { EditBookingScreen } from "@/features/bookings/booking-form/booking-form-screens";

export const metadata: Metadata = { title: getCopy().bookings.form.metaEdit };

export default async function EditBookingPage({ params }: PageProps<"/bookings/[bookingId]/edit">) {
  const { bookingId } = await params;
  return <EditBookingScreen bookingId={bookingId} />;
}
