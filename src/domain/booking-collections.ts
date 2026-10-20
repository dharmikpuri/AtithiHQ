/**
 * Rules that work across many bookings: dashboard numbers, list grouping
 * and the payments overview.
 */
import { detailsState, dueAmount, isCancelled, isCurrent, stayPhase } from "./booking-rules";
import type { BookingRecord } from "./read-models";
import type { ISODate, Rupees } from "./types";

const byCheckInAsc = (a: BookingRecord, b: BookingRecord) =>
  a.checkIn.localeCompare(b.checkIn) || a.createdAt.localeCompare(b.createdAt);
const byCheckInDesc = (a: BookingRecord, b: BookingRecord) => byCheckInAsc(b, a);
const byCheckOutAsc = (a: BookingRecord, b: BookingRecord) =>
  a.checkOut.localeCompare(b.checkOut) || byCheckInAsc(a, b);

export interface BookingsOverview {
  arrivingToday: number;
  awaitingDetails: number;
  outstanding: Rupees;
  outstandingBookings: number;
  guestsThisYear: number;
}

export function summarizeBookings(bookings: BookingRecord[], today: ISODate): BookingsOverview {
  const year = today.slice(0, 4);
  const live = bookings.filter((booking) => !isCancelled(booking));

  const owing = live.filter((booking) => (dueAmount(booking) ?? 0) > 0);

  return {
    arrivingToday: live.filter((booking) => booking.checkIn === today).length,
    awaitingDetails: awaitingDetails(bookings, today).length,
    outstanding: owing.reduce((sum, booking) => sum + (dueAmount(booking) ?? 0), 0),
    outstandingBookings: owing.length,
    guestsThisYear: live
      .filter((booking) => booking.checkIn.startsWith(year) && booking.checkIn <= today)
      .reduce((sum, booking) => sum + booking.guestCount, 0),
  };
}

/** Current and upcoming bookings where someone's details are still missing. */
export function awaitingDetails(bookings: BookingRecord[], today: ISODate): BookingRecord[] {
  return bookings
    .filter((booking) => !isCancelled(booking) && booking.checkOut >= today && detailsState(booking) !== "complete")
    .sort(byCheckInAsc);
}

export interface TodayGroups {
  arriving: BookingRecord[];
  staying: BookingRecord[];
  departing: BookingRecord[];
}

export interface BookingGroups {
  today: TodayGroups;
  todayCount: number;
  upcoming: BookingRecord[];
  past: BookingRecord[];
}

/**
 * Splits bookings into the three list tabs.
 * Cancelled bookings only appear under Past, so they never clutter
 * what is happening now.
 */
export function groupBookings(bookings: BookingRecord[], today: ISODate): BookingGroups {
  const today_: TodayGroups = { arriving: [], staying: [], departing: [] };
  const upcoming: BookingRecord[] = [];
  const past: BookingRecord[] = [];

  for (const booking of bookings) {
    if (isCancelled(booking)) {
      past.push(booking);
      continue;
    }
    const phase = stayPhase(booking, today);
    if (phase === "upcoming") upcoming.push(booking);
    else if (phase === "past") past.push(booking);
    else today_[phase === "arriving" ? "arriving" : phase === "staying" ? "staying" : "departing"].push(booking);
  }

  today_.arriving.sort(byCheckInAsc);
  today_.staying.sort(byCheckOutAsc);
  today_.departing.sort(byCheckInAsc);

  return {
    today: today_,
    todayCount: today_.arriving.length + today_.staying.length + today_.departing.length,
    upcoming: upcoming.sort(byCheckInAsc),
    past: past.sort(byCheckInDesc),
  };
}

export interface OutstandingGroups {
  /** Checked out, money still owed. */
  overdue: BookingRecord[];
  /** Arriving, staying or leaving today. */
  current: BookingRecord[];
  upcoming: BookingRecord[];
  /** Live bookings where no total has been entered. */
  noAmount: BookingRecord[];
  total: Rupees;
  count: number;
}

export function groupOutstanding(bookings: BookingRecord[], today: ISODate): OutstandingGroups {
  const groups: OutstandingGroups = {
    overdue: [],
    current: [],
    upcoming: [],
    noAmount: [],
    total: 0,
    count: 0,
  };

  for (const booking of bookings) {
    if (isCancelled(booking)) continue;
    const due = dueAmount(booking);
    if (due === null) {
      if (booking.checkOut >= today) groups.noAmount.push(booking);
      continue;
    }
    if (due <= 0) continue;

    groups.total += due;
    groups.count += 1;
    if (isCurrent(booking, today)) groups.current.push(booking);
    else if (booking.checkIn > today) groups.upcoming.push(booking);
    else groups.overdue.push(booking);
  }

  groups.overdue.sort(byCheckOutAsc);
  groups.current.sort(byCheckOutAsc);
  groups.upcoming.sort(byCheckInAsc);
  groups.noAmount.sort(byCheckInAsc);
  return groups;
}
