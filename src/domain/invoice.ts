/**
 * Receipts and tax invoices. Pure functions, shared by the screens and the mock API.
 *
 * Three kinds of document:
 * - `receipt`: the property is not GST registered. No GST anywhere.
 * - `tax_invoice`: the property is GST registered and the owner chose "with GST". Shows the owner's GSTIN.
 * - `payment_receipt`: GST registered, but the owner chose "without GST". No GST lines.
 *
 * GST is one line ("GST 12%"): no CGST / SGST / IGST split. It is worked out in integer paise and rounded
 * half-up to the paisa, so nothing is ever floating point. For ₹10,000 at 5%:
 * - included in the total: taxable ₹9,523.81 + GST ₹476.19 = total ₹10,000.00
 * - added on top:          taxable ₹10,000.00 + GST ₹500.00 = total ₹10,500.00
 *
 * Numbers run per property and per Indian financial year (Apr–Mar), taken from the issue date.
 * Receipts and payment receipts share one series (`SV/2026-27/0001`); tax invoices have their own
 * (`SV/TI/2026-27/0001`). The prefix is the property's initials. Numbers are assigned on issue by the
 * backend, never by the client.
 *
 * An issued document is a snapshot: property, owner, guest, stay, amounts, payments and GST details are
 * copied when it is issued and never change. If the booking changes afterwards (`isStale`), the owner can
 * issue an updated one: it keeps the same number with `version` + 1, and older versions are `superseded`.
 * A cancelled booking can't get a new document; an existing one stays viewable, marked cancelled.
 *
 * Sharing: each time the owner sends a document on WhatsApp it gets a fresh public link that expires
 * `RECEIPT_LINK_HOURS` after it was made. Older links keep their own expiry; nothing is revoked.
 */
import { nightsOf } from "./booking-rules";
import { isGstRate, type GstRate } from "./gst";
import { usesRoomInventory } from "./inventory";
import type { BookingRecord } from "./read-models";
import type { Invoice, InvoiceSnapshot, ISODate, ISODateTime, Owner, Paise, Property, Rupees } from "./types";

export const INVOICE_KINDS = ["receipt", "tax_invoice", "payment_receipt"] as const;

export type InvoiceKind = (typeof INVOICE_KINDS)[number];

/** Whether the total already contains the GST, or the GST is charged on top of it. */
export const GST_MODES = ["included", "added"] as const;

export type GstMode = (typeof GST_MODES)[number];

export function isGstMode(value: unknown): value is GstMode {
  return typeof value === "string" && (GST_MODES as readonly string[]).includes(value);
}

/** What the owner chose when creating a document. Only a tax invoice carries GST details. */
export type InvoiceChoice =
  | { kind: "receipt" | "payment_receipt" }
  | { kind: "tax_invoice"; gstMode: GstMode; rate: GstRate; updateBookingTotal: boolean };

/* --------------------------------- GST maths -------------------------------- */

export interface GstBreakdown {
  rate: GstRate;
  mode: GstMode;
  taxable: Paise;
  gst: Paise;
  total: Paise;
}

