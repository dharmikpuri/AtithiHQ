/**
 * Searching people and reading where a guest's stays stand.
 * Pure functions, so they can move to the server if lists ever get too long
 * to filter on the phone.
 */
import { isCurrent, stayPhase } from "@/domain/booking-rules";
import type { GuestSummary, StayReference } from "@/domain/read-models";
import type { Guest, ISODate } from "@/domain/types";
import { digitsOnly } from "@/lib/phone";

export const GUEST_SORTS = ["recent", "stays", "spend", "name"] as const;
export type GuestSort = (typeof GUEST_SORTS)[number];
export const DEFAULT_GUEST_SORT: GuestSort = "recent";

export function parseGuestSort(value: string | null): GuestSort {
  return GUEST_SORTS.find((sort) => sort === value) ?? DEFAULT_GUEST_SORT;
}

/** Lower case without accents, so "jose" finds "José". */
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Guest search: every typed word must appear in the name ("wilson emma" finds Emma Wilson),
 * or three or more typed digits must appear in the mobile number.
 * Used for primary guests and booking members alike.
 */
export function matchesPerson(guest: Pick<Guest, "name" | "phone">, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const digits = digitsOnly(trimmed);
  if (digits.length >= 3 && guest.phone && digitsOnly(guest.phone).includes(digits)) return true;
  const name = normalize(guest.name);
  return normalize(trimmed)
    .split(/\s+/)
    .every((word) => name.includes(word));
}

/** Where someone stands today, for the "last stay" line of a row. */
export type GuestStayState =
  | { kind: "current"; phase: "arriving" | "staying" | "departing"; stay: StayReference }
  | { kind: "past"; stay: StayReference }
  | { kind: "upcoming"; stay: StayReference }
  | { kind: "none" };

export function guestStayState(summary: GuestSummary, today: ISODate): GuestStayState {
  const { lastStay, nextStay } = summary;
  if (lastStay && isCurrent(lastStay, today)) {
    return {
      kind: "current",
      phase: stayPhase(lastStay, today) as "arriving" | "staying" | "departing",
      stay: lastStay,
    };
  }
  if (lastStay) return { kind: "past", stay: lastStay };
  if (nextStay) return { kind: "upcoming", stay: nextStay };
  return { kind: "none" };
}
