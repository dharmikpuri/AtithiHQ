/**
 * Owner registration rules: what a complete registration needs, and where an owner
 * stands. Shared by the forms, the route guards and the mock backend, so the rules
 * are written once. A real backend must enforce the same rules on its side.
 */
import { isIndianStateCode } from "./indian-states";
import { isValidInventory } from "./inventory";
import { isPropertyType } from "./property-types";
import type { Session } from "./read-models";
import type { Owner, PhoneE164, Property } from "./types";

/** Version of the Terms & Conditions and Privacy Policy the owner accepts. Bump when they change. */
export const TERMS_VERSION = "draft-2026-10";

/** Six digits, not starting with 0. */
const PINCODE_PATTERN = /^[1-9]\d{5}$/;
/** Pragmatic email check: something@something.tld, no spaces. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidPincode(value: string): boolean {
  return PINCODE_PATTERN.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** The alternate number must be a different number from the verified one. */
export function isDifferentPhone(alternate: PhoneE164, primary: PhoneE164): boolean {
  return alternate !== primary;
}

/**
 * Where an owner is in the journey:
 * - `unverified`: no verified mobile number (signed out).
 * - `incomplete`: verified, but the registration form or the consent is missing.
 * - `complete`: may use the dashboard.
 */
export type RegistrationStatus = "unverified" | "incomplete" | "complete";

function isOwnerProfileComplete(owner: Owner): boolean {
  return Boolean(owner.name.trim() && owner.alternatePhone && owner.email && owner.consent);
}

function isPropertyBasicsComplete(property: Property | null): property is Property {
  return Boolean(
    property &&
    isPropertyType(property.type) &&
    property.name.trim() &&
    property.location.trim() &&
    property.city.trim() &&
    isIndianStateCode(property.state) &&
    isValidPincode(property.pincode) &&
    isValidInventory(property.bookingMode, property.roomCount),
  );
}

export function registrationStatus(session: Session | null | undefined): RegistrationStatus {
  if (!session) return "unverified";
  return isOwnerProfileComplete(session.owner) && isPropertyBasicsComplete(session.property)
    ? "complete"
    : "incomplete";
}