/** Integer division of positive numbers, rounded half-up. */
function divideRounded(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

function rupeesToPaise(amount: Rupees): Paise {
  return amount * 100;
}

/** Paise to whole rupees, rounded half-up. */
export function paiseToRupees(amount: Paise): Rupees {
  return divideRounded(amount, 100);
}

export function gstBreakdown(totalRupees: Rupees, rate: GstRate, mode: GstMode): GstBreakdown {
  const booked = rupeesToPaise(totalRupees);
  if (mode === "included") {
    const taxable = divideRounded(booked * 100, 100 + rate);
    return { rate, mode, taxable, gst: booked - taxable, total: booked };
  }
  const gst = divideRounded(booked * rate, 100);
  return { rate, mode, taxable: booked, gst, total: booked + gst };
}

export interface DocumentTotals {
  total: Paise;
  received: Paise;
  /** Never below zero. */
  balanceDue: Paise;
  paidInFull: boolean;
}

export function documentTotals(total: Paise, payments: readonly { amount: Rupees }[]): DocumentTotals {
  const received = rupeesToPaise(payments.reduce((sum, payment) => sum + payment.amount, 0));
  const balanceDue = Math.max(0, total - received);
  return { total, received, balanceDue, paidInFull: balanceDue === 0 };
}

/* -------------------------------- Numbering --------------------------------- */

/** "2026-27" for any date from 1 Apr 2026 to 31 Mar 2027. */
export function financialYearOf(date: ISODate): string {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const start = month >= 4 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

const FALLBACK_INVOICE_PREFIX = "INV";

/**
 * The property's initials, upper-case A–Z, at most 3 letters: "Sunrise Villa" → "SV".
 * A single word gives its first two letters; a name with no usable letters gives "INV".
 */
export function invoicePrefix(propertyName: string): string {
  const words =
    propertyName
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toUpperCase()
      .match(/[A-Z]+/g) ?? [];
  if (words.length === 0) return FALLBACK_INVOICE_PREFIX;
  if (words.length === 1) return words[0].slice(0, 2);
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("");
}

/** Receipts and payment receipts count together; tax invoices count on their own. */
export type InvoiceSeries = "receipt" | "tax_invoice";

export function seriesOf(kind: InvoiceKind): InvoiceSeries {
  return kind === "tax_invoice" ? "tax_invoice" : "receipt";
}

const RECEIPT_NUMBER = /^[A-Z]{1,3}\/(\d{4}-\d{2})\/(\d{4,})$/;
const TAX_INVOICE_NUMBER = /^[A-Z]{1,3}\/TI\/(\d{4}-\d{2})\/(\d{4,})$/;

export function formatInvoiceNumber(prefix: string, kind: InvoiceKind, financialYear: string, sequence: number) {
  const serial = String(sequence).padStart(4, "0");
  return kind === "tax_invoice" ? `${prefix}/TI/${financialYear}/${serial}` : `${prefix}/${financialYear}/${serial}`;
}

function sequenceOf(number: string, series: InvoiceSeries, financialYear: string): number | null {
  const match = (series === "tax_invoice" ? TAX_INVOICE_NUMBER : RECEIPT_NUMBER).exec(number);
  return match && match[1] === financialYear ? Number(match[2]) : null;
}

/**
 * The next free number in the series and financial year of `issueDate`. It follows the highest number
 * already used there, whatever its prefix, so renaming the property doesn't restart the count.
 */
export function nextInvoiceNumber(
  existing: readonly Pick<Invoice, "number">[],
  kind: InvoiceKind,
  prefix: string,
  issueDate: ISODate,
): string {
  const financialYear = financialYearOf(issueDate);
  const series = seriesOf(kind);
  const highest = existing.reduce(
    (max, invoice) => Math.max(max, sequenceOf(invoice.number, series, financialYear) ?? 0),
    0,
  );
  return formatInvoiceNumber(prefix, kind, financialYear, highest + 1);
}

/* --------------------------------- Documents -------------------------------- */

/** Why a booking can't get a new document right now, or `null` when it can. */
export function invoiceBlocker(
  booking: Pick<BookingRecord, "status" | "totalAmount">,
): "cancelled" | "no_total" | null {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.totalAmount === null || booking.totalAmount <= 0) return "no_total";
  return null;
}

/** The GST breakdown a choice produces, or `null` for documents without GST. */
function breakdownOf(totalRupees: Rupees, choice: InvoiceChoice): GstBreakdown | null {
  return choice.kind === "tax_invoice" ? gstBreakdown(totalRupees, choice.rate, choice.gstMode) : null;
}

/**
 * Copies everything a document shows out of the live records, so it never changes afterwards.
 * `null` when the booking has no total yet. When the owner asks for it, the booking's total becomes the
 * document total ("added on top"), and the snapshot records that new booking total.
 */
export function invoiceSnapshotOf({
  property,
  owner,
  booking,
  choice,
}: {
  property: Property;
  owner: Pick<Owner, "name" | "phone" | "email">;
  booking: BookingRecord;
  choice: InvoiceChoice;
}): InvoiceSnapshot | null {
  if (booking.totalAmount === null) return null;
  const breakdown = breakdownOf(booking.totalAmount, choice);
  const total = breakdown?.total ?? rupeesToPaise(booking.totalAmount);
  const updatesBookingTotal = choice.kind === "tax_invoice" && choice.gstMode === "added" && choice.updateBookingTotal;
  const lead = booking.guests.find((entry) => entry.role === "lead");

  return {
    property: {
      type: property.type,
      name: property.name,
      locality: property.location,
      city: property.city,
      state: property.state,
      pincode: property.pincode,
    },
    owner: { name: owner.name, phone: owner.phone, email: owner.email },
    gst: breakdown && property.gst ? { gstin: property.gst.gstin, breakdown } : null,
    guest: { name: lead?.guest.name ?? "", phone: lead?.guest.phone ?? null },
    stay: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: nightsOf(booking),
      guestCount: booking.guestCount,
      roomsBooked: booking.roomsBooked,
      showRooms: usesRoomInventory(property.bookingMode),
    },
    bookingTotal: updatesBookingTotal ? paiseToRupees(total) : booking.totalAmount,
    total,
    payments: booking.payments.map((payment) => ({
      receivedOn: payment.receivedOn,
      method: payment.method,
      amount: payment.amount,
    })),
  };
}

