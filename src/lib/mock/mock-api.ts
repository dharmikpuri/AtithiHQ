/**
 * Mock implementation of the AtithiHQ API.
 *
 * Behaves like a real backend from the UI's point of view: async calls,
 * realistic latency, owner isolation, validation errors and session cookies.
 * Replace with an HTTP implementation of `AtithiApi` when the backend exists.
 */
import {
  DEFAULT_COUNTRY,
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  DEFAULT_RETENTION_DAYS,
  REVISION_NOTE_MAX,
} from "@/domain/constants";
import { isCancelled, paidAmount, nightsOf } from "@/domain/booking-rules";
import { isIndianStateCode } from "@/domain/indian-states";
import {
  availabilityFor,
  checkRoomRequest,
  inventoryInUse,
  roomRequestOf,
  toInventoryBooking,
} from "@/domain/availability";
import { isValidPropertyGst, normaliseGstin } from "@/domain/gst";
import {
  INVOICE_KINDS,
  invoiceBlocker,
  invoicePrefix,
  invoiceSnapshotOf,
  isReceiptLinkExpired,
  isGstMode,
  latestLinkOf,
  nextInvoiceNumber,
  receiptLinkExpiry,
  resolveRate,
  seriesOf,
  type InvoiceChoice,
  type InvoiceKind,
} from "@/domain/invoice";
import { inventoryOf, isValidInventory, normaliseInventory, usesRoomInventory } from "@/domain/inventory";
import { isPropertyType } from "@/domain/property-types";
import { isDifferentPhone, isValidEmail, isValidPincode, TERMS_VERSION } from "@/domain/registration";
import type {
  BookingRecord,
  GuestLinkView,
  GuestProfile,
  GuestSummary,
  InvoiceRecord,
  Session,
  StayReference,
} from "@/domain/read-models";
import type {
  Booking,
  BookingGuest,
  EnteredBy,
  Guest,
  IdDocument,
  Invoice,
  InvoiceRevision,
  ISODate,
  PhoneE164,
  ReceiptLink,
} from "@/domain/types";
import { REVISION_REASON_CODES } from "@/domain/types";
import {
  ApiError,
  type AtithiApi,
  type BookingInput,
  type DocumentInput,
  type GuestDetailsInput,
  type IssueInvoiceInput,
  type LeadGuestInput,
} from "@/lib/api/contract";
import { addDays, todayISO } from "@/lib/dates";
import { isValidE164 } from "@/lib/phone";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { newId, newLinkToken, nowISO, store, type Tenant } from "./store";

/* ------------------------------- Plumbing -------------------------------- */

const LATENCY_MS = { min: 200, max: 480 };

function wait(min = LATENCY_MS.min, max = LATENCY_MS.max) {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

/**
 * Simulates a network round trip and returns a copy, like JSON over HTTP would.
 * After the delay, the latest saved data is loaded, the work runs and the result is saved, all in one
 * synchronous step, so tabs can't overwrite each other. A call that throws saves nothing.
 */
async function respond<T>(work: () => T, latency?: [number, number]): Promise<T> {
  await wait(...(latency ?? []));
  store.hydrate();
  const result = structuredClone(work());
  store.persist();
  return result;
}

function readSessionPhone(): PhoneE164 | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!entry) return null;
  const value = decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1));
  return value || null;
}

function writeSession(phone: PhoneE164) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(phone)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function currentTenant(): Tenant {
  const phone = readSessionPhone();
  if (!phone) throw new ApiError("unauthorized");
  return store.getOrCreateTenant(phone);
}

function sessionOf(tenant: Tenant): Session {
  return { owner: tenant.owner, property: tenant.property };
}

/* ------------------------------- Lookups --------------------------------- */

function findBooking(tenant: Tenant, bookingId: string): Booking {
  const booking = tenant.bookings.find((item) => item.id === bookingId);
  if (!booking) throw new ApiError("not_found", "Booking not found");
  return booking;
}

function findGuest(tenant: Tenant, guestId: string): Guest {
  const guest = tenant.guests.find((item) => item.id === guestId);
  if (!guest) throw new ApiError("not_found", "Guest not found");
  return guest;
}

function findGuestByPhone(tenant: Tenant, phone: PhoneE164 | null): Guest | undefined {
  if (!phone) return undefined;
  return tenant.guests.find((guest) => guest.phone === phone);
}

function toBookingRecord(tenant: Tenant, booking: Booking): BookingRecord {
  return {
    ...booking,
    guests: booking.guests.map((entry) => ({
      ...entry,
      guest: findGuest(tenant, entry.guestId),
      document: entry.documentId ? (tenant.documents.find((doc) => doc.id === entry.documentId) ?? null) : null,
    })),
    payments: tenant.payments
      .filter((payment) => payment.bookingId === booking.id)
      .sort((a, b) => a.receivedOn.localeCompare(b.receivedOn) || a.createdAt.localeCompare(b.createdAt)),
  };
}

