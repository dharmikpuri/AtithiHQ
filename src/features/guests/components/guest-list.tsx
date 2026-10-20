"use client";

import { ArrowDown, ChevronDown, ChevronRight, History, UsersRound } from "lucide-react";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Card, surfaceStyles } from "@/components/ui/card";
import { PhoneReveal } from "@/components/ui/phone-reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { useCopy } from "@/content";
import { paidAmount, stayPhase } from "@/domain/booking-rules";
import { DEFAULT_COUNTRY } from "@/domain/constants";
import { countryName } from "@/domain/countries";
import type { Guest } from "@/domain/types";
import { detailsPresentation, STAY_PHASE_TONE } from "@/features/bookings/status";
import { cn } from "@/lib/cn";
import { formatDayMonth, formatMonthYear, formatStayRange } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import type { GuestSort } from "../guest-collections";
import { groupStayKind, isReturning, type GroupMatch, type GroupStayKind, type GuestGroup } from "../guest-groups";

/**
 * Shared by the header and every row, so the columns line up from `md`.
 * Columns grow in proportion on wide screens, so the table fills the width evenly.
 */
const COLUMNS = cn(
  "md:grid md:grid-cols-[minmax(0,1fr)_4rem_10rem_6rem] md:items-center md:gap-4",
  "xl:grid-cols-[minmax(0,2.4fr)_minmax(4.5rem,0.6fr)_minmax(12rem,1.2fr)_minmax(7.5rem,0.8fr)] xl:gap-6",
);

/** Every link in a row "stretches" over the row, so a tap anywhere opens the guest. */
const STRETCHED_LINK =
  "outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-brand-500 focus-visible:after:ring-inset";

/**
 * One row per booking, named after its primary guest. Everyone else on the booking is
 * under "View all members". Phones: a contacts-style list in one card.
 * From `md`: the same card becomes a table with aligned columns.
 */
export function GuestList({ matches, sort, today }: { matches: GroupMatch[]; sort: GuestSort; today: string }) {
  return (
    <Card className="overflow-hidden">
      <ColumnHeader sort={sort} />
      <ul className="divide-y divide-line">
        {matches.map((match) => (
          // Re-mount when a search starts or stops matching a member, so the dropdown opens or closes with it.
          <GuestGroupRow
            key={`${match.group.booking.id}:${match.matchedMemberIds.size > 0}`}
            match={match}
            today={today}
          />
        ))}
      </ul>
    </Card>
  );
}

/** Visual column labels. Each cell carries its own screen-reader text, so this stays hidden from them. */
function ColumnHeader({ sort }: { sort: GuestSort }) {
  const c = useCopy().guests.list.columns;
  const columns: { label: string; sortedBy?: GuestSort; className?: string }[] = [
    { label: c.guest, sortedBy: "name" },
    { label: c.guests },
    { label: c.lastStay, sortedBy: "recent" },
    { label: c.spent, sortedBy: "spend", className: "justify-end" },
  ];
  return (
    <div
      aria-hidden
      className="hidden items-center gap-4 border-b border-line bg-subtle px-5 py-2.5 text-footnote font-medium text-ink-3 md:flex"
    >
      <div className={cn("flex-1", COLUMNS)}>
        {columns.map((column) => (
          <span
            key={column.label}
            className={cn("flex items-center gap-1", column.sortedBy === sort && "text-ink-2", column.className)}
          >
            {column.label}
            {column.sortedBy === sort && <ArrowDown className="size-3.5" />}
          </span>
        ))}
      </div>
      <span className="w-5 shrink-0" />
    </div>
  );
}

