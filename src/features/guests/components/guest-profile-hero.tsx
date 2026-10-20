"use client";

import { History, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCopy, type Copy } from "@/content";
import { isCancelled } from "@/domain/booking-rules";
import type { GuestProfile } from "@/domain/read-models";
import type { PhoneE164 } from "@/domain/types";
import { daysBetween, formatDayMonth, formatMonthYear, formatStayRange, todayISO } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { formatPhone } from "@/lib/phone";
import { whatsappUrl } from "@/features/bookings/share";
import { guestStayState } from "../guest-collections";

interface Fact {
  label: string;
  value: string;
  sub?: string | null;
}

/** Who they are, how to reach them, and their history in four numbers. */
export function GuestProfileHero({ profile }: { profile: GuestProfile }) {
  const t = useCopy();
  const p = t.guests.profile;
  const today = todayISO();
  const { guest, stayCount } = profile.summary;

  const since =
    profile.firstStayOn &&
    (profile.firstStayOn <= today
      ? p.guestSince(formatMonthYear(profile.firstStayOn))
      : p.firstStayOn(formatDayMonth(profile.firstStayOn)));

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={guest.name} size="xl" className="size-16 text-title-3 sm:size-20 sm:text-title-2" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-title-1 break-words text-ink lg:text-large-title">{guest.name}</h2>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              {since && <p className="text-callout text-ink-3">{since}</p>}
              {stayCount > 1 && (
                <Badge tone="success">
                  <History aria-hidden />
                  {p.returning}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {guest.phone && <ContactActions phone={guest.phone} name={guest.name} />}
      </div>

      <GuestFacts profile={profile} today={today} />
    </section>
  );
}

/** Call and WhatsApp straight from the owner's phone. */
function ContactActions({ phone, name }: { phone: PhoneE164; name: string }) {
  const p = useCopy().guests.profile;
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
      <Button asChild variant="secondary" size="lg">
        <a href={`tel:${phone}`} aria-label={p.callLabel(formatPhone(phone))}>
          <Phone aria-hidden />
          {p.call}
        </a>
      </Button>
      <Button asChild variant="secondary" size="lg">
        <a href={whatsappUrl("", phone)} target="_blank" rel="noopener noreferrer" aria-label={p.whatsappLabel(name)}>
          <WhatsAppIcon className="text-success-600" />
          {p.whatsapp}
        </a>
      </Button>
    </div>
  );
}

function GuestFacts({ profile, today }: { profile: GuestProfile; today: string }) {
  const t = useCopy();
  const s = t.guests.profile.stats;
  const { summary } = profile;
  const upcoming = profile.stays.filter((stay) => !isCancelled(stay.booking) && stay.booking.checkIn > today).length;
  // Money is counted on the bookings someone made, so companions have nothing of their own.
  const everBooked = profile.stays.some((stay) => stay.role === "lead");

  const facts: Fact[] = [
    { label: s.stays, value: String(summary.stayCount), sub: upcoming > 0 ? s.upcoming(upcoming) : null },
    { label: s.nights, value: String(profile.nights) },
    everBooked
      ? { label: s.spent, value: formatINR(summary.totalSpent) }
      : { label: s.spent, value: t.guests.list.emptyValue, sub: s.bookedByOthers },
    latestStayFact(t, profile, today),
  ];

  return (
    <dl
      aria-label={s.label}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card md:grid-cols-4"
    >
      {facts.map((fact) => (
        <div key={fact.label} className="flex min-w-0 flex-col gap-0.5 bg-surface px-4 py-3">
          <dt className="text-footnote font-medium text-ink-3">{fact.label}</dt>
          <dd className="truncate text-body font-semibold text-ink tabular">{fact.value}</dd>
          {fact.sub && <dd className="text-footnote text-ink-3">{fact.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** "Current stay", "Last stay" or "Next stay" — whichever says the most today. */
function latestStayFact(t: Copy, profile: GuestProfile, today: string): Fact {
  const s = t.guests.profile.stats;
  const state = guestStayState(profile.summary, today);
  const next = profile.summary.nextStay;
  switch (state.kind) {
    case "current":
      return {
        label: s.currentStay,
        value: t.guests.stayStatus[state.phase],
        sub: formatStayRange(state.stay.checkIn, state.stay.checkOut),
      };
    case "past":
      return {
        label: s.lastStay,
        value: formatMonthYear(state.stay.checkIn),
        sub: next && t.guests.list.next(formatDayMonth(next.checkIn)),
      };
    case "upcoming":
      return {
        label: s.nextStay,
        value: formatDayMonth(state.stay.checkIn),
        sub: s.inDays(daysBetween(today, state.stay.checkIn)),
      };
    default:
      return { label: s.lastStay, value: t.guests.list.emptyValue };
  }
}