function retentionDays(tenant: Tenant) {
  return tenant.property?.documentRetentionDays ?? DEFAULT_RETENTION_DAYS;
}

/* ------------------------------ Mutations -------------------------------- */

function assertBookingInput(input: BookingInput) {
  if (!(input.checkOut > input.checkIn)) throw new ApiError("validation", "Check-out must be after check-in");
  if (input.guestCount < 1) throw new ApiError("validation", "At least one guest");
  if (input.lead.name.trim().length < 2) throw new ApiError("validation", "Lead guest name required");
  if (input.lead.phone && !isValidE164(input.lead.phone)) throw new ApiError("validation", "Invalid phone");
  if (input.roomsBooked !== null && !(Number.isInteger(input.roomsBooked) && input.roomsBooked >= 1)) {
    throw new ApiError("validation", "Rooms must be a whole number, at least 1");
  }
}

/** Resolves the person behind a lead-guest input, reusing known guests. */
function resolveLeadGuest(tenant: Tenant, lead: LeadGuestInput): Guest {
  const existing =
    (lead.existingGuestId ? tenant.guests.find((guest) => guest.id === lead.existingGuestId) : undefined) ??
    findGuestByPhone(tenant, lead.phone);
  if (existing) {
    if (lead.phone && !existing.phone) existing.phone = lead.phone;
    return existing;
  }
  const guest: Guest = {
    id: newId("g"),
    propertyId: tenant.property?.id ?? "",
    name: lead.name.trim(),
    phone: lead.phone,
    nationality: DEFAULT_COUNTRY,
    createdAt: nowISO(),
  };
  tenant.guests.push(guest);
  return guest;
}

function applyDocument(
  tenant: Tenant,
  booking: Booking,
  entry: BookingGuest,
  input: DocumentInput | null | undefined,
  addedBy: EnteredBy,
) {
  if (input === undefined) return;
  const existing = entry.documentId ? tenant.documents.find((doc) => doc.id === entry.documentId) : undefined;

  if (input === null) {
    if (existing) tenant.documents = tenant.documents.filter((doc) => doc.id !== existing.id);
    entry.documentId = null;
    return;
  }

  const deleteOn = addDays(booking.checkOut, retentionDays(tenant));
  if (existing) {
    Object.assign(existing, {
      type: input.type,
      last4: input.last4,
      hasImage: input.hasImage,
      addedBy,
      addedAt: nowISO(),
      deleteOn,
    });
    return;
  }
  const document: IdDocument = {
    id: newId("doc"),
    guestId: entry.guestId,
    bookingId: booking.id,
    type: input.type,
    last4: input.last4,
    hasImage: input.hasImage,
    addedBy,
    addedAt: nowISO(),
    deleteOn,
  };
  tenant.documents.push(document);
  entry.documentId = document.id;
}

function removeEntry(tenant: Tenant, booking: Booking, entry: BookingGuest) {
  if (entry.documentId) tenant.documents = tenant.documents.filter((doc) => doc.id !== entry.documentId);
  booking.guests = booking.guests.filter((item) => item !== entry);
}

/** Adds (or refreshes) a person on a booking from submitted details. */
function upsertGuestOnBooking(
  tenant: Tenant,
  booking: Booking,
  input: GuestDetailsInput,
  addedBy: EnteredBy,
): BookingGuest {
  // Reuse a returning guest by phone — unless that person is already on this
  // booking (families often share one number).
  let guest = findGuestByPhone(tenant, input.phone);
  if (guest && booking.guests.some((item) => item.guestId === guest?.id)) guest = undefined;

  if (guest) {
    Object.assign(guest, { name: input.name.trim(), nationality: input.nationality });
  } else {
    guest = {
      id: newId("g"),
      propertyId: booking.propertyId,
      name: input.name.trim(),
      phone: input.phone,
      nationality: input.nationality,
      createdAt: nowISO(),
    };
    tenant.guests.push(guest);
  }

  const entry: BookingGuest = {
    guestId: guest.id,
    role: "companion",
    status: "added",
    addedBy,
    addedAt: nowISO(),
    documentId: null,
  };
  booking.guests.push(entry);
  applyDocument(tenant, booking, entry, input.document, addedBy);
  return entry;
}

/** Drops a placeholder guest record that no booking references any more. */
function pruneOrphanGuest(tenant: Tenant, guestId: string) {
  const used = tenant.bookings.some((booking) => booking.guests.some((entry) => entry.guestId === guestId));
  if (!used) tenant.guests = tenant.guests.filter((guest) => guest.id !== guestId);
}

