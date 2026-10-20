import { COUNTRIES } from "@/domain/countries";
import type { PhoneE164 } from "@/domain/types";

export const INDIA_DIAL = "91";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Splits `+919352169357` into `{ dial: "91", national: "9352169357" }`. */
export function splitE164(phone: PhoneE164): { dial: string; national: string } {
  const digits = digitsOnly(phone);
  if (digits.startsWith(INDIA_DIAL) && digits.length === 12) {
    return { dial: INDIA_DIAL, national: digits.slice(2) };
  }
  // Longest matching prefix wins (e.g. 971 before 97).
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((country) => digits.startsWith(country.dial));
  if (!match) return { dial: "", national: digits };
  return { dial: match.dial, national: digits.slice(match.dial.length) };
}

function isValidNationalNumber(dial: string, national: string): boolean {
  const digits = digitsOnly(national);
  if (dial === INDIA_DIAL) return /^[6-9]\d{9}$/.test(digits);
  return digits.length >= 6 && digits.length <= 14;
}

export function isValidE164(phone: PhoneE164): boolean {
  const { dial, national } = splitE164(phone);
  return dial !== "" && isValidNationalNumber(dial, national);
}

function groupNational(dial: string, national: string): string {
  if (dial === INDIA_DIAL && national.length === 10) {
    return `${national.slice(0, 5)} ${national.slice(5)}`;
  }
  return national.replace(/(\d{3,4})(?=\d{3})/g, "$1 ").trim();
}

/** "+91 93521 69357" */
export function formatPhone(phone: PhoneE164): string {
  const { dial, national } = splitE164(phone);
  return dial ? `+${dial} ${groupNational(dial, national)}` : phone;
}

/**
 * Hides the middle of a number for list views: "+91 98••• •••10".
 * Keeps the first two and last two digits so the owner can still recognise it.
 */
export function maskPhone(phone: PhoneE164): string {
  const { dial, national } = splitE164(phone);
  const grouped = groupNational(dial, national);
  let digitIndex = 0;
  const lastVisibleFrom = national.length - 2;
  const masked = grouped.replace(/\d/g, (digit) => {
    const index = digitIndex++;
    return index < 2 || index >= lastVisibleFrom ? digit : "•";
  });
  return dial ? `+${dial} ${masked}` : masked;
}

/** Digits WhatsApp expects in `wa.me/<number>`. */
export function whatsappNumber(phone: PhoneE164): string {
  return digitsOnly(phone);
}

/** Formats national digits while typing: "93521 69357". */
export function formatNationalInput(dial: string, value: string): string {
  const digits = digitsOnly(value);
  if (dial === INDIA_DIAL) {
    const trimmed = digits.slice(0, 10);
    return trimmed.length > 5 ? `${trimmed.slice(0, 5)} ${trimmed.slice(5)}` : trimmed;
  }
  return digits.slice(0, 14);
}
