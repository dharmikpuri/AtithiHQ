/**
 * Core entities of AtithiHQ.
 *
 * These mirror the information model in the product architecture doc:
 * Owner → Property → Booking → Guest, plus Document, Guest link and Payment.
 * They are plain data (no methods) so the same shapes can travel over an API.
 */
import type { PropertyGst } from "./gst";
import type { GstBreakdown, InvoiceKind } from "./invoice";
import type { BookingMode } from "./inventory";
import type { PropertyType } from "./property-types";

export type { PropertyGst } from "./gst";
export type { BookingMode } from "./inventory";

export type { PropertyType } from "./property-types";

/** Calendar date without time, `YYYY-MM-DD`. */
export type ISODate = string;
/** Full timestamp, ISO 8601. */
export type ISODateTime = string;
/** Time of day, 24h `HH:mm`. */
export type TimeOfDay = string;
/** Phone number in E.164 format, e.g. `+919352169357`. */
export type PhoneE164 = string;
/** ISO 3166-1 alpha-2 country code, e.g. `IN`. */
export type CountryCode = string;
/** Whole rupees. The product does not track paise. */
export type Rupees = number;
/** Integer paise (1/100 of a rupee). Only receipts and tax invoices use it, where GST needs it. */
export type Paise = number;

export type BookingSource =
  "airbnb" | "booking_com" | "makemytrip" | "agoda" | "direct" | "referral" | "walk_in" | "other";

export type PaymentMethod = "upi" | "cash" | "bank_transfer" | "card" | "platform" | "other";

export type IdDocumentType = "aadhaar" | "passport" | "driving_licence";

/** Owner-configured rule for asking guests for photo ID. */
export type IdRequirement = "off" | "optional" | "required";

/** Who typed a piece of information in. */
export type EnteredBy = "guest" | "owner";

/** Code of an Indian state or union territory, e.g. `GA` for Goa. See `domain/indian-states.ts`. */
export type IndianStateCode = string;

/** The owner's acceptance of the Terms & Conditions and Privacy Policy. */
export interface Consent {
  /** Which version of the documents was accepted (`TERMS_VERSION`). */
  termsVersion: string;
  acceptedAt: ISODateTime;
}

export interface Owner {
  id: string;
  name: string;
  /** The verified mobile number the owner signs in with. */
  phone: PhoneE164;
  /** Second number to reach the owner. `null` until registration is complete. */
  alternatePhone: PhoneE164 | null;
  email: string | null;
  /** `null` until the owner accepts the terms during registration. */
  consent: Consent | null;
  createdAt: ISODateTime;
}

export interface Property {
  id: string;
  ownerId: string;
  /** Homestay, villa…; picks the property's illustration. */
  type: PropertyType;
  name: string;
  /** Area or locality, free text shown to guests, e.g. "Assagao". */
  location: string;
  /** The property's address (not the owner's). */
  city: string;
  state: IndianStateCode;
  /** Six-digit Indian PIN code. */
  pincode: string;
  checkInTime: TimeOfDay;
  checkOutTime: TimeOfDay;
  /** Rented as a whole, room by room, or both. See `domain/inventory.ts`. */
  bookingMode: BookingMode;
  /** Bookable rooms, as a quantity. `null` when rented only as a whole. */
  roomCount: number | null;
  /** GST details for tax invoices. `null` when the property is not GST registered. */
  gst: PropertyGst | null;
  idRequirement: IdRequirement;
  /** Days after check-out before identity documents are deleted. */
  documentRetentionDays: number;
}

/** A person. Stored once per property and reused across stays. */
export interface Guest {
  id: string;
  propertyId: string;
  name: string;
  phone: PhoneE164 | null;
  nationality: CountryCode;
  createdAt: ISODateTime;
}

/**
 * Identity document metadata. The full number is never stored —
 * only the last four characters.
 */
export interface IdDocument {
  id: string;
  guestId: string;
  bookingId: string;
  type: IdDocumentType;
  last4: string;
  hasImage: boolean;
  addedBy: EnteredBy;
  addedAt: ISODateTime;
  /** Scheduled deletion date (check-out + retention period). */
  deleteOn: ISODate;
}

