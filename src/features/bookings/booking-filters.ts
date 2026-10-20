/**
 * Filters for the bookings list. Pure functions, so they can move to the API later.
 * They narrow each tab (Today / Upcoming / Past) and the "Awaiting details" view.
 */
import type { Copy } from "@/content";
import { detailsState, paymentState, type DetailsState, type PaymentState } from "@/domain/booking-rules";
import { BOOKING_SOURCES } from "@/domain/constants";
import { usesRoomInventory, type BookingMode } from "@/domain/inventory";
import type { BookingRecord } from "@/domain/read-models";
import { inRange, rangeOf, selected, type FilterField, type FilterState } from "@/lib/filters";

const PAYMENT_FILTERS = ["due", "paid", "no_amount"] as const;
const DETAILS_FILTERS: readonly DetailsState[] = ["complete", "waiting", "not_sent", "partial"];

/** Payment states grouped the way an owner thinks about them. */
const PAYMENT_BUCKET: Record<PaymentState, (typeof PAYMENT_FILTERS)[number]> = {
  no_amount: "no_amount",
  unpaid: "due",
  partial: "due",
  paid: "paid",
  overpaid: "paid",
};

const BOOKED_FILTERS = ["rooms", "whole"] as const;

export function bookingFilterFields(t: Copy, mode: BookingMode): FilterField[] {
  const f = t.bookings.filters;
  const booked: FilterField[] = usesRoomInventory(mode)
    ? [
        {
          kind: "multi",
          key: "booked",
          label: f.booked,
          options: BOOKED_FILTERS.map((value) => ({ value, label: f.bookedOptions[value] })),
        },
      ]
    : [];
  return [
    {
      kind: "multi",
      key: "source",
      label: f.source,
      options: BOOKING_SOURCES.map((value) => ({ value, label: t.common.sources[value] })),
    },
    {
      kind: "multi",
      key: "payment",
      label: f.payment,
      options: PAYMENT_FILTERS.map((value) => ({ value, label: f.paymentOptions[value] })),
    },
    {
      kind: "multi",
      key: "details",
      label: f.details,
      options: DETAILS_FILTERS.map((value) => ({ value, label: f.detailsOptions[value] })),
    },
    ...booked,
    { kind: "dateRange", key: "checkin", label: f.dates },
  ];
}

export function matchesBookingFilters(booking: BookingRecord, state: FilterState): boolean {
  const sources = selected(state, "source");
  if (sources.length && !sources.includes(booking.source)) return false;
  const payments = selected(state, "payment");
  if (payments.length && !payments.includes(PAYMENT_BUCKET[paymentState(booking)])) return false;
  const details = selected(state, "details");
  if (details.length && !details.includes(detailsState(booking))) return false;
  const booked = selected(state, "booked");
  if (booked.length && !booked.includes(booking.roomsBooked === null ? "whole" : "rooms")) return false;
  return inRange(booking.checkIn, rangeOf(state, "checkin"));
}
