import type { BookingSource, IdDocumentType, IdRequirement, PaymentMethod } from "./types";

/** Display order for booking sources. Labels live in `@/content`. */
export const BOOKING_SOURCES: readonly BookingSource[] = [
  "airbnb",
  "booking_com",
  "makemytrip",
  "agoda",
  "direct",
  "referral",
  "walk_in",
  "other",
];

/** Sources where the platform usually collects the money. */
export const PLATFORM_SOURCES: ReadonlySet<BookingSource> = new Set(["airbnb", "booking_com", "makemytrip", "agoda"]);

export const PAYMENT_METHODS: readonly PaymentMethod[] = ["upi", "cash", "bank_transfer", "card", "platform", "other"];

export const ID_DOCUMENT_TYPES: readonly IdDocumentType[] = ["aadhaar", "passport", "driving_licence"];

export const ID_REQUIREMENTS: readonly IdRequirement[] = ["off", "optional", "required"];

/** Days after check-out before identity documents are deleted. */
export const RETENTION_OPTIONS: readonly number[] = [30, 90, 180, 365];
export const DEFAULT_RETENTION_DAYS = 365;

export const GUEST_COUNT = { min: 1, max: 30 } as const;
export const MAX_AMOUNT = 1_00_00_000; // ₹1 crore
export const NAME_LENGTH = { min: 2, max: 80 } as const;
export const PAYMENT_NOTE_MAX = 120;

/** Longest free-text reason when an issued receipt is corrected for "other". */
export const REVISION_NOTE_MAX = 120;

export const DEFAULT_CHECK_IN_TIME = "14:00";
export const DEFAULT_CHECK_OUT_TIME = "11:00";

export const DEFAULT_COUNTRY = "IN";
