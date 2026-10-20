/**
 * Demo data for the mock backend.
 *
 * Every date is relative to "today", so the demo always has someone
 * arriving, someone staying and someone leaving — whatever day it is opened.
 * Sign in with the demo number to see it; any other number starts empty.
 */
import type {
  Booking,
  BookingGuest,
  BookingSource,
  EnteredBy,
  Guest,
  GuestLinkStatus,
  IdDocument,
  IdDocumentType,
  Invoice,
  ISODate,
  Owner,
  Payment,
  PaymentMethod,
  PhoneE164,
  Property,
  ReceiptLink,
} from "@/domain/types";
import {
  financialYearOf,
  formatInvoiceNumber,
  invoicePrefix,
  invoiceSnapshotOf,
  receiptLinkExpiry,
} from "@/domain/invoice";
import { TERMS_VERSION } from "@/domain/registration";
import { addDays, daysBetween } from "@/lib/dates";
import type { Tenant } from "./store";

export const DEMO_OWNER_PHONE: PhoneE164 = "+919352169357";
const PROPERTY_ID = "prop_sunrise";
const RETENTION_DAYS = 365;
/** A past, fully paid stay that already has its tax invoice (GST 12% included in the total). */
const INVOICED_BOOKING = "bk_thompson";
/** Demo links to that tax invoice for `/r/<token>`: one still working, one that has expired. */
const DEMO_RECEIPT_TOKENS = { valid: "rcpdemo7k2m", expired: "rcpold9x3q" } as const;

interface GuestSeed {
  id: string;
  name: string;
  phone?: PhoneE164;
  nationality?: string;
}

interface EntrySeed {
  guest: string;
  role?: BookingGuest["role"];
  /** Omit for a lead whose details have not arrived yet. */
  by?: EnteredBy;
  doc?: [IdDocumentType, string];
}

interface BookingSeed {
  id: string;
  token: string;
  /** Days from today. */
  checkIn: number;
  nights: number;
  guestCount: number;
  /** Rooms taken (Sunrise Villa has 6). Omit for a whole-villa booking. */
  rooms?: number;
  source: BookingSource;
  total: number | null;
  payments?: [amount: number, method: PaymentMethod, daysFromToday: number][];
  link: GuestLinkStatus;
  /** Days from today the link was sent / opened. */
  sentDay?: number;
  openedDay?: number;
  cancelledDay?: number;
  entries: EntrySeed[];
}

const GUESTS: GuestSeed[] = [
  { id: "g_emma", name: "Emma Wilson", phone: "+919820134510" },
  { id: "g_james", name: "James Wilson", phone: "+919820177821" },
  { id: "g_olivia", name: "Olivia Wilson" },
  { id: "g_lucas", name: "Lucas Martin", phone: "+919845012345" },
  { id: "g_mateo", name: "Mateo Garcia", phone: "+919822055512" },
  { id: "g_elena", name: "Elena Garcia", phone: "+919822055598" },
  { id: "g_lucia", name: "Lucia Garcia" },
  { id: "g_hannah", name: "Hannah Schmidt", phone: "+919884033221" },
  { id: "g_felix", name: "Felix Schmidt", phone: "+919884033290" },
  { id: "g_sofia", name: "Sofia Marino", phone: "+393471234567", nationality: "IT" },
  { id: "g_luca", name: "Luca Marino", nationality: "IT" },
  { id: "g_giulia", name: "Giulia Romano", phone: "+393479876543", nationality: "IT" },
  { id: "g_noah", name: "Noah Anderson", phone: "+919811045678" },
  { id: "g_chloe", name: "Chloe Dubois", phone: "+919825067890" },
  { id: "g_hugo", name: "Hugo Dubois" },
  { id: "g_mia", name: "Mia Jensen", phone: "+919910023456" },
  { id: "g_oscar", name: "Oscar Jensen" },
  { id: "g_daniel", name: "Daniel Clarke", phone: "+447700900123", nationality: "GB" },
  { id: "g_liam", name: "Liam Murphy", phone: "+919829034567" },
  { id: "g_grace", name: "Grace Murphy" },
  { id: "g_ella", name: "Ella Murphy" },
  { id: "g_jack", name: "Jack Murphy" },
  { id: "g_ava", name: "Ava Thompson", phone: "+919898011223" },
  { id: "g_ethan", name: "Ethan Thompson" },
  { id: "g_leo", name: "Leo Fischer", phone: "+919560012345" },
  { id: "g_lars", name: "Lars de Vries", phone: "+919820099887" },
  { id: "g_sanne", name: "Sanne de Vries", phone: "+919820099812" },
  { id: "g_lotte", name: "Lotte de Vries" },
  { id: "g_daan", name: "Daan de Vries" },
  { id: "g_noor", name: "Noor de Vries" },
  { id: "g_isabella", name: "Isabella Costa", phone: "+919444012345" },
  { id: "g_rafael", name: "Rafael Costa" },
  { id: "g_ryan", name: "Ryan Mitchell", phone: "+919867012345" },
  { id: "g_sarah", name: "Sarah Mitchell" },
  { id: "g_henry", name: "Henry Wilson" },
  { id: "g_camille", name: "Camille Dubois", phone: "+919825067812" },
  { id: "g_louis", name: "Louis Dubois" },
  { id: "g_manon", name: "Manon Lefevre", phone: "+919825067845" },
  { id: "g_theo", name: "Theo Lefevre" },
  { id: "g_ines", name: "Ines Costa" },
];

