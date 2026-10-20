import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { GuestFormScreen } from "@/features/guest-form/components/guest-form-screen";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: getCopy().guestForm.metaTitle,
  // Personal links must never be indexed.
  robots: PRIVATE_ROBOTS,
};

export default async function GuestFormPage({ params }: PageProps<"/g/[token]">) {
  const { token } = await params;
  return (
    <Suspense>
      <GuestFormScreen token={token} />
    </Suspense>
  );
}
