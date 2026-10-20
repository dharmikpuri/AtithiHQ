/**
 * Building and sending the guest link from the owner's own WhatsApp.
 * No platform number, no message API — just a prefilled chat.
 */
import { routes } from "@/config/routes";
import { publicOrigin } from "@/config/site";
import { getCopy } from "@/content";
import { guestsStillNeeded, leadGuestOf } from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import type { PhoneE164, Property } from "@/domain/types";
import { formatStayRange } from "@/lib/dates";
import { whatsappNumber } from "@/lib/phone";

/** The full link sent to the guest. Uses NEXT_PUBLIC_SITE_URL in production (see `config/site.ts`). */
export function guestLinkUrl(token: string): string {
  return `${publicOrigin()}${routes.guestForm(token)}`;
}

/** The link without the protocol, for display. */
export function guestLinkLabel(token: string): string {
  return guestLinkUrl(token).replace(/^https?:\/\//, "");
}

export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export type ShareKind = "invite" | "reminder";

export function shareKindFor(booking: BookingRecord): ShareKind {
  return booking.link.status === "not_sent" ? "invite" : "reminder";
}

export function buildShareMessage(booking: BookingRecord, property: Property, kind: ShareKind): string {
  const t = getCopy().bookings.share;
  const lead = leadGuestOf(booking);
  const firstName = firstNameOf(lead?.guest.name ?? "");
  const link = guestLinkUrl(booking.link.token);
  if (kind === "reminder") {
    const remaining = Math.max(1, guestsStillNeeded(booking));
    return t.reminder(firstName, property.name, remaining, link);
  }
  return t.message(firstName, property.name, formatStayRange(booking.checkIn, booking.checkOut), link);
}

/** wa.me link — opens the chat with the guest if we have their number. */
export function whatsappUrl(message: string, phone: PhoneE164 | null): string {
  const base = phone ? `https://wa.me/${whatsappNumber(phone)}` : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