/* -------------------------------- Invoices -------------------------------- */

/** Checks the request against the booking and the property's GST registration, like a backend would. */
function invoiceChoiceOf(tenant: Tenant, input: IssueInvoiceInput): InvoiceChoice {
  const property = tenant.property;
  if (!property) throw new ApiError("unauthorized");
  if (!(INVOICE_KINDS as readonly string[]).includes(input.kind)) throw new ApiError("validation", "invoice_kind");

  // A GST registered business can't issue a plain receipt, and an unregistered one can't charge GST.
  if (input.kind === "receipt" && property.gst) throw new ApiError("validation", "invoice_kind_registered");
  if (input.kind !== "receipt" && !property.gst) throw new ApiError("validation", "invoice_kind_unregistered");
  if (input.kind !== "tax_invoice") return { kind: input.kind };

  const rate = property.gst && resolveRate(input.rate, property.gst.rate);
  if (!rate) throw new ApiError("validation", "invoice_rate");
  if (!isGstMode(input.gstMode)) throw new ApiError("validation", "invoice_gst_mode");
  return { kind: "tax_invoice", gstMode: input.gstMode, rate, updateBookingTotal: input.updateBookingTotal === true };
}

/**
 * A revision keeps the number of the version it replaces, as long as it stays in the same series.
 * Moving between a tax invoice and a payment receipt starts the other series: a new number, version 1.
 * The old number is retired with its superseded document (a gap in the sequence, as in real books).
 */
function numberForInvoice(tenant: Tenant, bookingId: string, kind: InvoiceKind, issuedOn: ISODate, prefix: string) {
  const current = tenant.invoices.find((item) => item.bookingId === bookingId && item.status === "issued");
  if (current && seriesOf(current.kind) === seriesOf(kind)) {
    return { number: current.number, version: current.version + 1 };
  }
  return { number: nextInvoiceNumber(tenant.invoices, kind, prefix, issuedOn), version: 1 };
}

/** The reason for replacing a document: a known code, and a short note when it is "other". */
function revisionOf(input: InvoiceRevision | undefined): InvoiceRevision {
  if (!input || !(REVISION_REASON_CODES as readonly string[]).includes(input.reason)) {
    throw new ApiError("validation", "revision_reason_required");
  }
  const note = input.reason === "other" ? (input.note?.trim().slice(0, REVISION_NOTE_MAX) ?? "") : null;
  if (input.reason === "other" && !note) throw new ApiError("validation", "revision_reason_required");
  return { reason: input.reason, note };
}

/** The newest public link of a document, trimmed to what the owner's screens need. */
function lastLinkOf(tenant: Tenant, invoiceId: string): InvoiceRecord["lastLink"] {
  const link = latestLinkOf(tenant.receiptLinks.filter((item) => item.invoiceId === invoiceId));
  return link && { createdAt: link.createdAt, expiresAt: link.expiresAt };
}

/* ---------------------------- Guest summaries ---------------------------- */

const stayRef = (booking: Booking): StayReference => ({
  bookingId: booking.id,
  checkIn: booking.checkIn,
  checkOut: booking.checkOut,
});

function staysOf(tenant: Tenant, guestId: string): Booking[] {
  return tenant.bookings.filter(
    (booking) => booking.status !== "cancelled" && booking.guests.some((entry) => entry.guestId === guestId),
  );
}

function summarizeGuest(tenant: Tenant, guest: Guest, today: ISODate): GuestSummary | null {
  const stays = staysOf(tenant, guest.id);
  if (stays.length === 0) return null;

  const started = stays
    .filter((booking) => booking.checkIn <= today)
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  const future = stays.filter((booking) => booking.checkIn > today).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const totalSpent = stays
    .filter((booking) => booking.guests.some((entry) => entry.guestId === guest.id && entry.role === "lead"))
    .reduce((sum, booking) => sum + paidAmount(toBookingRecord(tenant, booking)), 0);

  return {
    guest,
    stayCount: stays.length,
    totalSpent,
    lastStay: started[0] ? stayRef(started[0]) : null,
    nextStay: future[0] ? stayRef(future[0]) : null,
  };
}

/* ------------------------------ Guest link ------------------------------- */

function linkState(booking: Booking, today: ISODate): GuestLinkView["state"] {
  if (booking.status === "cancelled") return "cancelled";
  if (today > booking.link.expiresOn) return "expired";
  return "active";
}

