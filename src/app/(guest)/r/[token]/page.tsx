import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { ReceiptLinkScreen } from "@/features/invoices/components/receipt-link-screen";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

const title = getCopy().invoices.publicPage.metaTitle;

export const metadata: Metadata = {
  // The page belongs to the property, so the title skips the "· AtithiHQ" suffix, and so does the social card.
  title: { absolute: title },
  openGraph: { title, type: "website" },
  twitter: { card: "summary", title },
  // Nor does it carry the app's own name for "Add to home screen".
  applicationName: null,
  appleWebApp: null,
  // Personal links must never be indexed.
  robots: PRIVATE_ROBOTS,
};

export default async function ReceiptPage({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  return (
    <Suspense>
      <ReceiptLinkScreen token={token} />
    </Suspense>
  );
}