export type BookingGuestRole = "lead" | "companion";

/**
 * A guest's place on a booking.
 * `pending` means we know the person (usually just the lead's name from
 * the owner) but their details have not been confirmed yet.
 */
export interface BookingGuest {
  guestId: string;
  role: BookingGuestRole;
  status: "pending" | "added";
  addedBy: EnteredBy | null;
  addedAt: ISODateTime | null;
  documentId: string | null;
}

export type GuestLinkStatus = "not_sent" | "sent" | "opened" | "submitted";

/** One link per booking. The person who booked fills in everyone. */
export interface GuestLink {
  token: string;
  status: GuestLinkStatus;
  /** The link stops working after check-out. */
  expiresOn: ISODate;
  sentAt: ISODateTime | null;
  openedAt: ISODateTime | null;
  submittedAt: ISODateTime | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: Rupees;
  method: PaymentMethod;
  receivedOn: ISODate;
  note: string | null;
  createdAt: ISODateTime;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  propertyId: string;
  checkIn: ISODate;
  checkOut: ISODate;
  guestCount: number;
  /**
   * Rooms taken, as a quantity (never which rooms). `null` when the booking is for the whole
   * property, which is always the case for properties rented only as a whole.
   */
  roomsBooked: number | null;
  source: BookingSource;
  /** Agreed total. `null` when the owner has not entered an amount yet. */
  totalAmount: Rupees | null;
  status: BookingStatus;
  cancelledAt: ISODateTime | null;
  createdAt: ISODateTime;
  guests: BookingGuest[];
  link: GuestLink;
}

/**
 * Everything a receipt or tax invoice shows, copied when it was issued.
 * Never updated afterwards: a changed booking gets a new version instead.
 */
export interface InvoiceSnapshot {
  property: {
    type: PropertyType;
    name: string;
    locality: string;
    city: string;
    state: IndianStateCode;
    pincode: string;
  };
  /** The owner's own contact details: shown in full. */
  owner: { name: string; phone: PhoneE164; email: string | null };
  /** Set on tax invoices only: the owner's GSTIN and the figures behind the GST line. */
  gst: { gstin: string; breakdown: GstBreakdown } | null;
  /** The lead guest. The phone is masked when shown. */
  guest: { name: string; phone: PhoneE164 | null };
  stay: {
    checkIn: ISODate;
    checkOut: ISODate;
    nights: number;
    guestCount: number;
    roomsBooked: number | null;
    /** False for properties rented only as a whole, where saying so adds nothing. */
    showRooms: boolean;
  };
  /** The booking's total as the document leaves it, to tell later changes apart. */
  bookingTotal: Rupees;
  /** What the document totals to. Whole rupees for receipts; tax invoices can have paise. */
  total: Paise;
  payments: { receivedOn: ISODate; method: PaymentMethod; amount: Rupees }[];
}

export type InvoiceStatus = "issued" | "superseded";

export const REVISION_REASON_CODES = [
  "booking_changed",
  "wrong_gst_rate",
  "wrong_gst_treatment",
  "wrong_document_type",
  "other",
] as const;
export type RevisionReasonCode = (typeof REVISION_REASON_CODES)[number];

/** Why the owner replaced an issued document. An internal audit note: never printed on the document. */
export interface InvoiceRevision {
  reason: RevisionReasonCode;
  /** Free text, only for "other". */
  note: string | null;
}

/** An issued receipt or tax invoice. A revision keeps the number and raises `version`. */
export interface Invoice {
  id: string;
  bookingId: string;
  kind: InvoiceKind;
  number: string;
  version: number;
  status: InvoiceStatus;
  issuedOn: ISODate;
  issuedAt: ISODateTime;
  snapshot: InvoiceSnapshot;
  /** Set when this document replaced an earlier one; `null` for a first document. */
  revision: InvoiceRevision | null;
}

/** A public link to one issued document. Every send makes a new one; older ones keep their own expiry. */
export interface ReceiptLink {
  token: string;
  invoiceId: string;
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
}