const BOOKINGS: BookingSeed[] = [
  // ── Today ──────────────────────────────────────────────────────────────
  {
    id: "bk_emma",
    token: "q7k2mxa4pr",
    checkIn: 0,
    nights: 3,
    guestCount: 4,
    rooms: 2,
    source: "airbnb",
    total: 25000,
    payments: [
      [10000, "platform", -21],
      [10000, "upi", -4],
    ],
    link: "submitted",
    sentDay: -6,
    openedDay: -2,
    entries: [
      { guest: "g_emma", by: "guest", doc: ["aadhaar", "4321"] },
      { guest: "g_james", role: "companion", by: "guest" },
      { guest: "g_olivia", role: "companion", by: "guest" },
      { guest: "g_henry", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_lucas",
    token: "h3n8wcx2ar",
    checkIn: 0,
    nights: 2,
    guestCount: 2,
    rooms: 1,
    source: "direct",
    total: 12000,
    payments: [[12000, "upi", -12]],
    link: "not_sent",
    entries: [{ guest: "g_lucas" }],
  },
  {
    id: "bk_garcia",
    token: "z5t9pke3jf",
    checkIn: -1,
    nights: 3,
    guestCount: 3,
    rooms: 2,
    source: "booking_com",
    total: 21000,
    payments: [[21000, "platform", -15]],
    link: "submitted",
    sentDay: -8,
    openedDay: -7,
    entries: [
      { guest: "g_mateo", by: "guest", doc: ["aadhaar", "7782"] },
      { guest: "g_elena", role: "companion", by: "guest", doc: ["aadhaar", "1190"] },
      { guest: "g_lucia", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_schmidt",
    token: "m2r6vbn8ki",
    checkIn: -2,
    nights: 2,
    guestCount: 2,
    rooms: 1,
    source: "makemytrip",
    total: 14000,
    payments: [[10500, "platform", -20]],
    link: "submitted",
    sentDay: -9,
    openedDay: -9,
    entries: [
      { guest: "g_hannah", by: "guest", doc: ["driving_licence", "5521"] },
      { guest: "g_felix", role: "companion", by: "guest", doc: ["aadhaar", "6634"] },
    ],
  },
  // ── Upcoming ───────────────────────────────────────────────────────────
  {
    id: "bk_sofia",
    token: "c8w4jty6sm",
    checkIn: 5,
    nights: 3,
    guestCount: 3,
    rooms: 2,
    source: "referral",
    total: 27000,
    payments: [[13500, "bank_transfer", -9]],
    link: "submitted",
    sentDay: -10,
    openedDay: -10,
    entries: [
      { guest: "g_sofia", by: "guest", doc: ["passport", "8841"] },
      { guest: "g_luca", role: "companion", by: "guest", doc: ["passport", "3307"] },
      { guest: "g_giulia", role: "companion", by: "guest", doc: ["passport", "7719"] },
    ],
  },
  {
    id: "bk_noah",
    token: "f6y3qnd7rk",
    checkIn: 9,
    nights: 2,
    guestCount: 2,
    rooms: 1,
    source: "direct",
    total: null,
    link: "sent",
    sentDay: -1,
    entries: [{ guest: "g_noah" }],
  },
  {
    id: "bk_dubois",
    token: "u4b7xse9ms",
    checkIn: 14,
    nights: 4,
    guestCount: 6,
    source: "airbnb",
    total: 48000,
    payments: [[48000, "platform", -30]],
    link: "submitted",
    sentDay: -5,
    openedDay: -3,
    entries: [
      { guest: "g_chloe", by: "guest", doc: ["aadhaar", "9902"] },
      { guest: "g_hugo", role: "companion", by: "guest" },
      { guest: "g_camille", role: "companion", by: "guest" },
      { guest: "g_louis", role: "companion", by: "guest" },
      { guest: "g_manon", role: "companion", by: "guest" },
      { guest: "g_theo", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_mia",
    token: "p9e2kwm5ag",
    checkIn: 21,
    nights: 2,
    guestCount: 2,
    rooms: 1,
    source: "direct",
    total: 15000,
    payments: [[5000, "upi", -3]],
    link: "not_sent",
    entries: [{ guest: "g_mia" }],
  },
  {
    id: "bk_daniel",
    token: "t3h8rvc4dc",
    checkIn: 33,
    nights: 7,
    guestCount: 2,
    source: "agoda",
    total: 38000,
    link: "not_sent",
    entries: [{ guest: "g_daniel" }],
  },
  // ── Past ───────────────────────────────────────────────────────────────
  {
    id: "bk_murphy",
    token: "w7n2bfx6vs",
    checkIn: -9,
    nights: 4,
    guestCount: 4,
    source: "walk_in",
    total: 22000,
    payments: [
      [10000, "cash", -9],
      [10000, "upi", -5],
    ],
    link: "not_sent",
    entries: [
      { guest: "g_liam", by: "owner", doc: ["aadhaar", "2210"] },
      { guest: "g_grace", role: "companion", by: "owner", doc: ["aadhaar", "4471"] },
      { guest: "g_ella", role: "companion", by: "owner" },
      { guest: "g_jack", role: "companion", by: "owner" },
    ],
  },
  {
    id: "bk_thompson",
    token: "e5k9mtz3np",
    checkIn: -20,
    nights: 3,
    guestCount: 2,
    source: "airbnb",
    total: 16500,
    payments: [[16500, "platform", -40]],
    link: "submitted",
    sentDay: -26,
    openedDay: -25,
    entries: [
      { guest: "g_ava", by: "guest", doc: ["aadhaar", "3381"] },
      { guest: "g_ethan", role: "companion", by: "guest", doc: ["aadhaar", "9020"] },
    ],
  },
  {
    id: "bk_leo",
    token: "r2x6hpw8av",
    checkIn: -25,
    nights: 2,
    guestCount: 3,
    source: "direct",
    total: 9000,
    link: "sent",
    sentDay: -34,
    cancelledDay: -30,
    entries: [{ guest: "g_leo" }],
  },
  {
    id: "bk_devries",
    token: "j8c3vnq5rd",
    checkIn: -40,
    nights: 4,
    guestCount: 5,
    source: "makemytrip",
    total: 30000,
    payments: [[30000, "platform", -55]],
    link: "submitted",
    sentDay: -47,
    openedDay: -46,
    entries: [
      { guest: "g_lars", by: "guest", doc: ["aadhaar", "1844"] },
      { guest: "g_sanne", role: "companion", by: "guest", doc: ["aadhaar", "5079"] },
      { guest: "g_lotte", role: "companion", by: "guest" },
      { guest: "g_daan", role: "companion", by: "guest" },
      { guest: "g_noor", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_costa",
    token: "y4m9bkr2ln",
    checkIn: -60,
    nights: 3,
    guestCount: 3,
    source: "referral",
    total: 19500,
    payments: [
      [9500, "upi", -70],
      [10000, "cash", -60],
    ],
    link: "submitted",
    sentDay: -66,
    openedDay: -64,
    entries: [
      { guest: "g_isabella", by: "guest", doc: ["aadhaar", "6620"] },
      { guest: "g_rafael", role: "companion", by: "guest" },
      { guest: "g_ines", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_mia_old",
    token: "k6t2xwe9ao",
    checkIn: -150,
    nights: 3,
    guestCount: 2,
    source: "direct",
    total: 12000,
    payments: [[12000, "upi", -152]],
    link: "submitted",
    sentDay: -156,
    openedDay: -155,
    entries: [
      { guest: "g_mia", by: "guest", doc: ["aadhaar", "8090"] },
      { guest: "g_oscar", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_mitchell",
    token: "b9v5nqc3sk",
    checkIn: -200,
    nights: 4,
    guestCount: 4,
    source: "booking_com",
    total: 26000,
    payments: [[26000, "platform", -215]],
    link: "not_sent",
    entries: [
      { guest: "g_ryan", by: "owner", doc: ["aadhaar", "5567"] },
      { guest: "g_sarah", role: "companion", by: "owner" },
    ],
  },
  {
    id: "bk_garcia_old",
    token: "n3w8kda6jo",
    checkIn: -280,
    nights: 4,
    guestCount: 3,
    source: "direct",
    total: 20000,
    payments: [[20000, "bank_transfer", -285]],
    link: "submitted",
    sentDay: -288,
    openedDay: -287,
    entries: [
      { guest: "g_mateo", by: "guest", doc: ["aadhaar", "7782"] },
      { guest: "g_elena", role: "companion", by: "guest" },
      { guest: "g_lucia", role: "companion", by: "guest" },
    ],
  },
  {
    id: "bk_emma_old",
    token: "s5q9rmh2pd",
    checkIn: -330,
    nights: 3,
    guestCount: 3,
    source: "direct",
    total: 18500,
    payments: [[18500, "upi", -335]],
    link: "submitted",
    sentDay: -338,
    openedDay: -337,
    entries: [
      { guest: "g_emma", by: "guest", doc: ["aadhaar", "4321"] },
      { guest: "g_james", role: "companion", by: "guest" },
      { guest: "g_olivia", role: "companion", by: "guest" },
    ],
  },
];

/** Midday timestamp `days` from today — stable and readable in the UI. */
function at(today: ISODate, days: number, hour = 12): string {
  const date = new Date(`${addDays(today, days)}T00:00:00`);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function createDemoTenant(today: ISODate): Tenant {
  const property: Property = {
    id: PROPERTY_ID,
    ownerId: "own_oliver",
    type: "villa",
    name: "Sunrise Villa",
    // Locality, then the town that owns the PIN code: Assagao is a village served by Mapusa 403507.
    location: "Assagao",
    city: "Mapusa",
    state: "GA",
    pincode: "403507",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    // Sunrise Villa is let as a whole or room by room: 6 bookable rooms.
    bookingMode: "both",
    roomCount: 6,
    // GST registered, so tax invoices can be demoed.
    gst: { gstin: "30ABCDE1234F1Z5", rate: 12 },
    idRequirement: "optional",
    documentRetentionDays: RETENTION_DAYS,
  };

  const guests: Guest[] = GUESTS.map((seed) => ({
    id: seed.id,
    propertyId: PROPERTY_ID,
    name: seed.name,
    phone: seed.phone ?? null,
    nationality: seed.nationality ?? "IN",
    createdAt: at(today, -400),
  }));

  const bookings: Booking[] = [];
  const payments: Payment[] = [];
  const documents: IdDocument[] = [];

  for (const seed of BOOKINGS) {
    const checkIn = addDays(today, seed.checkIn);
    const checkOut = addDays(checkIn, seed.nights);
    const earliestPaymentDay = Math.min(0, ...(seed.payments ?? []).map(([, , day]) => day));
    const createdDay = Math.min(seed.checkIn - 12, (seed.sentDay ?? 0) - 1, earliestPaymentDay - 1);
    const submittedAt = seed.link === "submitted" ? at(today, seed.openedDay ?? seed.sentDay ?? -1, 18) : null;

    const entries: BookingGuest[] = seed.entries.map((entry) => {
      const addedAt = entry.by
        ? entry.by === "guest" && submittedAt
          ? submittedAt
          : at(today, seed.checkIn, 15)
        : null;
      let documentId: string | null = null;
      if (entry.doc && entry.by) {
        documentId = `doc_${seed.id}_${entry.guest}`;
        documents.push({
          id: documentId,
          guestId: entry.guest,
          bookingId: seed.id,
          type: entry.doc[0],
          last4: entry.doc[1],
          hasImage: true,
          addedBy: entry.by,
          addedAt: addedAt ?? at(today, seed.checkIn),
          deleteOn: addDays(checkOut, RETENTION_DAYS),
        });
      }
      return {
        guestId: entry.guest,
        role: entry.role ?? "lead",
        status: entry.by ? "added" : "pending",
        addedBy: entry.by ?? null,
        addedAt,
        documentId,
      };
    });

    bookings.push({
      id: seed.id,
      propertyId: PROPERTY_ID,
      checkIn,
      checkOut,
      guestCount: seed.guestCount,
      roomsBooked: seed.rooms ?? null,
      source: seed.source,
      totalAmount: seed.total,
      status: seed.cancelledDay !== undefined ? "cancelled" : "confirmed",
      cancelledAt: seed.cancelledDay !== undefined ? at(today, seed.cancelledDay) : null,
      createdAt: at(today, createdDay, 10),
      guests: entries,
      link: {
        token: seed.token,
        status: seed.link,
        expiresOn: checkOut,
        sentAt: seed.sentDay !== undefined ? at(today, seed.sentDay, 11) : null,
        openedAt: seed.openedDay !== undefined ? at(today, seed.openedDay, 17) : null,
        submittedAt,
      },
    });

    seed.payments?.forEach(([amount, method, day], index) => {
      payments.push({
        id: `pay_${seed.id}_${index}`,
        bookingId: seed.id,
        amount,
        method,
        receivedOn: addDays(today, Math.min(day, 0)),
        note: null,
        createdAt: at(today, Math.min(day, 0), 13),
      });
    });
  }

  const owner: Owner = {
    id: "own_oliver",
    name: "Oliver Bennett",
    phone: DEMO_OWNER_PHONE,
    alternatePhone: "+919812345678",
    email: "oliver@sunrisevilla.in",
    consent: { termsVersion: TERMS_VERSION, acceptedAt: at(today, -420) },
    createdAt: at(today, -420),
  };

  // Issued on the check-out date, and numbered as the backend would: the first tax invoice of its year.
  const invoiced = bookings.find((booking) => booking.id === INVOICED_BOOKING);
  const invoices: Invoice[] = [];
  if (invoiced && property.gst) {
    const snapshot = invoiceSnapshotOf({
      property,
      owner,
      booking: {
        ...invoiced,
        guests: invoiced.guests.map((entry) => ({
          ...entry,
          guest: guests.find((guest) => guest.id === entry.guestId)!,
          document: documents.find((document) => document.id === entry.documentId) ?? null,
        })),
        payments: payments.filter((payment) => payment.bookingId === invoiced.id),
      },
      choice: { kind: "tax_invoice", gstMode: "included", rate: property.gst.rate, updateBookingTotal: false },
    });
    if (snapshot) {
      invoices.push({
        id: "inv_thompson",
        bookingId: invoiced.id,
        kind: "tax_invoice",
        number: formatInvoiceNumber(invoicePrefix(property.name), "tax_invoice", financialYearOf(invoiced.checkOut), 1),
        version: 1,
        status: "issued",
        issuedOn: invoiced.checkOut,
        issuedAt: at(today, daysBetween(today, invoiced.checkOut), 11),
        snapshot,
        revision: null,
      });
    }
  }

  // Shared on WhatsApp 2 hours ago (46 hours left), and once more 3 days ago (long expired).
  const receiptLinks: ReceiptLink[] = invoices.flatMap((invoice) => [
    link(invoice.id, DEMO_RECEIPT_TOKENS.valid, 2),
    link(invoice.id, DEMO_RECEIPT_TOKENS.expired, 72),
  ]);

  return { owner, property, guests, bookings, payments, documents, invoices, receiptLinks };
}

/** A receipt link made `hoursAgo` hours before now, expiring the way real ones do. */
function link(invoiceId: string, token: string, hoursAgo: number): ReceiptLink {
  const createdAt = new Date(Date.now() - hoursAgo * 3_600_000).toISOString();
  return { token, invoiceId, createdAt, expiresAt: receiptLinkExpiry(createdAt) };
}
