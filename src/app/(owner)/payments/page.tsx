import type { Metadata } from "next";
import { Suspense } from "react";
import { getCopy } from "@/content";
import { PaymentsScreen } from "@/features/payments/components/payments-screen";

export const metadata: Metadata = { title: getCopy().payments.metaTitle };

export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsScreen />
    </Suspense>
  );
}
