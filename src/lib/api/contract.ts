/**
 * The API contract between the UI and the backend.
 *
 * Screens only ever talk to an object implementing `AtithiApi`.
 * Today that object is the browser-only mock (`@/lib/mock`). When the real
 * backend exists, implement this interface with HTTP calls and swap it in
 * `@/lib/api/index.ts` — no screen needs to change.
 */
import type { GstMode, InvoiceKind } from "@/domain/invoice";
import type { GstRate } from "@/domain/gst";
import type {
  BookingRecord,
  GuestLinkView,
  GuestProfile,
  GuestSummary,
  InvoiceRecord,
  ReceiptLinkView,
  Session,
} from "@/domain/read-models";
import type {
  BookingSource,
  CountryCode,
  Guest,
  IdDocumentType,
  IdRequirement,
  Invoice,
  InvoiceRevision,
  ISODate,
  ISODateTime,
  Owner,
  PaymentMethod,
  PhoneE164,
  BookingMode,
  IndianStateCode,
  PropertyType,
  PropertyGst,
  Property,
  Rupees,
  TimeOfDay,
} from "@/domain/types";

/* --------------------------------- Inputs --------------------------------- */

/** The owner's own details. The primary mobile number is not here: it is the verified sign-in number. */
export interface OwnerProfileInput {
  name: string;
  alternatePhone: PhoneE164;
  email: string;
}

/** The property's name and where it is. Separate from the owner's contact details. */
export interface PropertyBasicsInput {
  type: PropertyType;
  name: string;
  /** Area or locality shown to guests. */
  location: string;
  city: string;
  state: IndianStateCode;
  pincode: string;
}

/** How the property is rented. `roomCount` is a quantity, and `null` for `entire`. */
export interface InventoryInput {
  bookingMode: BookingMode;
  roomCount: number | null;
}

export interface ConsentInput {
  /** Must be true: registration can't complete without it. */
  accepted: boolean;
  termsVersion: string;
  /** When the owner ticked the box. */
  acceptedAt: string;
}

/** Everything the registration form sends, in one request. */
export interface RegistrationInput {
  owner: OwnerProfileInput;
  property: PropertyBasicsInput;
  inventory: InventoryInput;
  /** `null` when not GST registered. */
  gst: PropertyGst | null;
  consent: ConsentInput;
}

/** Owner profile edits from Settings. The sign-in number can't be changed here. */
export interface OwnerProfileUpdateInput {
  name?: string;
  alternatePhone?: PhoneE164;
  email?: string;
}

export interface PropertyUpdateInput {
  type?: PropertyType;
  name?: string;
  location?: string;
  city?: string;
  state?: IndianStateCode;
  pincode?: string;
  /** Change both together; the backend checks the pair. */
  bookingMode?: BookingMode;
  roomCount?: number | null;
  /** `null` clears the GST details (not registered). */
  gst?: PropertyGst | null;
  checkInTime?: TimeOfDay;
  checkOutTime?: TimeOfDay;
  idRequirement?: IdRequirement;
  documentRetentionDays?: number;
}

export interface LeadGuestInput {
  name: string;
  phone: PhoneE164 | null;
  /** Set when the owner picked a returning guest from suggestions. */
  existingGuestId: string | null;
}

export interface BookingInput {
  checkIn: ISODate;
  checkOut: ISODate;
  guestCount: number;
  /** Rooms to take (a quantity), or `null` for the whole property. Checked against availability. */
  roomsBooked: number | null;
  source: BookingSource;
  totalAmount: Rupees | null;
  lead: LeadGuestInput;
}

export interface CreateBookingInput extends BookingInput {
  /** Advance already received when the booking is recorded. */
  initialPayment: { amount: Rupees; method: PaymentMethod } | null;
}

export interface DocumentInput {
  type: IdDocumentType;
  /** Last four characters of the document number. Never the full number. */
  last4: string;
  hasImage: boolean;
}

export interface GuestDetailsInput {
  name: string;
  phone: PhoneE164 | null;
  nationality: CountryCode;
  /** `undefined` keeps the current document, `null` removes it. */
  document?: DocumentInput | null;
}

export interface PaymentInput {
  amount: Rupees;
  method: PaymentMethod;
  receivedOn: ISODate;
  note: string | null;
}

export interface GuestSubmissionInput {
  /**
   * The first entry is always the person who booked. The form covers the whole booking,
   * so every guest must be listed with at least a name; phone and ID are optional.
   */
  guests: GuestDetailsInput[];
}

