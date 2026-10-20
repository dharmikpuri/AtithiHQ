/**
 * The payments spreadsheet. XLSX has two sheets — Pending Payments and Received Payments —
 * both following the current filters. CSV holds the first (what the screen shows).
 * Loaded only when the owner exports. Never includes identity-document data.
 */
import type { Copy } from "@/content";
import { dueAmount, leadGuestOf, leadNameOf, paidAmount } from "@/domain/booking-rules";
import type { OutstandingGroups } from "@/domain/booking-collections";
import type { BookingRecord } from "@/domain/read-models";
import { defineTable, type ExportTable } from "@/lib/export";
import type { ReceivedPayment } from "./payment-filters";

type PendingKind = "overdue" | "current" | "upcoming";

export function paymentsExportTables(t: Copy, groups: OutstandingGroups, received: ReceivedPayment[]): ExportTable[] {
  const e = t.payments.export;
  const c = e.columns;
  const pending: { booking: BookingRecord; kind: PendingKind }[] = (
    ["overdue", "current", "upcoming"] as const
  ).flatMap((kind) => groups[kind].map((booking) => ({ booking, kind })));
  const lastPayment = (booking: BookingRecord) =>
    booking.payments.reduce<string | null>(
      (latest, payment) => (!latest || payment.receivedOn > latest ? payment.receivedOn : latest),
      null,
    );

  return [
    defineTable(
      e.pendingSheet,
      [
        { header: c.primaryGuest, width: 24, value: (row) => leadNameOf(row.booking) },
        { header: c.phone, kind: "phone", width: 17, value: (row) => leadGuestOf(row.booking)?.guest.phone },
        { header: c.checkIn, kind: "date", width: 13, value: (row) => row.booking.checkIn },
        { header: c.checkOut, kind: "date", width: 13, value: (row) => row.booking.checkOut },
        { header: c.status, width: 24, value: (row) => t.payments.sections[row.kind] },
        { header: c.source, width: 14, value: (row) => t.common.sources[row.booking.source] },
        { header: c.total, kind: "money", width: 12, value: (row) => row.booking.totalAmount },
        { header: c.received, kind: "money", width: 13, value: (row) => paidAmount(row.booking) },
        { header: c.due, kind: "money", width: 11, value: (row) => dueAmount(row.booking) },
        {
          header: c.overdue,
          width: 10,
          value: (row) => (row.kind === "overdue" ? t.common.export.yes : t.common.export.no),
        },
        { header: c.lastPayment, kind: "date", width: 14, value: (row) => lastPayment(row.booking) },
      ],
      pending,
    ),
    defineTable<ReceivedPayment>(
      e.receivedSheet,
      [
        { header: c.receivedOn, kind: "date", width: 13, value: (row) => row.payment.receivedOn },
        { header: c.amount, kind: "money", width: 12, value: (row) => row.payment.amount },
        { header: c.method, width: 14, value: (row) => t.common.paymentMethods[row.payment.method] },
        { header: c.note, width: 28, value: (row) => row.payment.note },
        { header: c.primaryGuest, width: 24, value: (row) => leadNameOf(row.booking) },
        { header: c.phone, kind: "phone", width: 17, value: (row) => leadGuestOf(row.booking)?.guest.phone },
        { header: c.checkIn, kind: "date", width: 13, value: (row) => row.booking.checkIn },
        { header: c.checkOut, kind: "date", width: 13, value: (row) => row.booking.checkOut },
        { header: c.source, width: 14, value: (row) => t.common.sources[row.booking.source] },
      ],
      received,
    ),
  ];
}
