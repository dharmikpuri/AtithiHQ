"use client";

import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCopy } from "@/content";
import { isCancelled, leadGuestOf, leadNameOf, nightsOf, stayPhase } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import type { Property } from "@/domain/types";
import { daysBetween, formatMonthYear, formatTimeOfDay, formatWeekdayDate, todayISO } from "@/lib/dates";
import { useBookings } from "../queries";
import { STAY_PHASE_TONE, roomsLabel } from "../status";

/** Name, dates and the facts an owner checks at a glance. */
export function BookingHero({ booking, property }: { booking: BookingRecord; property: Property }) {
  const t = useCopy();
  const d = t.bookings.detail;
  const today = todayISO();
  const phase = stayPhase(booking, today);
  const previousStay = usePreviousStay(booking);

  const phaseLabel = phase === "upcoming" ? d.phases.upcoming(daysBetween(today, booking.checkIn)) : d.phases[phase];

  const facts = [
    {
      label: d.stayFacts.checkIn,
      value: formatWeekdayDate(booking.checkIn),
      sub: formatTimeOfDay(property.checkInTime),
    },
    {
      label: d.stayFacts.checkOut,
      value: formatWeekdayDate(booking.checkOut),
      sub: formatTimeOfDay(property.checkOutTime),
    },
    { label: d.stayFacts.guests, value: String(booking.guestCount), sub: t.common.count.nights(nightsOf(booking)) },
    { label: d.stayFacts.source, value: t.common.sources[booking.source] },
  ];
  const rooms = roomsLabel(t, booking, property.bookingMode);
  if (rooms) facts.splice(3, 0, { label: d.stayFacts.rooms, value: rooms });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {!isCancelled(booking) && <Badge tone={STAY_PHASE_TONE[phase]}>{phaseLabel}</Badge>}
          {previousStay && (
            <Badge tone="success">
              <History aria-hidden />
              {d.returningGuest(formatMonthYear(previousStay))}
            </Badge>
          )}
        </div>
        <h2 className="text-title-1 text-ink lg:text-large-title">{leadNameOf(booking)}</h2>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card md:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5 bg-surface px-4 py-3">
            <dt className="text-footnote font-medium text-ink-3">{fact.label}</dt>
            <dd className="truncate text-body font-semibold text-ink">{fact.value}</dd>
            {fact.sub && <dd className="text-footnote text-ink-3">{fact.sub}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The lead guest's most recent earlier stay, if they've been before. */
function usePreviousStay(booking: BookingRecord): string | null {
  const { data: bookings = [] } = useBookings();
  const leadId = leadGuestOf(booking)?.guestId;
  if (!leadId) return null;
  const earlier = bookings
    .filter(
      (other) =>
        other.id !== booking.id &&
        !isCancelled(other) &&
        other.checkIn < booking.checkIn &&
        other.guests.some((entry) => entry.guestId === leadId),
    )
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  return earlier[0]?.checkIn ?? null;
}