/** Creates a receipt or tax invoice for a booking. The backend builds the snapshot and assigns the number. */
export interface IssueInvoiceInput {
  bookingId: string;
  kind: InvoiceKind;
  /** Tax invoices only: is GST inside the booking total, or charged on top of it? */
  gstMode?: GstMode;
  /** Tax invoices only. Defaults to the property's saved rate. */
  rate?: GstRate;
  /** Tax invoices with GST "added": make the booking total match the document total. */
  updateBookingTotal?: boolean;
  /** Required when this replaces an issued document. An internal note: never shown to guests. */
  revision?: InvoiceRevision;
}

/* --------------------------------- Errors --------------------------------- */

export type ApiErrorCode =
  | "unauthorized"
  | "not_found"
  | "invalid_code"
  | "validation"
  /** The rooms (or the whole property) aren't free for those dates, or bookings need them. */
  | "unavailable"
  | "link_unavailable"
  | "network"
  | "unknown";

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.code = code;
  }
}

export function isApiError(error: unknown, code?: ApiErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

/* -------------------------------- Contract -------------------------------- */

export interface AtithiApi {
  auth: {
    getSession(): Promise<Session | null>;
    /** Sends a one-time code by SMS. */
    requestCode(phone: PhoneE164): Promise<{ resendAfterSeconds: number }>;
    verifyCode(phone: PhoneE164, code: string): Promise<Session>;
    /**
     * Ends the session. `erase` is a testing aid of the demo build: it also deletes the signed-in
     * number's data so the number can start over. A real backend wouldn't offer this here
     * (account deletion would be its own audited flow).
     */
    logout(options?: { erase?: boolean }): Promise<void>;
  };

  account: {
    /** Finishes registration for the verified number. Rejects with `validation` if a rule fails. */
    completeRegistration(input: RegistrationInput): Promise<Session>;
    updateOwner(input: OwnerProfileUpdateInput): Promise<Owner>;
    updateProperty(input: PropertyUpdateInput): Promise<Property>;
  };

  bookings: {
    list(): Promise<BookingRecord[]>;
    get(bookingId: string): Promise<BookingRecord>;
    create(input: CreateBookingInput): Promise<BookingRecord>;
    update(bookingId: string, input: BookingInput): Promise<BookingRecord>;
    cancel(bookingId: string): Promise<BookingRecord>;
    restore(bookingId: string): Promise<BookingRecord>;
    /** Records that the owner shared the guest link. */
    markLinkShared(bookingId: string): Promise<BookingRecord>;
    addGuest(bookingId: string, input: GuestDetailsInput): Promise<BookingRecord>;
    updateGuest(bookingId: string, guestId: string, input: GuestDetailsInput): Promise<BookingRecord>;
    removeGuest(bookingId: string, guestId: string): Promise<BookingRecord>;
  };

  payments: {
    record(bookingId: string, input: PaymentInput): Promise<BookingRecord>;
    update(bookingId: string, paymentId: string, input: PaymentInput): Promise<BookingRecord>;
    remove(bookingId: string, paymentId: string): Promise<BookingRecord>;
  };

  invoices: {
    /** Every document of the property, including the superseded older versions, each with when it was last shared. */
    list(): Promise<InvoiceRecord[]>;
    /**
     * Issues a document for a booking, or an updated version of the one it has (same number, version + 1;
     * a new number from version 1 when it moves between the tax invoice and receipt series).
     * Rejects with `validation` when the booking is cancelled or has no total, the kind doesn't fit
     * the property's GST registration, or it replaces an issued document without a `revision`. When asked, the booking total is updated in the same step.
     */
    issue(input: IssueInvoiceInput): Promise<Invoice>;
    /**
     * Makes a fresh public link to an issued document, valid for `RECEIPT_LINK_HOURS`. Older links stay as
     * they are. Rejects with `validation` when the document is superseded or its booking is cancelled.
     * The client builds the full URL from the token (`receiptLinkUrl`), like the guest link.
     */
    share(invoiceId: string): Promise<{ token: string; createdAt: ISODateTime; expiresAt: ISODateTime }>;
  };

  guests: {
    list(): Promise<GuestSummary[]>;
    get(guestId: string): Promise<GuestProfile>;
    update(guestId: string, input: Pick<GuestDetailsInput, "name" | "phone" | "nationality">): Promise<Guest>;
  };

  documents: {
    /**
     * Issues a short-lived, audited link to view an identity document.
     * The backend must log every call.
     */
    requestView(documentId: string): Promise<{ url: string; expiresAt: string }>;
  };

  /** Public, unauthenticated endpoints used by the guest form. */
  guestLink: {
    open(token: string): Promise<GuestLinkView>;
    submit(token: string, input: GuestSubmissionInput): Promise<GuestLinkView>;
  };

  /** Public, unauthenticated endpoint behind the shared receipt page. */
  receipts: {
    /** The document, or `expired` with the property's name. Rejects with `not_found` for an unknown token. */
    view(token: string): Promise<ReceiptLinkView>;
  };
}
