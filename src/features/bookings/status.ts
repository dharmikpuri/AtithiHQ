/**
 * Maps booking states to how they look: label, tone and icon.
 * Keeps every screen consistent — a "partial" booking looks the same everywhere.
 */
import { CircleCheck, CircleDashed, Clock3, Send, type LucideIcon } from "lucide-react";
import type { BadgeTone } from "@/components/ui/badge";
import type { Copy } from "@/content";
import {
  detailsState,
  guestsStillNeeded,
  dueAmount,
  overpaidAmount,
  paymentState,
  type DetailsState,
  type PaymentState,
  type StayPhase,
} from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import { usesRoomInventory, type BookingMode } from "@/domain/inventory";
import { formatINR } from "@/lib/money";

/**
 * What a booking takes, for display: "3 rooms" or "Entire property". `null` at properties
 * rented only as a whole, where every booking is the whole place and saying so adds nothing.
 */
export function roomsLabel(t: Copy, booking: Pick<BookingRecord, "roomsBooked">, mode: BookingMode): string | null {
  if (!usesRoomInventory(mode)) return null;
  return booking.roomsBooked === null ? t.bookings.rooms.whole : t.bookings.rooms.count(booking.roomsBooked);
}

/** Colour for where a stay is in time — same on the booking page, guest list and profile. */
export const STAY_PHASE_TONE: Record<StayPhase, BadgeTone> = {
  upcoming: "brand",
  arriving: "brand",
  staying: "success",
  departing: "warning",
  past: "neutral",
};

export interface StatusPresentation {
  label: string;
  tone: BadgeTone;
  icon: LucideIcon;
}

export const DETAILS_TONE: Record<DetailsState, BadgeTone> = {
  not_sent: "neutral",
  waiting: "warning",
  partial: "warning",
  complete: "success",
};

export const DETAILS_ICON: Record<DetailsState, LucideIcon> = {
  not_sent: Send,
  waiting: Clock3,
  partial: CircleDashed,
  complete: CircleCheck,
};

export function detailsPresentation(t: Copy, booking: BookingRecord): StatusPresentation {
  const state = detailsState(booking);
  const label =
    state === "not_sent"
      ? t.bookings.details.notSent
      : state === "waiting"
        ? t.bookings.details.waiting
        : state === "partial"
          ? t.bookings.details.missing(guestsStillNeeded(booking))
          : t.bookings.details.complete;
  return { label, tone: DETAILS_TONE[state], icon: DETAILS_ICON[state] };
}

export interface PaymentPresentation {
  state: PaymentState;
  /** Short text for lists: "₹5,000 due", "Paid". */
  label: string;
  /** Text colour class for the label. */
  textClass: string;
  tone: BadgeTone;
}

export function paymentPresentation(t: Copy, booking: BookingRecord): PaymentPresentation {
  const state = paymentState(booking);
  switch (state) {
    case "no_amount":
      return { state, label: t.bookings.payment.noAmount, textClass: "text-ink-3", tone: "neutral" };
    case "paid":
      return { state, label: t.bookings.payment.paid, textClass: "text-success-600", tone: "success" };
    case "overpaid":
      return {
        state,
        label: t.bookings.payment.overpaid(formatINR(overpaidAmount(booking))),
        textClass: "text-warning-700",
        tone: "warning",
      };
    default:
      return {
        state,
        label: t.bookings.payment.due(formatINR(dueAmount(booking) ?? 0)),
        textClass: "text-accent-700",
        tone: "accent",
      };
  }
}
