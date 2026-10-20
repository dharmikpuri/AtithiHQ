"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { surfaceStyles } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { isCancelled, leadNameOf, nightsOf } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import { useCurrentSession } from "@/features/auth/queries";
import { roomsLabel } from "../status";
import { cn } from "@/lib/cn";
import { formatStayRange } from "@/lib/dates";
import { DateTile } from "./date-tile";
import { DetailsBadge, PaymentLabel } from "./status-badges";

/**
 * Columns from `md`, shared with the list's header row: guest, guest details, source, payment.
 * Proportional, so wide screens spread the row out evenly instead of leaving a gap.
 */
export const BOOKING_COLUMNS =
  "md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(7rem,0.7fr)] md:items-center md:gap-5";

/**
 * One booking in a list.
 * Phones: a card. Desktop: a row inside a grouped table-like card.
 */
export function BookingCard({ booking }: { booking: BookingRecord }) {
  const t = useCopy();
  const rooms = roomsLabel(t, booking, useCurrentSession().property.bookingMode);
  const cancelled = isCancelled(booking);
  const name = leadNameOf(booking);

  return (
    <li className="list-none">
      <Link
        href={routes.booking(booking.id)}
        className={cn(
          surfaceStyles(),
          "group flex items-center gap-3.5 p-3.5 transition-[background-color,box-shadow] duration-150 outline-none",
          "hover:bg-subtle focus-visible:ring-2 focus-visible:ring-brand-500 active:bg-canvas",
          "md:gap-5 md:rounded-none md:border-0 md:px-5 md:py-4 md:shadow-none",
        )}
      >
        <DateTile date={booking.checkIn} muted={cancelled} className="self-start md:self-center" />

        <div className={cn("flex min-w-0 flex-1 flex-col gap-1", BOOKING_COLUMNS)}>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-start justify-between gap-3">
              <p
                className={cn(
                  "truncate text-body font-semibold",
                  cancelled ? "text-ink-3 line-through decoration-ink-4" : "text-ink",
                )}
              >
                {name}
              </p>
              <PaymentLabel booking={booking} className={cn("md:hidden", cancelled && "hidden")} />
            </div>
            <p className="truncate text-subhead text-ink-3">
              {formatStayRange(booking.checkIn, booking.checkOut)}
              <span className="md:max-xl:hidden"> · </span>
              <span className="md:max-xl:block md:max-xl:truncate">
                {t.bookings.card.nightsGuests(nightsOf(booking), booking.guestCount)}
                {rooms && ` · ${rooms}`}
              </span>
            </p>
          </div>

          {/* Phones: one row of badges. From md: each badge sits in its own column. */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 md:contents">
            <div className="md:flex md:min-w-0">
              {cancelled ? (
                <Badge tone="neutral">{t.bookings.card.cancelled}</Badge>
              ) : (
                <DetailsBadge booking={booking} />
              )}
            </div>
            <div className="md:flex md:min-w-0">
              <Badge tone="outline">{t.common.sources[booking.source]}</Badge>
            </div>
          </div>

          <div className="hidden justify-end md:flex">{!cancelled && <PaymentLabel booking={booking} />}</div>
        </div>

        <ChevronRight
          className="hidden size-5 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5 md:block"
          aria-hidden
        />
      </Link>
    </li>
  );
}