function toLinkView(tenant: Tenant, booking: Booking): GuestLinkView {
  const property = tenant.property;
  if (!property) throw new ApiError("link_unavailable");
  const record = toBookingRecord(tenant, booking);
  const lead = record.guests.find((entry) => entry.role === "lead");

  return {
    token: booking.link.token,
    state: linkState(booking, todayISO()),
    property: {
      type: property.type,
      name: property.name,
      location: property.location,
      hostName: tenant.owner.name,
      hostPhone: tenant.owner.phone,
      checkInTime: property.checkInTime,
      checkOutTime: property.checkOutTime,
      idRequirement: property.idRequirement,
      documentRetentionDays: property.documentRetentionDays,
    },
    stay: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      // Only the quantity: guests never see which rooms.
      booked: usesRoomInventory(property.bookingMode)
        ? booking.roomsBooked === null
          ? { kind: "whole" }
          : { kind: "rooms", count: booking.roomsBooked }
        : null,
    },
    lead: { name: lead?.guest.name ?? "", phone: lead?.guest.phone ?? null },
    submittedGuests: record.guests
      .filter((entry) => entry.status === "added" && entry.addedBy === "guest")
      .sort((a, b) => (a.role === b.role ? 0 : a.role === "lead" ? -1 : 1))
      .map((entry) => ({
        name: entry.guest.name,
        phone: entry.guest.phone,
        nationality: entry.guest.nationality,
        role: entry.role,
        document: entry.document ? { type: entry.document.type, last4: entry.document.last4 } : null,
      })),
    submittedAt: booking.link.submittedAt,
  };
}

/**
 * Rejects a stay that doesn't fit the property's room inventory, as a real backend must
 * (the form's check is only a convenience). Whole-property-only properties keep their
 * existing behaviour: overlaps are allowed and only flagged in the form.
 */
function assertRoomsAvailable(
  tenant: Tenant,
  stay: { id?: string; checkIn: ISODate; checkOut: ISODate; roomsBooked: number | null },
) {
  const property = tenant.property;
  if (!property) throw new ApiError("unauthorized");
  const inventory = inventoryOf(property);
  if (!usesRoomInventory(inventory.mode)) {
    if (stay.roomsBooked !== null) throw new ApiError("validation", "rooms_not_offered");
    return;
  }
  const availability = availabilityFor({
    inventory,
    bookings: tenant.bookings.map(toInventoryBooking),
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    excludeBookingId: stay.id,
  });
  const problem = checkRoomRequest(inventory, availability, roomRequestOf(stay.roomsBooked));
  if (problem) throw new ApiError("unavailable", problem);
}

/* --------------------------------- API ----------------------------------- */