function GuestGroupRow({ match, today }: { match: GroupMatch; today: string }) {
  const t = useCopy();
  const l = t.guests.list;
  const { group, matchedMemberIds } = match;
  const { booking, primary, members, status, visit } = group;
  // A search that found a member opens the dropdown straight away.
  const [open, setOpen] = useState(matchedMemberIds.size > 0);
  const panelId = useId();
  const kind = groupStayKind(group, today);
  const paid = paidAmount(booking);
  const spent = paid > 0 ? formatINR(paid) : null;
  const returning = isReturning(group);
  // Where the guest-details form stands — only worth showing for stays that haven't ended.
  const showStatus = status !== "complete" && (kind === "current" || kind === "upcoming");

  return (
    <li>
      <div className="group relative flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-subtle active:bg-canvas sm:px-5 md:gap-4">
        <Avatar name={primary.guest.name} className="self-start md:self-center" />

        <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", COLUMNS)}>
          <div className="flex min-w-0 flex-col gap-0.5">
            {/* Phones keep the name and amount on one line; the badge gets its own line below. */}
            <div className="flex min-w-0 items-center gap-x-2 gap-y-1 md:flex-wrap">
              <Link
                href={routes.guest(primary.guest.id)}
                className={cn("truncate text-body font-semibold text-ink", STRETCHED_LINK)}
              >
                {primary.guest.name}
              </Link>
              {returning && <ReturningBadge visit={visit} className="hidden md:inline-flex" />}
              {spent && (
                <span className="ml-auto shrink-0 pl-2 text-callout font-semibold whitespace-nowrap text-ink tabular md:hidden">
                  {spent}
                </span>
              )}
            </div>
            <StaySummaryLine group={group} kind={kind} today={today} className="md:hidden" />
            <ContactLine guest={primary.guest} />
            {returning && <ReturningBadge visit={visit} className="mt-1 self-start md:hidden" />}

            {members.length > 0 ? (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className={cn(
                  "relative z-10 mt-1.5 inline-flex h-8 items-center gap-1.5 self-start rounded-full border border-brand-100 bg-brand-50 pr-2 pl-2.5 text-footnote font-semibold text-brand-700 transition-colors hover:bg-brand-100",
                  // 44px touch area without making the pill taller.
                  "after:absolute after:inset-x-0 after:-inset-y-1.5",
                )}
              >
                <UsersRound className="size-3.5" aria-hidden />
                {l.members.viewAll(members.length)}
                <ChevronDown
                  className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
                  aria-hidden
                />
              </button>
            ) : null}
            {showStatus && <FormStatus booking={booking} className="mt-1.5" />}
          </div>

          <span className="hidden text-callout font-medium text-ink-2 tabular md:block">
            <span className="sr-only">{t.common.count.guests(booking.guestCount)}</span>
            <span aria-hidden>{booking.guestCount}</span>
          </span>

          <StayCell group={group} kind={kind} today={today} />

          <span className="hidden text-right text-callout font-semibold text-ink tabular md:block">
            {spent ?? (
              <>
                <span aria-hidden className="text-ink-3">
                  {l.emptyValue}
                </span>
                <span className="sr-only">{l.nothingSpent}</span>
              </>
            )}
          </span>
        </div>

        <ChevronRight
          className="hidden size-5 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5 md:block"
          aria-hidden
        />
      </div>

      {members.length > 0 && (
        <div
          id={panelId}
          hidden={!open}
          className="animate-fade-in border-t border-line bg-subtle px-3 pt-2 pb-3 sm:px-4 md:pl-[4.5rem]"
        >
          <ul aria-label={l.members.listLabel(primary.guest.name)} className="flex flex-col gap-0.5">
            {members.map((entry) => {
              const matched = matchedMemberIds.has(entry.guest.id);
              return (
                <li
                  key={entry.guest.id}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface",
                    matched && "bg-brand-50 ring-1 ring-brand-200 hover:bg-brand-50",
                  )}
                >
                  <Avatar name={entry.guest.name} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={routes.guest(entry.guest.id)}
                      className={cn(
                        "truncate text-callout font-medium text-ink after:rounded-xl",
                        matched && "font-semibold",
                        STRETCHED_LINK,
                      )}
                    >
                      {entry.guest.name}
                      {matched && <span className="sr-only"> — {l.members.matched}</span>}
                    </Link>
                    <ContactLine guest={entry.guest} className={cn("text-footnote", matched && "text-ink-2")} />
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-ink-4" aria-hidden />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

/** Arriving, staying or leaving — only called for stays that overlap today. */
const currentPhase = (booking: GuestGroup["booking"], today: string) =>
  stayPhase(booking, today) as "arriving" | "staying" | "departing";

/** Masked phone (with reveal) and, for guests from abroad, their country. */
function ContactLine({ guest, className }: { guest: Pick<Guest, "phone" | "nationality">; className?: string }) {
  const foreign = guest.nationality !== DEFAULT_COUNTRY;
  if (!guest.phone && !foreign) return null;
  return (
    <span className={cn("flex min-w-0 flex-wrap items-center gap-x-1.5 text-subhead text-ink-3", className)}>
      {guest.phone && <PhoneReveal phone={guest.phone} />}
      {guest.phone && foreign && <span aria-hidden>·</span>}
      {foreign && <span className="truncate">{countryName(guest.nationality)}</span>}
    </span>
  );
}

/** "Link not sent" / "Waiting for form" — the same status the bookings list shows. */
function FormStatus({ booking, className }: { booking: GuestGroup["booking"]; className?: string }) {
  const t = useCopy();
  const { label, tone, icon: Icon } = detailsPresentation(t, booking);
  return (
    <Badge tone={tone} size="sm" className={cn("self-start", className)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}

/** "Returning · 2nd visit" */
function ReturningBadge({ visit, className }: { visit: number | null; className?: string }) {
  const t = useCopy();
  const l = t.guests.list;
  return (
    <Badge tone="success" size="sm" className={className}>
      <History aria-hidden />
      {visit ? `${l.returning} · ${l.visit(visit)}` : l.returning}
    </Badge>
  );
}

/** Phones: "Arriving today · 5 guests", "Upcoming · 8 Oct · 4 guests", "7–10 Nov 2025 · 3 guests". */
function StaySummaryLine({
  group,
  kind,
  today,
  className,
}: {
  group: GuestGroup;
  kind: GroupStayKind;
  today: string;
  className?: string;
}) {
  const t = useCopy();
  const l = t.guests.list;
  const { booking } = group;
  let status: ReactNode;
  if (kind === "current") {
    status = <span className="font-medium text-ink-2">{t.guests.stayStatus[currentPhase(booking, today)]}</span>;
  } else if (kind === "upcoming") {
    status = <span className="font-medium text-brand-700">{l.upcoming(formatDayMonth(booking.checkIn))}</span>;
  } else if (kind === "cancelled") {
    status = t.guests.stayStatus.cancelled;
  } else {
    status = formatStayRange(booking.checkIn, booking.checkOut);
  }
  return (
    <span className={cn("truncate text-subhead text-ink-3", className)}>
      {status} · {l.members.guests(booking.guestCount)}
    </span>
  );
}

/** From `md`: the "Stay" column — where the booking stands, with its dates underneath. */
function StayCell({ group, kind, today }: { group: GuestGroup; kind: GroupStayKind; today: string }) {
  const t = useCopy();
  const l = t.guests.list;
  const { booking } = group;
  let primary: ReactNode;
  if (kind === "current") {
    const phase = currentPhase(booking, today);
    primary = (
      <>
        <StatusDot tone={STAY_PHASE_TONE[phase]} />
        {t.guests.stayStatus[phase]}
      </>
    );
  } else if (kind === "upcoming") {
    primary = (
      <>
        <StatusDot tone="brand" />
        {t.guests.stayStatus.upcoming}
      </>
    );
  } else if (kind === "cancelled") {
    primary = <span className="text-ink-3">{t.guests.stayStatus.cancelled}</span>;
  } else {
    primary = formatMonthYear(booking.checkIn);
  }

  return (
    <span className="hidden min-w-0 flex-col md:flex">
      <span className="sr-only">{l.columns.lastStay}: </span>
      <span className="flex items-center gap-2 text-callout whitespace-nowrap text-ink-2">{primary}</span>
      <span className="truncate text-footnote text-ink-3">{formatStayRange(booking.checkIn, booking.checkOut)}</span>
    </span>
  );
}

export function GuestListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 md:gap-5" aria-hidden>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 rounded-xl sm:flex-1" />
        <Skeleton className="h-12 rounded-xl sm:w-52" />
      </div>
      <div className={cn(surfaceStyles({ elevation: "none" }), "overflow-hidden")}>
        <div className="hidden h-10 border-b border-line bg-subtle md:block" />
        <div className="divide-y divide-line">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3 sm:px-5 md:gap-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5 md:w-1/4" />
                <Skeleton className="h-3.5 w-3/5 md:w-1/5" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
