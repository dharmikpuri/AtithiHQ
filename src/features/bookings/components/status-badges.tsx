"use client";

import { Badge } from "@/components/ui/badge";
import { useCopy } from "@/content";
import type { BookingRecord } from "@/domain/read-models";
import { cn } from "@/lib/cn";
import { detailsPresentation, paymentPresentation } from "../status";

export function DetailsBadge({ booking, className }: { booking: BookingRecord; className?: string }) {
  const t = useCopy();
  const { label, tone, icon: Icon } = detailsPresentation(t, booking);
  return (
    <Badge tone={tone} className={className}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}

/** Money status as text — reads naturally at the end of a row. */
export function PaymentLabel({ booking, className }: { booking: BookingRecord; className?: string }) {
  const t = useCopy();
  const { label, textClass } = paymentPresentation(t, booking);
  return (
    <span className={cn("text-callout font-semibold whitespace-nowrap tabular", textClass, className)}>{label}</span>
  );
}
