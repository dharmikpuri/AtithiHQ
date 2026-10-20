"use client";

import { format } from "date-fns";
import type { ReactNode } from "react";
import { surfaceStyles } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingRecord } from "@/domain/read-models";
import { cn } from "@/lib/cn";
import { fromISODate } from "@/lib/dates";
import { useCopy } from "@/content";
import { BOOKING_COLUMNS, BookingCard } from "./booking-card";

/** Cards on phones; one grouped table with column labels on desktop. */
export function BookingList({ bookings }: { bookings: BookingRecord[] }) {
  return (
    <ul className="flex flex-col gap-3 md:gap-0 md:divide-y md:divide-line md:overflow-hidden md:rounded-2xl md:border md:border-line md:bg-surface md:shadow-card">
      <ColumnLabels />
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </ul>
  );
}

/** Visual column labels from `md`. Rows carry their own meaning (badges, amounts), so screen readers skip this. */
function ColumnLabels() {
  const c = useCopy().bookings.list.columns;
  return (
    <li
      aria-hidden
      className="hidden list-none items-center gap-5 bg-subtle px-5 py-2.5 text-footnote font-medium text-ink-3 md:flex"
    >
      <span className="w-12 shrink-0" />
      <span className={cn("flex-1", BOOKING_COLUMNS)}>
        <span>{c.guest}</span>
        <span>{c.details}</span>
        <span>{c.source}</span>
        <span className="text-right">{c.payment}</span>
      </span>
      <span className="w-5 shrink-0" />
    </li>
  );
}

/** A titled group of bookings ("Arriving today", "November 2026"…). */
export function BookingGroup({
  title,
  bookings,
  action,
}: {
  title: ReactNode;
  bookings: BookingRecord[];
  action?: ReactNode;
}) {
  if (bookings.length === 0) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="flex items-center gap-2 text-callout font-semibold text-ink-2">
          {title}
          <span className="rounded-full bg-ink/6 px-2 text-caption leading-5 font-semibold text-ink-3 tabular">
            {bookings.length}
          </span>
        </h2>
        {action}
      </div>
      <BookingList bookings={bookings} />
    </section>
  );
}

/** Groups bookings under month headings, keeping the incoming order. */
export function MonthGroups({ bookings }: { bookings: BookingRecord[] }) {
  const groups: { key: string; label: string; items: BookingRecord[] }[] = [];
  for (const booking of bookings) {
    const date = fromISODate(booking.checkIn);
    const key = format(date, "yyyy-MM");
    let group = groups.find((item) => item.key === key);
    if (!group) {
      group = { key, label: format(date, "MMMM yyyy"), items: [] };
      groups.push(group);
    }
    group.items.push(booking);
  }
  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <BookingGroup key={group.key} title={group.label} bookings={group.items} />
      ))}
    </div>
  );
}

export function BookingListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="ml-1 h-5 w-32" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={cn(surfaceStyles({ elevation: "none" }), "flex items-center gap-3.5 p-3.5")}>
          <Skeleton className="h-14 w-12 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
