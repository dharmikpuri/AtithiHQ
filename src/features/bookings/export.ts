/**
 * The bookings spreadsheet: one row per booking in the current view and filters.
 * Loaded only when the owner exports. Never includes identity-document data.
 */
import type { Copy } from "@/content";
import {
  addedGuestCount,
  dueAmount,
  isCancelled,
  leadGuestOf,
  leadNameOf,
  nightsOf,
  paidAmount,
  stayPhase,
} from "@/domain/booking-rules";
import type { BookingRecord } from "@/domain/read-models";
import { usesRoomInventory, type BookingMode } from "@/domain/inventory";
import type { ISODate } from "@/domain/types";
import { defineTable, type ExportTable } from "@/lib/export";
import { detailsPresentation, roomsLabel } from "./status";

export function stayStatusLabel(t: Copy, booking: BookingRecord, today: ISODate, pastLabel: string): string {
  if (isCancelled(booking)) return t.guests.stayStatus.cancelled;
  const phase = stayPhase(booking, today);
  return phase === "past" ? pastLabel : t.guests.stayStatus[phase];
}

export function bookingsExportTables(
  t: Copy,
  bookings: BookingRecord[],
  today: ISODate,
  mode: BookingMode,
): ExportTable[] {
  const e = t.bookings.export;
  const c = e.columns;
  // Room quantity only ("3 rooms" / "Entire property"): rooms are never named or assigned.
  const rooms = usesRoomInventory(mode)
    ? [{ header: c.rooms, width: 16, value: (b: BookingRecord) => roomsLabel(t, b, mode) }]
    : [];
  return [
    defineTable<BookingRecord>(
      e.sheet,
      [
        { header: c.checkIn, kind: "date", width: 13, value: (b) => b.checkIn },
        { header: c.checkOut, kind: "date", width: 13, value: (b) => b.checkOut },
        { header: c.nights, kind: "number", width: 8, value: nightsOf },
        { header: c.primaryGuest, width: 24, value: leadNameOf },
        { header: c.phone, kind: "phone", width: 17, value: (b) => leadGuestOf(b)?.guest.phone },
        { header: c.guests, kind: "number", width: 8, value: (b) => b.guestCount },
        ...rooms,
        { header: c.detailsReceived, kind: "number", width: 16, value: addedGuestCount },
        { header: c.detailsStatus, width: 20, value: (b) => detailsPresentation(t, b).label },
        { header: c.source, width: 14, value: (b) => t.common.sources[b.source] },
        { header: c.stayStatus, width: 16, value: (b) => stayStatusLabel(t, b, today, e.past) },
        { header: c.bookingStatus, width: 15, value: (b) => (isCancelled(b) ? e.cancelled : e.confirmed) },
        { header: c.total, kind: "money", width: 12, value: (b) => b.totalAmount },
        { header: c.received, kind: "money", width: 13, value: paidAmount },
        { header: c.due, kind: "money", width: 11, value: dueAmount },
      ],
      bookings,
    ),
  ];
}
