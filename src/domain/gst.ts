/**
 * GST details of a property, for the tax invoices to come.
 *
 * Optional: a property is either not GST registered (`null`), or has a GSTIN and the rate it charges.
 * The GSTIN check is a format check on purpose (15 letters and digits). It does not verify the state
 * code or the checksum, so a mistyped but well-formed number passes; the owner copies it from their
 * GST certificate.
 */
export const GST_RATES = [5, 12, 18] as const;

export type GstRate = (typeof GST_RATES)[number];

export function isGstRate(value: unknown): value is GstRate {
  return typeof value === "number" && (GST_RATES as readonly number[]).includes(value);
}

export const GSTIN_LENGTH = 15;

const GSTIN_PATTERN = new RegExp(`^[0-9A-Z]{${GSTIN_LENGTH}}$`);

/** Trims, drops any spaces and upper-cases, so " 30abcde 1234f1z5 " compares and stores as typed on the certificate. */
export function normaliseGstin(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function isValidGstin(value: unknown): boolean {
  return typeof value === "string" && GSTIN_PATTERN.test(normaliseGstin(value));
}

export interface PropertyGst {
  gstin: string;
  rate: GstRate;
}

/** `null` (not GST registered) is valid; otherwise both the GSTIN and the rate must be. */
export function isValidPropertyGst(value: unknown): boolean {
  if (value === null) return true;
  if (typeof value !== "object") return false;
  const { gstin, rate } = value as Partial<PropertyGst>;
  return isValidGstin(gstin) && isGstRate(rate);
}
