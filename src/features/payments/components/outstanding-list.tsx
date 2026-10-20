"use client";

import { ChevronRight, CircleAlert, Plus } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, surfaceStyles } from "@/components/ui/card";
import { List, ListRow } from "@/components/ui/list";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useCopy, type Copy } from "@/content";
import { dueAmount, leadNameOf, paidAmount, paidRatio } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import type { ISODate, Rupees } from "@/domain/types";
import { DateTile } from "@/features/bookings/components/date-tile";
import { cn } from "@/lib/cn";
import { daysBetween, formatStayRange } from "@/lib/dates";
import { formatINR } from "@/lib/money";

export type OutstandingKind = "overdue" | "current" | "upcoming";

export function totalDue(bookings: BookingRecord[]): Rupees {
  return bookings.reduce((sum, booking) => sum + (dueAmount(booking) ?? 0), 0);
}

/** When the stay is, in the terms that matter for collecting: "Left 3 days ago", "Leaves today". */
function timingOf(t: Copy, booking: BookingRecord, kind: OutstandingKind, today: ISODate) {
  if (kind === "overdue") {
    return {
      label: t.payments.row.left(daysBetween(booking.checkOut, today)),
      className: "font-medium text-danger-700",
    };
  }
  if (kind === "current") {
    const days = daysBetween(today, booking.checkOut);
    return { label: t.payments.row.leaves(days), className: days === 0 ? "font-medium text-warning-700" : undefined };
  }
  return { label: t.bookings.detail.phases.upcoming(daysBetween(today, booking.checkIn)), className: undefined };
}

/** What the row says about a booking's receipt. */
export interface ReceiptNote {
  number: string;
  shared: boolean;
}

