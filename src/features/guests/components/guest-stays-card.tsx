"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { isCancelled, nightsOf, paidAmount, stayPhase } from "@/domain/booking-rules";
import type { GuestProfile, GuestStay } from "@/domain/read-models";
import { DateTile } from "@/features/bookings/components/date-tile";
import { STAY_PHASE_TONE } from "@/features/bookings/status";
import { cn } from "@/lib/cn";
import { formatStayRange, todayISO } from "@/lib/dates";
import { formatINR } from "@/lib/money";

/** Every stay, newest first. Each one opens its booking. */
export function GuestStaysCard({ profile }: { profile: GuestProfile }) {
  const t = useCopy();
  const today = todayISO();

  return (
    <Card>
      {/* Same header height as the Details card, so their dividers line up side by side. */}
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 pt-3 sm:min-h-15 sm:px-5 sm:pt-4">
        <h2 className="text-headline text-ink">{t.guests.profile.stays.title}</h2>
        <span className="text-callout font-semibold text-ink-2 tabular">
          {t.common.count.stays(profile.summary.stayCount)}
        </span>
      </div>
      <ul className="mt-2 divide-y divide-line border-t border-line">
        {profile.stays.map((stay) => (
          <StayRow key={stay.booking.id} stay={stay} today={today} />
        ))}
      </ul>
    </Card>
  );
}

function StayRow({ stay, today }: { stay: GuestStay; today: string }) {
  const t = useCopy();
  const s = t.guests.profile.stays;
  const { booking, role, leadName } = stay;
  const cancelled = isCancelled(booking);
  const phase = stayPhase(booking, today);
  const status: { label: string; tone: BadgeTone } | null = cancelled
    ? { label: t.guests.stayStatus.cancelled, tone: "neutral" }
    : phase === "past"
      ? null
      : { label: t.guests.stayStatus[phase], tone: STAY_PHASE_TONE[phase] };
  // Money belongs to whoever booked; companions see the stay without an amount.
  const paid = role === "lead" && !cancelled ? paidAmount(booking) : 0;

  return (
    <li>
      <Link
        href={routes.booking(booking.id)}
        className={cn(
          "group flex items-center gap-3.5 px-4 py-3 transition-colors duration-150 outline-none sm:px-5",
          "hover:bg-subtle focus-visible:bg-brand-50/60 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset active:bg-canvas",
        )}
      >
        <DateTile date={booking.checkIn} muted={cancelled} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={cn(
                  "text-body font-semibold",
                  cancelled ? "text-ink-3 line-through decoration-ink-4" : "text-ink",
                )}
              >
                {formatStayRange(booking.checkIn, booking.checkOut)}
              </span>
              {status && (
                <Badge tone={status.tone} size="sm">
                  {status.label}
                </Badge>
              )}
            </span>
            {paid > 0 && (
              <span className="shrink-0 text-callout leading-6 font-semibold whitespace-nowrap text-ink tabular">
                {formatINR(paid)}
              </span>
            )}
          </span>
          <span className="truncate text-subhead text-ink-3">
            {t.common.count.nights(nightsOf(booking))} · {role === "lead" ? s.booked : s.with(leadName)}
          </span>
        </span>
        <ChevronRight
          className="size-5 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  );
}
