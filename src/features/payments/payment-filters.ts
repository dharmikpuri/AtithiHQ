/**
 * Filters for the payments overview. Pure functions.
 * The same filters decide both export sheets: what is still pending, and what was received.
 */
import type { Copy } from "@/content";
import { dueAmount, isCancelled } from "@/domain/booking-rules";
import { BOOKING_SOURCES, PAYMENT_METHODS } from "@/domain/constants";
import type { BookingRecord } from "@/domain/read-models";
import type { ISODate, Payment } from "@/domain/types";
import { inRange, isOn, rangeOf, selected, type FilterField, type FilterState } from "@/lib/filters";

export function paymentFilterFields(t: Copy): FilterField[] {
  const f = t.payments.filters;
  return [
    {
      kind: "multi",
      key: "source",
      label: f.source,
      options: BOOKING_SOURCES.map((value) => ({ value, label: t.common.sources[value] })),
    },
    {
      kind: "multi",
      key: "method",
      label: f.method,
      options: PAYMENT_METHODS.map((value) => ({ value, label: t.common.paymentMethods[value] })),
    },
    { kind: "toggle", key: "overdue", label: f.overdue, hint: f.overdueHint },
    { kind: "dateRange", key: "checkin", label: f.dates },
  ];
}

/** Checked out with money still due. */
function isOverdue(booking: BookingRecord, today: ISODate): boolean {
  return !isCancelled(booking) && (dueAmount(booking) ?? 0) > 0 && booking.checkOut < today;
}

export function matchesPaymentFilters(booking: BookingRecord, state: FilterState, today: ISODate): boolean {
  const sources = selected(state, "source");
  if (sources.length && !sources.includes(booking.source)) return false;
  const methods = selected(state, "method");
  if (methods.length && !booking.payments.some((payment) => methods.includes(payment.method))) return false;
  if (isOn(state, "overdue") && !isOverdue(booking, today)) return false;
  return inRange(booking.checkIn, rangeOf(state, "checkin"));
}

export interface ReceivedPayment {
  payment: Payment;
  booking: BookingRecord;
}

/** Every payment received on the matching bookings, newest first (only the chosen methods, if any). */
export function receivedPayments(bookings: BookingRecord[], state: FilterState): ReceivedPayment[] {
  const methods = selected(state, "method");
  return bookings
    .filter((booking) => !isCancelled(booking))
    .flatMap((booking) =>
      booking.payments
        .filter((payment) => methods.length === 0 || methods.includes(payment.method))
        .map((payment) => ({ payment, booking })),
    )
    .sort((a, b) => b.payment.receivedOn.localeCompare(a.payment.receivedOn));
}