const paymentsKey = (payments: readonly { receivedOn: ISODate; method: string; amount: Rupees }[]) =>
  payments.map((payment) => `${payment.receivedOn}|${payment.method}|${payment.amount}`).join(";");

export interface RevisionGst {
  /** The mode to start from: the previous one carried over, or `null` for a first document. */
  mode: GstMode | null;
  /** The previous tax invoice added GST on top and raised the booking total to match. */
  previousRaisedTotal: boolean;
  /** …and the booking total hasn't changed since, so it already contains that GST. */
  totalHasGst: boolean;
}

/**
 * How an updated tax invoice should treat GST. Like accounting tools, a revision carries the previous
 * tax treatment over, with one correction: if the last invoice added GST on top and raised the booking
 * total to match, that total now already contains GST, so it starts as "included". Picking "added"
 * again would charge GST twice; the sheet warns when the owner does.
 */
export function revisionGstOf(
  previous: Pick<Invoice, "snapshot"> | undefined,
  booking: Pick<BookingRecord, "totalAmount">,
): RevisionGst {
  const breakdown = previous?.snapshot.gst?.breakdown;
  if (!previous || !breakdown) return { mode: null, previousRaisedTotal: false, totalHasGst: false };
  const previousRaisedTotal =
    breakdown.mode === "added" && previous.snapshot.bookingTotal === paiseToRupees(previous.snapshot.total);
  const totalHasGst = previousRaisedTotal && booking.totalAmount === previous.snapshot.bookingTotal;
  return { mode: totalHasGst ? "included" : breakdown.mode, previousRaisedTotal, totalHasGst };
}

/**
 * Whether the booking changed in a way the document shows: total, dates, guests, rooms, the lead
 * guest's name, or the payments. Compared against the snapshot, never against the live property.
 */
export function isStale(invoice: Pick<Invoice, "snapshot">, booking: BookingRecord): boolean {
  const { snapshot } = invoice;
  const lead = booking.guests.find((entry) => entry.role === "lead");
  return (
    snapshot.bookingTotal !== booking.totalAmount ||
    snapshot.stay.checkIn !== booking.checkIn ||
    snapshot.stay.checkOut !== booking.checkOut ||
    snapshot.stay.guestCount !== booking.guestCount ||
    snapshot.stay.roomsBooked !== booking.roomsBooked ||
    snapshot.guest.name !== (lead?.guest.name ?? "") ||
    paymentsKey(snapshot.payments) !== paymentsKey(booking.payments)
  );
}

/** The version a booking's card shows: the newest one that is still current. */
export function latestInvoiceOf<T extends Invoice>(invoices: readonly T[], bookingId: string): T | undefined {
  return invoices
    .filter((invoice) => invoice.bookingId === bookingId && invoice.status === "issued")
    .sort((a, b) => b.version - a.version)[0];
}

/** Latest version per booking, for lists. */
export function latestInvoicesByBooking<T extends Invoice>(invoices: readonly T[]): Map<string, T> {
  const latest = new Map<string, T>();
  for (const invoice of invoices) {
    if (invoice.status !== "issued") continue;
    const current = latest.get(invoice.bookingId);
    if (!current || invoice.version > current.version) latest.set(invoice.bookingId, invoice);
  }
  return latest;
}

/* ------------------------------- Public links ------------------------------- */

/** How long a link made for sending a document keeps working. */
export const RECEIPT_LINK_HOURS = 48;

/** When a link made at `createdAt` stops working. */
export function receiptLinkExpiry(createdAt: ISODateTime): ISODateTime {
  return new Date(new Date(createdAt).getTime() + RECEIPT_LINK_HOURS * 3_600_000).toISOString();
}

/** A link works up to, but not including, its expiry moment. */
export function isReceiptLinkExpired(expiresAt: ISODateTime, now: Date = new Date()): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}

/** The newest link of a document. */
export function latestLinkOf<T extends { createdAt: ISODateTime }>(links: readonly T[]): T | null {
  return links.reduce<T | null>((latest, link) => (!latest || link.createdAt > latest.createdAt ? link : latest), null);
}

/** Validates a rate that arrived from outside (an API call), falling back to the property's own. */
export function resolveRate(rate: unknown, fallback: GstRate): GstRate | null {
  if (rate === undefined) return fallback;
  return isGstRate(rate) ? rate : null;
}
