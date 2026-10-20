"use client";

import { CircleAlert, IndianRupee } from "lucide-react";
import { Card, surfaceStyles } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCopy } from "@/content";
import type { Rupees } from "@/domain/types";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/money";

/** The one number that matters here, plus what's overdue when guests have already left. */
export function PaymentsSummary({
  total,
  count,
  overdue,
  overdueCount,
}: {
  total: Rupees;
  count: number;
  overdue: Rupees;
  overdueCount: number;
}) {
  const t = useCopy();
  const copy = t.payments.summary;

  return (
    <Card aria-label={copy.label} className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
          <p className="flex items-center gap-2.5 text-callout font-medium text-ink-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <IndianRupee className="size-4.5" aria-hidden />
            </span>
            {copy.label}
          </p>
          <p className="mt-4 text-display leading-none text-accent-700 tabular sm:text-display-lg">
            {formatINR(total)}
          </p>
          <p className="mt-2.5 text-callout text-ink-3">{copy.from(t.common.count.bookings(count))}</p>
        </div>

        {overdue > 0 && (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 border-t border-danger-100 bg-danger-50/70 px-5 py-4 sm:px-6 md:w-72 md:grid-cols-1 md:content-center md:gap-y-1 md:border-t-0 md:border-l lg:w-80">
            <p className="col-start-1 row-start-1 flex items-center gap-1.5 text-callout font-semibold text-danger-700">
              <CircleAlert className="size-4 shrink-0" aria-hidden />
              {copy.overdue}
            </p>
            <p className="col-start-2 row-span-2 row-start-1 text-title-3 text-danger-700 tabular md:col-start-1 md:row-span-1 md:row-start-2 md:text-title-1 md:leading-9">
              {formatINR(overdue)}
            </p>
            <p className="col-start-1 row-start-2 text-subhead text-ink-2 md:row-start-3">
              {copy.overdueBody(overdueCount)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export function PaymentsSummarySkeleton() {
  return (
    <div className={cn(surfaceStyles({ elevation: "none" }), "flex flex-col gap-4 p-5 sm:p-6")} aria-hidden>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
