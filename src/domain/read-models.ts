/**
 * Read models: the shapes screens receive from the API.
 * They join entities together so a screen never has to stitch records itself.
 */
import type { InvoiceKind } from "./invoice";
import type {
  Booking,
  BookingGuest,
  Guest,
  IdDocument,
  IdRequirement,
  Invoice,
  InvoiceSnapshot,
  ISODate,
  ISODateTime,
  Owner,
  Payment,
  PhoneE164,
  Property,
  PropertyType,
  Rupees,
  TimeOfDay,
} from "./types";

export interface BookingGuestDetails extends BookingGuest {
  guest: Guest;
  document: IdDocument | null;
}

/** A booking with its guests, documents and payments resolved. */
export interface BookingRecord extends Omit<Booking, "guests"> {
  guests: BookingGuestDetails[];
  payments: Payment[];
}

export interface StayReference {
  bookingId: string;
  checkIn: ISODate;
  checkOut: ISODate;
}

/** One row of the guest list. */
export interface GuestSummary {
  guest: Guest;
  /** Stays on non-cancelled bookings, including upcoming ones. */
  stayCount: number;
  /** Money received on bookings this guest made. */
  totalSpent: Rupees;
  lastStay: StayReference | null;
  nextStay: StayReference | null;
}

export interface GuestStay {
  booking: BookingRecord;
  role: BookingGuest["role"];
  leadName: string;
}

export interface GuestProfile {
  summary: GuestSummary;
  stays: GuestStay[];
  /** Most recent identity document still on file, if any. */
  document: IdDocument | null;
  firstStayOn: ISODate | null;
  nights: number;
}

export interface Session {
  owner: Owner;
  /** `null` until first-time setup is complete. */
  property: Property | null;
}

/**
 * What a guest sees when opening the booking link.
 * Deliberately narrow: no payments, no other bookings, no owner data
 * beyond what a guest needs to recognise the stay.
 */
export interface GuestLinkView {
  token: string;
  state: "active" | "expired" | "cancelled";
  property: {
    /** Picks the illustration on the guest's welcome screen. */
    type: PropertyType;
    name: string;
    location: string;
    hostName: string;
    hostPhone: PhoneE164;
    checkInTime: TimeOfDay;
    checkOutTime: TimeOfDay;
    idRequirement: IdRequirement;
    documentRetentionDays: number;
  };
  stay: {
    checkIn: ISODate;
    checkOut: ISODate;
    guestCount: number;
    /**
     * What the guest has booked, for display only: a number of rooms, or the whole property.
     * `null` when the property is only ever rented as a whole (nothing to say).
     */
    booked: { kind: "rooms"; count: number } | { kind: "whole" } | null;
  };
  lead: { name: string; phone: PhoneE164 | null };
  /** Guests this link has already submitted, so a returning visitor can edit. */
  submittedGuests: GuestLinkSubmittedGuest[];
  submittedAt: string | null;
}

export interface GuestLinkSubmittedGuest {
  name: string;
  phone: PhoneE164 | null;
  nationality: string;
  role: BookingGuest["role"];
  document: Pick<IdDocument, "type" | "last4"> | null;
}

/** A document as the owner's screens read it: with when it was last shared, if ever. */
export interface InvoiceRecord extends Invoice {
  /** The newest public link made for this document, or `null` when it was never shared. */
  lastLink: { createdAt: ISODateTime; expiresAt: ISODateTime } | null;
}

/**
 * What the public receipt page at `/r/<token>` gets. Deliberately narrow: no ids, and nothing
 * beyond what the document itself shows. An expired link shows no document, only whom to ask.
 */
export type ReceiptLinkView =
  | {
      status: "valid";
      kind: InvoiceKind;
      number: string;
      version: number;
      issuedOn: ISODate;
      snapshot: InvoiceSnapshot;
      /** The booking was cancelled since the document was issued. */
      cancelled: boolean;
      /** A newer version was issued after this one. */
      superseded: boolean;
      expiresAt: ISODateTime;
    }
  | { status: "expired"; propertyName: string };
