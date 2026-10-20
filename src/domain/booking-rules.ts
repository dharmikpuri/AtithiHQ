/**
 * Booking business rules. Pure functions — no UI, no I/O — so the same
 * logic can run in the browser today and on the server later.
 */
import { daysBetween } from "@/lib/dates";
import type { BookingGuestDetails, BookingRecord } from "./read-models";
import type { ISODate, Rupees } from "./types";

type WithPayments = Pick<BookingRecord, "payments" | "totalAmount">;

export function nightsOf(booking: Pick<BookingRecord, "checkIn" | "checkOut">): number {
  return Math.max(0, daysBetween(booking.checkIn, booking.checkOut));
}

export function isCancelled(booking: Pick<BookingRecord, "status">): boolean {
  return booking.status === "cancelled";
}

/* ---------------------------------- Money --------------------------------- */

export function paidAmount(booking: Pick<BookingRecord, "payments">): Rupees {
  return booking.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

/** Amount still owed. `null` when no total has been entered. Never negative. */
export function dueAmount(booking: WithPayments): Rupees | null {
  if (booking.totalAmount === null) return null;
  return Math.max(0, booking.totalAmount - paidAmount(booking));
}

export type PaymentState = "no_amount" | "unpaid" | "partial" | "paid" | "overpaid";

export function paymentState(booking: WithPayments): PaymentState {
  if (booking.totalAmount === null) return "no_amount";
  const paid = paidAmount(booking);
  if (paid > booking.totalAmount) return "overpaid";
  if (paid === booking.totalAmount) return "paid";
  if (paid === 0) return "unpaid";
  return "partial";
}

export function overpaidAmount(booking: WithPayments): Rupees {
  if (booking.totalAmount === null) return 0;
  return Math.max(0, paidAmount(booking) - booking.totalAmount);
}

/** 0–1 share of the total received, for progress bars. */
export function paidRatio(booking: WithPayments): number {
  if (!booking.totalAmount) return booking.totalAmount === 0 ? 1 : 0;
  return Math.min(1, paidAmount(booking) / booking.totalAmount);
}

/* --------------------------------- Guests --------------------------------- */

export function leadGuestOf(booking: Pick<BookingRecord, "guests">): BookingGuestDetails | undefined {
  return booking.guests.find((entry) => entry.role === "lead");
}

export function leadNameOf(booking: Pick<BookingRecord, "guests">): string {
  return leadGuestOf(booking)?.guest.name ?? "";
}

function addedGuests(booking: Pick<BookingRecord, "guests">): BookingGuestDetails[] {
  return booking.guests.filter((entry) => entry.status === "added");
}

export function addedGuestCount(booking: Pick<BookingRecord, "guests">): number {
  return addedGuests(booking).length;
}

/** How many more people still need details, never negative. */
export function guestsStillNeeded(booking: Pick<BookingRecord, "guests" | "guestCount">): number {
  return Math.max(0, booking.guestCount - addedGuestCount(booking));
}

export type DetailsState = "not_sent" | "waiting" | "partial" | "complete";

/**
 * Whether guest details are in. The person who booked fills in everyone on one form,
 * so the normal path is: not_sent → waiting → complete.
 * - complete: everyone on the booking has details (from the form or added by the owner)
 * - waiting: link sent, form not submitted yet
 * - not_sent: link not shared yet
 * - partial: the form came back but the booking now has more guests than it named
 *   (e.g. the owner raised the guest count afterwards). Rare.
 */
export function detailsState(booking: Pick<BookingRecord, "guests" | "guestCount" | "link">): DetailsState {
  if (addedGuestCount(booking) >= booking.guestCount) return "complete";
  if (booking.link.status === "submitted") return "partial";
  if (booking.link.status !== "not_sent") return "waiting";
  return "not_sent";
}

/* ---------------------------------- Time ---------------------------------- */

export type StayPhase = "upcoming" | "arriving" | "staying" | "departing" | "past";

export function stayPhase(booking: Pick<BookingRecord, "checkIn" | "checkOut">, today: ISODate): StayPhase {
  if (booking.checkIn > today) return "upcoming";
  if (booking.checkIn === today) return "arriving";
  if (booking.checkOut === today) return "departing";
  if (booking.checkOut > today) return "staying";
  return "past";
}

/** The stay overlaps today: arriving, in the house, or leaving. */
export function isCurrent(booking: Pick<BookingRecord, "checkIn" | "checkOut">, today: ISODate): boolean {
  const phase = stayPhase(booking, today);
  return phase === "arriving" || phase === "staying" || phase === "departing";
}

/** The guest link works until check-out, and only while the booking stands. */
export function isLinkUsable(booking: Pick<BookingRecord, "status" | "link">, today: ISODate): boolean {
  return booking.status === "confirmed" && today <= booking.link.expiresOn;
}

/** Bookings whose dates overlap the given range (same property). */
export function findOverlaps(
  bookings: BookingRecord[],
  range: { checkIn: ISODate; checkOut: ISODate },
  excludeId?: string,
): BookingRecord[] {
  return bookings.filter(
    (booking) =>
      booking.id !== excludeId &&
      !isCancelled(booking) &&
      booking.checkIn < range.checkOut &&
      range.checkIn < booking.checkOut,
  );
}
