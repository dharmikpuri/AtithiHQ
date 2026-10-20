/**
 * The guests spreadsheet: one row per guest per booking (so someone with three bookings
 * has three rows), for the rows currently shown on the Guests screen.
 * Loaded only when the owner exports. Never includes identity-document data.
 */
import type { Copy } from "@/content";
import { countryName } from "@/domain/countries";
import type { BookingGuestDetails } from "@/domain/read-models";
import type { ISODate } from "@/domain/types";
import { stayStatusLabel } from "@/features/bookings/export";
import { formatFullDate } from "@/lib/dates";
import { defineTable, type ExportTable } from "@/lib/export";
import { peopleOf, type GuestGroup } from "./guest-groups";

interface GuestRow {
  group: GuestGroup;
  entry: BookingGuestDetails;
}

export function guestsExportTables(t: Copy, groups: GuestGroup[], today: ISODate): ExportTable[] {
  const e = t.guests.export;
  const c = e.columns;
  const rows: GuestRow[] = groups.flatMap((group) => peopleOf(group).map((entry) => ({ group, entry })));

  return [
    defineTable<GuestRow>(
      e.sheet,
      [
        { header: c.primaryGuest, width: 24, value: (row) => row.group.primary.guest.name },
        { header: c.guestName, width: 24, value: (row) => row.entry.guest.name },
        { header: c.role, width: 14, value: (row) => (row.entry === row.group.primary ? e.primary : e.member) },
        {
          header: c.booking,
          width: 24,
          value: (row) =>
            `${formatFullDate(row.group.booking.checkIn)} · ${t.common.sources[row.group.booking.source]}`,
        },
        { header: c.checkIn, kind: "date", width: 13, value: (row) => row.group.booking.checkIn },
        { header: c.checkOut, kind: "date", width: 13, value: (row) => row.group.booking.checkOut },
        { header: c.phone, kind: "phone", width: 17, value: (row) => row.entry.guest.phone },
        { header: c.nationality, width: 16, value: (row) => countryName(row.entry.guest.nationality) },
        { header: c.stayStatus, width: 16, value: (row) => stayStatusLabel(t, row.group.booking, today, e.past) },
        { header: c.details, width: 11, value: (row) => (row.entry.status === "added" ? e.received : e.pending) },
      ],
      rows,
    ),
  ];
}