/** A titled group of bookings with money due, with the group's total on the right. */
export function OutstandingGroup({
  kind,
  bookings,
  today,
  receiptNumbers,
  onRecord,
}: {
  kind: OutstandingKind;
  bookings: BookingRecord[];
  today: ISODate;
  /** The issued receipt per booking id (its number, and whether it was ever shared), shown as a small line on the row. */
  receiptNumbers?: ReadonlyMap<string, ReceiptNote>;
  onRecord: (booking: BookingRecord) => void;
}) {
  const copy = useCopy().payments.sections;
  const headingId = useId();
  if (bookings.length === 0) return null;
  const overdue = kind === "overdue";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2
          id={headingId}
          className={cn(
            "flex min-w-0 items-center gap-2 text-callout font-semibold",
            overdue ? "text-danger-700" : "text-ink-2",
          )}
        >
          {overdue && <CircleAlert className="size-4.5 shrink-0" aria-hidden />}
          <span className="truncate">{copy[kind]}</span>
          <span
            className={cn(
              "rounded-full px-2 text-caption leading-5 font-semibold tabular",
              overdue ? "bg-danger-50 text-danger-700" : "bg-ink/6 text-ink-3",
            )}
          >
            {bookings.length}
          </span>
        </h2>
        <p className="shrink-0 text-callout font-semibold text-ink-2 tabular">
          <span className="sr-only">{copy.totalLabel}: </span>
          {formatINR(totalDue(bookings))}
        </p>
      </div>
      <ul
        className={cn(
          "flex flex-col gap-3 md:gap-0 md:divide-y md:divide-line md:overflow-hidden md:rounded-2xl md:border md:bg-surface md:shadow-card",
          overdue ? "md:border-danger-100" : "md:border-line",
        )}
      >
        {bookings.map((booking) => (
          <OutstandingRow
            key={booking.id}
            booking={booking}
            kind={kind}
            today={today}
            receipt={receiptNumbers?.get(booking.id)}
            onRecord={() => onRecord(booking)}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * One booking that still owes money.
 * Phones: a card with the action along its bottom edge. From tablet: a row
 * with the action inline. The guest's name links to the booking and stretches
 * over the whole row, so tapping anywhere except the button opens it.
 */
function OutstandingRow({
  booking,
  kind,
  today,
  receipt,
  onRecord,
}: {
  booking: BookingRecord;
  kind: OutstandingKind;
  today: ISODate;
  receipt?: ReceiptNote;
  onRecord: () => void;
}) {
  const t = useCopy();
  const name = leadNameOf(booking);
  const due = dueAmount(booking) ?? 0;
  const timing = timingOf(t, booking, kind, today);
  const recordLabel = t.payments.row.recordFor(name);

  return (
    <li
      className={cn(
        surfaceStyles(),
        "relative flex list-none flex-col transition-colors duration-150",
        "hover:bg-subtle has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-500 has-[a:focus-visible]:ring-inset",
        "md:flex-row md:items-center md:gap-4 md:rounded-none md:border-0 md:pr-5 md:shadow-none",
        kind === "overdue" ? "border-danger-100" : "border-line",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5 p-3.5 md:items-center md:gap-5 md:py-4 md:pr-0 md:pl-5">
        <DateTile date={booking.checkIn} />

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:items-center xl:gap-6">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-baseline justify-between gap-3">
              <Link
                href={routes.booking(booking.id)}
                className="truncate text-body font-semibold text-ink outline-none after:absolute after:inset-0"
              >
                {name}
              </Link>
              <DueAmount amount={due} inline className="md:hidden" />
            </div>
            <p className="truncate text-subhead text-ink-3">
              {formatStayRange(booking.checkIn, booking.checkOut)} ·{" "}
              <span className={timing.className}>{timing.label}</span>
            </p>
            {receipt && (
              <p className="truncate text-footnote text-ink-3 tabular">
                {t.invoices.receiptLine(receipt.number, receipt.shared)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="truncate text-subhead text-ink-3 tabular">
              {t.payments.row.paidOf(formatINR(paidAmount(booking)), formatINR(booking.totalAmount ?? 0))}
            </p>
            <ProgressBar
              value={paidRatio(booking)}
              tone="accent"
              label={t.bookings.payments.progressLabel}
              className="h-1.5"
            />
          </div>
        </div>

        <DueAmount amount={due} className="hidden min-w-24 md:flex" />
      </div>

      {/* Phones: a full-width action along the bottom edge of the card. */}
      <button
        type="button"
        onClick={onRecord}
        aria-label={recordLabel}
        className="relative z-10 flex h-12 items-center justify-center gap-2 rounded-b-2xl border-t border-line text-callout font-semibold text-brand-600 transition-colors duration-150 hover:bg-brand-50 active:bg-brand-100 md:hidden"
      >
        <Plus className="size-4.5" aria-hidden />
        {t.bookings.payments.record}
      </button>
      <Button
        variant="soft"
        leadingIcon={<Plus />}
        onClick={onRecord}
        aria-label={recordLabel}
        className="relative z-10 hidden md:inline-flex"
      >
        {t.bookings.payments.record}
      </Button>
      <ChevronRight className="hidden size-5 shrink-0 text-ink-4 md:block" aria-hidden />
    </li>
  );
}

/** "₹5,000 due": one line in phone cards, stacked at the end of rows from tablet up. */
function DueAmount({ amount, inline = false, className }: { amount: Rupees; inline?: boolean; className?: string }) {
  const t = useCopy();
  return (
    <p className={cn("flex shrink-0 text-right", inline ? "items-baseline gap-1" : "flex-col items-end", className)}>
      <span className="text-headline text-accent-700 tabular">{formatINR(amount)}</span>
      <span className="text-footnote leading-4 text-ink-3">{t.payments.row.due}</span>
    </p>
  );
}

/** Live bookings with no agreed total yet: nothing to track until one is added. */
export function NoAmountGroup({ bookings }: { bookings: BookingRecord[] }) {
  const copy = useCopy().payments;
  const headingId = useId();
  if (bookings.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <div className="px-1">
        <h2 id={headingId} className="flex items-center gap-2 text-callout font-semibold text-ink-3">
          {copy.sections.noAmount}
          <span className="rounded-full bg-ink/6 px-2 text-caption leading-5 font-semibold text-ink-3 tabular">
            {bookings.length}
          </span>
        </h2>
        <p className="mt-0.5 text-subhead text-ink-3">{copy.noAmount.hint}</p>
      </div>
      <Card className="overflow-hidden">
        <List>
          {bookings.map((booking) => (
            <ListRow
              key={booking.id}
              href={routes.booking(booking.id)}
              title={leadNameOf(booking)}
              subtitle={formatStayRange(booking.checkIn, booking.checkOut)}
              value={<span className="font-medium text-brand-600">{copy.noAmount.action}</span>}
            />
          ))}
        </List>
      </Card>
    </section>
  );
}

export function OutstandingListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="ml-1 h-5 w-36" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={cn(surfaceStyles({ elevation: "none" }), "flex items-start gap-3.5 p-3.5")}>
          <Skeleton className="h-14 w-12 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