export const mockApi: AtithiApi = {
  auth: {
    getSession: () =>
      respond(() => {
        const phone = readSessionPhone();
        return phone ? sessionOf(store.getOrCreateTenant(phone)) : null;
      }, [120, 260]),

    requestCode: (phone) =>
      respond(() => {
        if (!isValidE164(phone)) throw new ApiError("validation", "Invalid phone");
        return { resendAfterSeconds: 30 };
      }, [500, 900]),

    verifyCode: (phone, code) =>
      respond(() => {
        // Demo rule: any 6 digits work, except 000000 which shows the error state.
        if (!/^\d{6}$/.test(code) || code === "000000") throw new ApiError("invalid_code");
        writeSession(phone);
        return sessionOf(store.getOrCreateTenant(phone));
      }, [600, 900]),

    logout: (options) =>
      respond(() => {
        if (options?.erase) {
          const phone = readSessionPhone();
          if (phone) store.deleteTenant(phone);
        }
        clearSession();
      }, [150, 300]),
  },

  account: {
    completeRegistration: ({ owner, property, inventory, gst, consent }) =>
      respond(() => {
        const tenant = currentTenant();
        // Re-check every rule, as a real backend would; the form's checks are only a convenience.
        const valid =
          isPropertyType(property.type) &&
          isValidInventory(inventory.bookingMode, inventory.roomCount) &&
          isValidPropertyGst(gst) &&
          owner.name.trim().length >= 2 &&
          isValidE164(owner.alternatePhone) &&
          isDifferentPhone(owner.alternatePhone, tenant.owner.phone) &&
          isValidEmail(owner.email) &&
          property.name.trim().length >= 2 &&
          property.location.trim().length >= 2 &&
          property.city.trim().length >= 2 &&
          isIndianStateCode(property.state) &&
          isValidPincode(property.pincode) &&
          consent.accepted &&
          consent.termsVersion === TERMS_VERSION;
        if (!valid) throw new ApiError("validation", "Registration is incomplete");

        Object.assign(tenant.owner, {
          name: owner.name.trim(),
          alternatePhone: owner.alternatePhone,
          email: owner.email.trim().toLowerCase(),
          consent: { termsVersion: consent.termsVersion, acceptedAt: consent.acceptedAt },
        });
        const basics = {
          type: property.type,
          name: property.name.trim(),
          location: property.location.trim(),
          city: property.city.trim(),
          state: property.state,
          pincode: property.pincode,
          ...(({ mode, totalRooms }) => ({ bookingMode: mode, roomCount: totalRooms }))(
            normaliseInventory(inventory.bookingMode, inventory.roomCount),
          ),
          gst: gst && { gstin: normaliseGstin(gst.gstin), rate: gst.rate },
        };
        // An owner finishing an earlier, incomplete registration keeps their property (and its bookings).
        tenant.property = tenant.property
          ? { ...tenant.property, ...basics }
          : {
              id: newId("prop"),
              ownerId: tenant.owner.id,
              ...basics,
              checkInTime: DEFAULT_CHECK_IN_TIME,
              checkOutTime: DEFAULT_CHECK_OUT_TIME,
              idRequirement: "optional",
              documentRetentionDays: DEFAULT_RETENTION_DAYS,
            };
        return sessionOf(tenant);
      }),

    updateOwner: (input) =>
      respond(() => {
        const tenant = currentTenant();
        const { owner } = tenant;
        if (input.name !== undefined) {
          if (input.name.trim().length < 2) throw new ApiError("validation", "Name too short");
          owner.name = input.name.trim();
        }
        if (input.alternatePhone !== undefined) {
          if (!isValidE164(input.alternatePhone) || !isDifferentPhone(input.alternatePhone, owner.phone)) {
            throw new ApiError("validation", "Invalid alternate number");
          }
          owner.alternatePhone = input.alternatePhone;
        }
        if (input.email !== undefined) {
          if (!isValidEmail(input.email)) throw new ApiError("validation", "Invalid email");
          owner.email = input.email.trim().toLowerCase();
        }
        return owner;
      }),

    updateProperty: (input) =>
      respond(() => {
        const tenant = currentTenant();
        if (!tenant.property) throw new ApiError("unauthorized");
        if (
          (input.type !== undefined && !isPropertyType(input.type)) ||
          (input.state !== undefined && !isIndianStateCode(input.state)) ||
          (input.pincode !== undefined && !isValidPincode(input.pincode)) ||
          (input.city !== undefined && input.city.trim().length < 2) ||
          (input.gst !== undefined && !isValidPropertyGst(input.gst)) ||
          ((input.bookingMode !== undefined || input.roomCount !== undefined) &&
            !isValidInventory(
              input.bookingMode ?? tenant.property.bookingMode,
              input.roomCount === undefined ? tenant.property.roomCount : input.roomCount,
            ))
        ) {
          throw new ApiError("validation", "Invalid property details");
        }
        // The inventory can't shrink below what upcoming bookings already use.
        if (input.bookingMode !== undefined || input.roomCount !== undefined) {
          const mode = input.bookingMode ?? tenant.property.bookingMode;
          const rooms = input.roomCount === undefined ? tenant.property.roomCount : input.roomCount;
          const inUse = inventoryInUse(tenant.bookings.map(toInventoryBooking), todayISO());
          if (!usesRoomInventory(mode) ? inUse.hasRoomBookings : (rooms ?? 0) < inUse.minRooms) {
            throw new ApiError("unavailable", "inventory_in_use");
          }
        }
        Object.assign(
          tenant.property,
          Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)),
        );
        // Stored the way the certificate prints it.
        if (input.gst) tenant.property.gst = { gstin: normaliseGstin(input.gst.gstin), rate: input.gst.rate };
        // Entire-property mode keeps no room count.
        if (tenant.property.bookingMode === "entire") tenant.property.roomCount = null;
        if (input.documentRetentionDays !== undefined) {
          for (const document of tenant.documents) {
            const booking = tenant.bookings.find((item) => item.id === document.bookingId);
            if (booking) document.deleteOn = addDays(booking.checkOut, input.documentRetentionDays);
          }
        }
        return tenant.property;
      }),
  },

  bookings: {
    list: () =>
      respond(() => {
        const tenant = currentTenant();
        return tenant.bookings.map((booking) => toBookingRecord(tenant, booking));
      }),

    get: (bookingId) =>
      respond(() => {
        const tenant = currentTenant();
        return toBookingRecord(tenant, findBooking(tenant, bookingId));
      }),

    create: (input) =>
      respond(() => {
        assertBookingInput(input);
        const tenant = currentTenant();
        const property = tenant.property;
        if (!property) throw new ApiError("unauthorized");

        assertRoomsAvailable(tenant, input);
        const lead = resolveLeadGuest(tenant, input.lead);
        const booking: Booking = {
          id: newId("bk"),
          propertyId: property.id,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guestCount: input.guestCount,
          roomsBooked: input.roomsBooked,
          source: input.source,
          totalAmount: input.totalAmount,
          status: "confirmed",
          cancelledAt: null,
          createdAt: nowISO(),
          guests: [
            { guestId: lead.id, role: "lead", status: "pending", addedBy: null, addedAt: null, documentId: null },
          ],
          link: {
            token: newLinkToken(),
            status: "not_sent",
            expiresOn: input.checkOut,
            sentAt: null,
            openedAt: null,
            submittedAt: null,
          },
        };
        tenant.bookings.push(booking);

        if (input.initialPayment && input.initialPayment.amount > 0) {
          tenant.payments.push({
            id: newId("pay"),
            bookingId: booking.id,
            amount: input.initialPayment.amount,
            method: input.initialPayment.method,
            receivedOn: todayISO(),
            note: null,
            createdAt: nowISO(),
          });
        }
        return toBookingRecord(tenant, booking);
      }),

    update: (bookingId, input) =>
      respond(() => {
        assertBookingInput(input);
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        const added = booking.guests.filter((entry) => entry.status === "added").length;
        if (input.guestCount < added) throw new ApiError("validation", "guest_count_below_added");
        if (booking.status !== "cancelled") assertRoomsAvailable(tenant, { ...input, id: booking.id });

        Object.assign(booking, {
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guestCount: input.guestCount,
          roomsBooked: input.roomsBooked,
          source: input.source,
          totalAmount: input.totalAmount,
        });
        booking.link.expiresOn = input.checkOut;

        const leadEntry = booking.guests.find((entry) => entry.role === "lead");
        if (leadEntry) {
          const switching = input.lead.existingGuestId && input.lead.existingGuestId !== leadEntry.guestId;
          if (switching) {
            const previous = leadEntry.guestId;
            leadEntry.guestId = resolveLeadGuest(tenant, input.lead).id;
            pruneOrphanGuest(tenant, previous);
          } else {
            const guest = findGuest(tenant, leadEntry.guestId);
            guest.name = input.lead.name.trim();
            guest.phone = input.lead.phone;
          }
        }

        for (const document of tenant.documents) {
          if (document.bookingId === booking.id) document.deleteOn = addDays(booking.checkOut, retentionDays(tenant));
        }
        return toBookingRecord(tenant, booking);
      }),

    cancel: (bookingId) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        booking.status = "cancelled";
        booking.cancelledAt = nowISO();
        return toBookingRecord(tenant, booking);
      }),

    restore: (bookingId) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        // Its rooms may have been booked by someone else since it was cancelled.
        assertRoomsAvailable(tenant, booking);
        booking.status = "confirmed";
        booking.cancelledAt = null;
        return toBookingRecord(tenant, booking);
      }),

    markLinkShared: (bookingId) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        if (booking.link.status === "not_sent") booking.link.status = "sent";
        booking.link.sentAt = nowISO();
        return toBookingRecord(tenant, booking);
      }, [80, 160]),

    addGuest: (bookingId, input) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        upsertGuestOnBooking(tenant, booking, input, "owner");
        return toBookingRecord(tenant, booking);
      }),

    updateGuest: (bookingId, guestId, input) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        const entry = booking.guests.find((item) => item.guestId === guestId);
        if (!entry) throw new ApiError("not_found", "Guest not on this booking");

        const guest = findGuest(tenant, guestId);
        Object.assign(guest, { name: input.name.trim(), phone: input.phone, nationality: input.nationality });
        if (entry.status === "pending") {
          Object.assign(entry, { status: "added", addedBy: "owner", addedAt: nowISO() });
        }
        applyDocument(tenant, booking, entry, input.document, "owner");
        return toBookingRecord(tenant, booking);
      }),

    removeGuest: (bookingId, guestId) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        const entry = booking.guests.find((item) => item.guestId === guestId);
        if (!entry) throw new ApiError("not_found", "Guest not on this booking");
        if (entry.role === "lead") throw new ApiError("validation", "The lead guest cannot be removed");
        removeEntry(tenant, booking, entry);
        pruneOrphanGuest(tenant, guestId);
        return toBookingRecord(tenant, booking);
      }),
  },

  payments: {
    record: (bookingId, input) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        if (!(input.amount > 0)) throw new ApiError("validation", "Amount must be positive");
        tenant.payments.push({ id: newId("pay"), bookingId, ...input, createdAt: nowISO() });
        return toBookingRecord(tenant, booking);
      }),

    update: (bookingId, paymentId, input) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        const payment = tenant.payments.find((item) => item.id === paymentId && item.bookingId === bookingId);
        if (!payment) throw new ApiError("not_found", "Payment not found");
        Object.assign(payment, input);
        return toBookingRecord(tenant, booking);
      }),

    remove: (bookingId, paymentId) =>
      respond(() => {
        const tenant = currentTenant();
        const booking = findBooking(tenant, bookingId);
        tenant.payments = tenant.payments.filter((item) => !(item.id === paymentId && item.bookingId === bookingId));
        return toBookingRecord(tenant, booking);
      }),
  },

  invoices: {
    list: () =>
      respond(() => {
        const tenant = currentTenant();
        return tenant.invoices.map((invoice): InvoiceRecord => ({
          ...invoice,
          lastLink: lastLinkOf(tenant, invoice.id),
        }));
      }),

    issue: (input) =>
      respond(() => {
        const tenant = currentTenant();
        const property = tenant.property;
        if (!property) throw new ApiError("unauthorized");
        const booking = findBooking(tenant, input.bookingId);
        if (isCancelled(booking)) throw new ApiError("validation", "booking_cancelled");
        if (invoiceBlocker(booking)) throw new ApiError("validation", "booking_no_total");
        const choice = invoiceChoiceOf(tenant, input);

        // Replacing an issued document needs a reason, whether or not the number carries over.
        const replacing = tenant.invoices.some((item) => item.bookingId === booking.id && item.status === "issued");
        const revision = replacing ? revisionOf(input.revision) : null;

        // Everything below happens together, as one transaction would: snapshot, optional booking total, number.
        const record = toBookingRecord(tenant, booking);
        const snapshot = invoiceSnapshotOf({ property, owner: tenant.owner, booking: record, choice });
        if (!snapshot) throw new ApiError("validation", "booking_no_total");
        if (choice.kind === "tax_invoice" && choice.gstMode === "added" && choice.updateBookingTotal) {
          booking.totalAmount = snapshot.bookingTotal;
        }

        const issuedOn = todayISO();
        const { number, version } = numberForInvoice(
          tenant,
          booking.id,
          choice.kind,
          issuedOn,
          invoicePrefix(property.name),
        );
        for (const older of tenant.invoices) {
          if (older.bookingId === booking.id && older.status === "issued") older.status = "superseded";
        }
        const invoice: Invoice = {
          id: newId("inv"),
          bookingId: booking.id,
          kind: choice.kind,
          number,
          version,
          status: "issued",
          issuedOn,
          issuedAt: nowISO(),
          snapshot,
          revision,
        };
        tenant.invoices.push(invoice);
        return invoice;
      }),

    share: (invoiceId) =>
      respond(() => {
        const tenant = currentTenant();
        const invoice = tenant.invoices.find((item) => item.id === invoiceId);
        if (!invoice) throw new ApiError("not_found", "Document not found");
        // Only the current version is shared; a cancelled booking's document stays viewable but isn't sent.
        if (invoice.status !== "issued") throw new ApiError("validation", "invoice_superseded");
        if (isCancelled(findBooking(tenant, invoice.bookingId))) throw new ApiError("validation", "booking_cancelled");
        const createdAt = nowISO();
        const link: ReceiptLink = {
          token: newLinkToken(),
          invoiceId: invoice.id,
          createdAt,
          expiresAt: receiptLinkExpiry(createdAt),
        };
        tenant.receiptLinks.push(link);
        return { token: link.token, createdAt: link.createdAt, expiresAt: link.expiresAt };
      }),
  },

  guests: {
    list: () =>
      respond(() => {
        const tenant = currentTenant();
        const today = todayISO();
        return tenant.guests
          .map((guest) => summarizeGuest(tenant, guest, today))
          .filter((summary): summary is GuestSummary => summary !== null);
      }),

    get: (guestId) =>
      respond((): GuestProfile => {
        const tenant = currentTenant();
        const today = todayISO();
        const guest = findGuest(tenant, guestId);
        const summary = summarizeGuest(tenant, guest, today);
        if (!summary) throw new ApiError("not_found", "Guest has no stays");

        const stays = staysOf(tenant, guestId)
          .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
          .map((booking) => {
            const record = toBookingRecord(tenant, booking);
            const entry = record.guests.find((item) => item.guestId === guestId);
            const lead = record.guests.find((item) => item.role === "lead");
            return { booking: record, role: entry?.role ?? "companion", leadName: lead?.guest.name ?? "" };
          });

        const document =
          tenant.documents
            .filter((doc) => doc.guestId === guestId && doc.deleteOn >= today)
            .sort((a, b) => b.addedAt.localeCompare(a.addedAt))[0] ?? null;

        return {
          summary,
          stays,
          document,
          firstStayOn: stays.length ? stays[stays.length - 1].booking.checkIn : null,
          nights: stays
            .filter((stay) => stay.booking.checkIn <= today)
            .reduce((sum, stay) => sum + nightsOf(stay.booking), 0),
        };
      }),

    update: (guestId, input) =>
      respond(() => {
        const tenant = currentTenant();
        const guest = findGuest(tenant, guestId);
        Object.assign(guest, { name: input.name.trim(), phone: input.phone, nationality: input.nationality });
        return guest;
      }),
  },

  documents: {
    requestView: (documentId) =>
      respond(() => {
        const tenant = currentTenant();
        const document = tenant.documents.find((doc) => doc.id === documentId);
        if (!document) throw new ApiError("not_found", "Document not found");
        // A real backend issues a signed URL (< 60 s) and writes an audit entry here.
        return {
          url: `/mock/id-${document.type.replace("_", "-")}.svg`,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
        };
      }, [300, 600]),
  },

  guestLink: {
    open: (token) =>
      respond(() => {
        const found = store.findByLinkToken(token);
        if (!found) throw new ApiError("not_found", "Link not found");
        const { tenant, booking } = found;
        const opening = linkState(booking, todayISO()) === "active" && !isOwnerPreview(tenant);
        if (opening && (booking.link.status === "not_sent" || booking.link.status === "sent")) {
          booking.link.status = "opened";
          booking.link.openedAt = nowISO();
        }
        return toLinkView(tenant, booking);
      }, [350, 700]),

    submit: (token, input) =>
      respond(() => {
        const found = store.findByLinkToken(token);
        if (!found) throw new ApiError("not_found", "Link not found");
        const { tenant, booking } = found;
        if (linkState(booking, todayISO()) !== "active") throw new ApiError("link_unavailable");
        const [leadInput, ...companions] = input.guests;
        if (!leadInput) throw new ApiError("validation", "Lead guest required");
        // One form for the whole booking: everyone staying needs a name (phone and ID stay optional).
        // People the owner already added themselves count towards the total.
        const ownerAdded = booking.guests.filter(
          (entry) => entry.role === "companion" && entry.addedBy === "owner" && entry.status === "added",
        ).length;
        const named = input.guests.filter((guest) => guest.name.trim()).length;
        if (named + ownerAdded < booking.guestCount) throw new ApiError("validation", "Every guest needs a name");

        // Lead: update the person who booked. If their number matches a
        // returning guest, attach this stay to that person instead.
        const leadEntry = booking.guests.find((entry) => entry.role === "lead");
        if (leadEntry) {
          const returning = findGuestByPhone(tenant, leadInput.phone);
          const alreadyOnBooking = booking.guests.some((entry) => entry.guestId === returning?.id);
          if (returning && !alreadyOnBooking) {
            const placeholder = leadEntry.guestId;
            leadEntry.guestId = returning.id;
            pruneOrphanGuest(tenant, placeholder);
          }
          const guest = findGuest(tenant, leadEntry.guestId);
          Object.assign(guest, {
            name: leadInput.name.trim(),
            phone: leadInput.phone,
            nationality: leadInput.nationality,
          });
          Object.assign(leadEntry, { status: "added", addedBy: "guest", addedAt: nowISO() });
          applyDocument(tenant, booking, leadEntry, leadInput.document, "guest");
        }

        // Companions: replace what this link submitted before, keep owner entries.
        for (const entry of booking.guests.filter((item) => item.role === "companion" && item.addedBy === "guest")) {
          removeEntry(tenant, booking, entry);
          pruneOrphanGuest(tenant, entry.guestId);
        }
        for (const companion of companions) {
          upsertGuestOnBooking(tenant, booking, companion, "guest");
        }

        booking.link.status = "submitted";
        booking.link.submittedAt = nowISO();
        return toLinkView(tenant, booking);
      }, [700, 1100]),
  },

  receipts: {
    view: (token) =>
      respond(() => {
        const found = store.findByReceiptToken(token);
        if (!found) throw new ApiError("not_found", "Link not found");
        const { tenant, link, invoice } = found;
        if (isReceiptLinkExpired(link.expiresAt)) {
          return { status: "expired", propertyName: invoice.snapshot.property.name } as const;
        }
        const booking = tenant.bookings.find((item) => item.id === invoice.bookingId);
        return {
          status: "valid",
          kind: invoice.kind,
          number: invoice.number,
          version: invoice.version,
          issuedOn: invoice.issuedOn,
          // Anyone holding the link sees this, so the guest's number never leaves the server, not even
          // masked: the guest knows their own number, and the owner's copy still shows it masked.
          snapshot: { ...invoice.snapshot, guest: { ...invoice.snapshot.guest, phone: null } },
          cancelled: booking ? isCancelled(booking) : false,
          superseded: invoice.status === "superseded",
          expiresAt: link.expiresAt,
        } as const;
      }, [350, 700]),
  },
};

/** The owner opening their own link (preview) must not count as the guest opening it. */
function isOwnerPreview(tenant: Tenant): boolean {
  return readSessionPhone() === tenant.owner.phone;
}
