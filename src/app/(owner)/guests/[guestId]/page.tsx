import type { Metadata } from "next";
import { getCopy } from "@/content";
import { GuestProfileScreen } from "@/features/guests/components/guest-profile-screen";

export const metadata: Metadata = { title: getCopy().guests.profile.metaTitle };

export default async function GuestPage({ params }: PageProps<"/guests/[guestId]">) {
  const { guestId } = await params;
  return <GuestProfileScreen guestId={guestId} />;
}
