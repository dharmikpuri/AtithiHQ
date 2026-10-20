/**
 * The Guests list shows one row per booking, never one per person.
 * - The row is named after the primary guest: the first person on the guest-details form.
 * - Everyone else whose details have arrived is a "member", tucked under "View all members (X)".
 *   X counts those members only — never the primary guest.
 * - The person who booked fills in everyone on one form, so the row shows where that form
 *   stands (link not sent / waiting for form / all details in), not a per-person count.
 * Pure functions, so grouping, search and filters can move to the API later.
 */
import type { Copy } from "@/content";
import {
  detailsState,
  isCancelled,
  leadGuestOf,
  paidAmount,
  stayPhase,
  type DetailsState,
} from "@/domain/booking-rules";
import { DEFAULT_COUNTRY } from "@/domain/constants";
import type { BookingGuestDetails, BookingRecord } from "@/domain/read-models";
import type { ISODate } from "@/domain/types";
import { inRange, isOn, rangeOf, selected, type FilterField, type FilterState } from "@/lib/filters";
import { matchesPerson, type GuestSort } from "./guest-collections";

export interface GuestGroup {
  booking: BookingRecord;
  /** The first person entered on the guest-details form (the person who booked). */
  primary: BookingGuestDetails;
  /** Everyone else on the booking whose details have arrived, in the order they were entered. */
  members: BookingGuestDetails[];
  /** Where the booking's guest-details form stands. */
  status: DetailsState;
  /** Which stay at the property this is for the primary guest (1 = first visit). `null` when cancelled. */
  visit: number | null;
  /** How many stays the primary guest has in total, for the "Most visits" sort. */
  primaryStays: number;
}

const byCheckIn = (a: BookingRecord, b: BookingRecord) =>
  a.checkIn.localeCompare(b.checkIn) || a.createdAt.localeCompare(b.createdAt);

export function buildGuestGroups(bookings: BookingRecord[]): GuestGroup[] {
  // Every guest's stays, oldest first, so each booking knows which visit it is.
  const staysByGuest = new Map<string, BookingRecord[]>();
  for (const booking of [...bookings].filter((item) => !isCancelled(item)).sort(byCheckIn)) {
    for (const entry of booking.guests) {
      staysByGuest.set(entry.guestId, [...(staysByGuest.get(entry.guestId) ?? []), booking]);
    }
  }

  return bookings.flatMap((booking) => {
    const primary = leadGuestOf(booking) ?? booking.guests[0];
    if (!primary) return [];
    const stays = staysByGuest.get(primary.guestId) ?? [];
    return [
      {
        booking,
        primary,
        members: booking.guests.filter((entry) => entry !== primary && entry.status === "added"),
        status: detailsState(booking),
        visit: isCancelled(booking) ? null : stays.indexOf(booking) + 1,
        primaryStays: stays.length,
      },
    ];
  });
}

/** Everyone listed on the row: the primary guest first, then the members. */
export const peopleOf = (group: GuestGroup): BookingGuestDetails[] => [group.primary, ...group.members];

/** This booking is a repeat visit for the primary guest. */
export const isReturning = (group: GuestGroup) => (group.visit ?? 0) >= 2;

/* --------------------------------- Timing --------------------------------- */

export type GroupStayKind = "current" | "upcoming" | "past" | "cancelled";

export function groupStayKind(group: GuestGroup, today: ISODate): GroupStayKind {
  if (isCancelled(group.booking)) return "cancelled";
  const phase = stayPhase(group.booking, today);
  return phase === "upcoming" || phase === "past" ? phase : "current";
}

/* --------------------------------- Search --------------------------------- */

export interface GroupMatch {
  group: GuestGroup;
  /** Members (not the primary) whose name or number matched — their dropdown opens and they're highlighted. */
  matchedMemberIds: ReadonlySet<string>;
}

/** A row matches when its primary guest or any member matches the search. */
export function searchGroups(groups: GuestGroup[], query: string): GroupMatch[] {
  if (!query.trim()) return groups.map((group) => ({ group, matchedMemberIds: new Set() }));
  return groups.flatMap((group) => {
    const matchedMemberIds = new Set(
      group.members.filter((entry) => matchesPerson(entry.guest, query)).map((entry) => entry.guest.id),
    );
    return matchesPerson(group.primary.guest, query) || matchedMemberIds.size > 0 ? [{ group, matchedMemberIds }] : [];
  });
}

/* ---------------------------------- Sort ---------------------------------- */

const RECENT_TIER: Record<GroupStayKind, number> = { current: 0, upcoming: 1, past: 2, cancelled: 3 };

/** Who's in the house now, then who's arriving soon, then everyone else by their stay. */
function byRecent(today: ISODate) {
  return (a: GuestGroup, b: GuestGroup) => {
    const kindA = groupStayKind(a, today);
    const tier = RECENT_TIER[kindA] - RECENT_TIER[groupStayKind(b, today)];
    if (tier !== 0) return tier;
    return kindA === "upcoming"
      ? a.booking.checkIn.localeCompare(b.booking.checkIn)
      : b.booking.checkIn.localeCompare(a.booking.checkIn);
  };
}

export function sortGroups(matches: GroupMatch[], sort: GuestSort, today: ISODate): GroupMatch[] {
  const recent = byRecent(today);
  const compare: Record<GuestSort, (a: GuestGroup, b: GuestGroup) => number> = {
    recent,
    stays: (a, b) => b.primaryStays - a.primaryStays || recent(a, b),
    spend: (a, b) => paidAmount(b.booking) - paidAmount(a.booking) || recent(a, b),
    name: (a, b) =>
      a.primary.guest.name.localeCompare(b.primary.guest.name, "en-IN", { sensitivity: "base" }) || recent(a, b),
  };
  return [...matches].sort((a, b) => compare[sort](a.group, b.group));
}

/* --------------------------------- Filters -------------------------------- */

const NATIONALITY_FILTERS = ["india", "foreign"] as const;
const STAY_FILTERS = ["current", "upcoming", "past"] as const;

export function guestFilterFields(t: Copy): FilterField[] {
  const f = t.guests.filters;
  return [
    { kind: "toggle", key: "returning", label: f.returning, hint: f.returningHint },
    {
      kind: "multi",
      key: "nationality",
      label: f.nationality,
      options: NATIONALITY_FILTERS.map((value) => ({ value, label: f.nationalityOptions[value] })),
    },
    {
      kind: "multi",
      key: "stay",
      label: f.stay,
      options: STAY_FILTERS.map((value) => ({ value, label: f.stayOptions[value] })),
    },
    { kind: "dateRange", key: "checkin", label: f.dates },
  ];
}

export function matchesGuestFilters(group: GuestGroup, state: FilterState, today: ISODate): boolean {
  if (isOn(state, "returning") && !isReturning(group)) return false;
  const nationalities = selected(state, "nationality");
  if (nationalities.length) {
    // A row matches if anyone listed on it does.
    const kinds = new Set(
      peopleOf(group).map((entry) => (entry.guest.nationality === DEFAULT_COUNTRY ? "india" : "foreign")),
    );
    if (!nationalities.some((value) => kinds.has(value as (typeof NATIONALITY_FILTERS)[number]))) return false;
  }
  const stays = selected(state, "stay");
  if (stays.length && !stays.includes(groupStayKind(group, today))) return false;
  return inRange(group.booking.checkIn, rangeOf(state, "checkin"));
}
