/**
 * Room availability: how much of a property's inventory is free for some dates.
 *
 * Pure functions with plain inputs and outputs, so the same shapes can later come from a
 * backend availability service. Rules:
 * - Inventory is a quantity of rooms. A booking takes `rooms` of them, or the whole property
 *   (`rooms: null`), which takes every room.
 * - Two stays clash only if they share a night: a booking's check-out day is free for a new
 *   check-in (check-out is in the morning, check-in in the afternoon).
 * - Cancelled bookings release their rooms.
 * - What counts is the busiest night in the requested range, not the sum over the range:
 *   3 rooms on Monday and 3 different rooms on Wednesday still leave 3 free across both.
 * - `entire` properties have no room count: any overlap means the property is taken.
 */
import { usesRoomInventory, type RoomInventory } from "./inventory";
import type { ISODate } from "./types";

/** A booking as availability sees it. */
export interface InventoryBooking {
  id: string;
  checkIn: ISODate;
  checkOut: ISODate;
  /** Rooms taken (a quantity), or `null` for the whole property. */
  rooms: number | null;
  cancelled: boolean;
}

export interface AvailabilityRequest {
  inventory: RoomInventory;
  bookings: readonly InventoryBooking[];
  checkIn: ISODate;
  checkOut: ISODate;
  /** Editing a booking: leave it out, so it doesn't compete with itself. */
  excludeBookingId?: string;
}

export interface Availability {
  /** `null` for `entire` properties. */
  totalRooms: number | null;
  /** Rooms already taken on the busiest night of the range. */
  bookedRooms: number;
  /** Rooms still free on every night of the range. */
  remainingRooms: number;
  /** An existing whole-property booking shares at least one night. */
  wholeBooked: boolean;
  /** Ids of the active bookings that share a night with the range. */
  overlappingIds: string[];
  /** A whole-property booking would fit (nothing else on those nights). */
  canBookWhole: boolean;
}

/** The stay a new or edited booking asks for: some rooms, or the whole property. */
export type RoomRequest = { kind: "rooms"; count: number } | { kind: "whole" };

export type RoomRequestProblem =
  "rooms_required" | "rooms_unavailable" | "too_many_rooms" | "whole_not_offered" | "whole_unavailable";

/* ── Dates (ISO `YYYY-MM-DD`, compared as UTC days) ─────────────────────────── */

function nextDay(date: ISODate): ISODate {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

/** Nights of a stay: each date from check-in up to, not including, check-out. */
function nightsOf(checkIn: ISODate, checkOut: ISODate): ISODate[] {
  const nights: ISODate[] = [];
  for (let night = checkIn; night < checkOut; night = nextDay(night)) nights.push(night);
  return nights;
}

/** True when two stays share at least one night. */
function sharesNight(a: { checkIn: ISODate; checkOut: ISODate }, b: { checkIn: ISODate; checkOut: ISODate }) {
  return a.checkIn < b.checkOut && b.checkIn < a.checkOut;
}

/** Rooms taken on each night by the given bookings. A whole-property booking takes them all. */
function nightlyLoad(bookings: readonly InventoryBooking[], totalRooms: number): Map<ISODate, number> {
  const load = new Map<ISODate, number>();
  for (const booking of bookings) {
    const rooms = booking.rooms ?? totalRooms;
    for (const night of nightsOf(booking.checkIn, booking.checkOut)) {
      load.set(night, Math.min(totalRooms, (load.get(night) ?? 0) + rooms));
    }
  }
  return load;
}

/* ── Availability ───────────────────────────────────────────────────────────── */

export function availabilityFor({
  inventory,
  bookings,
  checkIn,
  checkOut,
  excludeBookingId,
}: AvailabilityRequest): Availability {
  const range = { checkIn, checkOut };
  const active = bookings.filter(
    (booking) => !booking.cancelled && booking.id !== excludeBookingId && sharesNight(booking, range),
  );
  const overlappingIds = active.map((booking) => booking.id);
  const wholeBooked = active.some((booking) => booking.rooms === null);

  if (!usesRoomInventory(inventory.mode) || inventory.totalRooms === null) {
    return {
      totalRooms: null,
      bookedRooms: 0,
      remainingRooms: 0,
      wholeBooked: active.length > 0,
      overlappingIds,
      canBookWhole: active.length === 0,
    };
  }

  const total = inventory.totalRooms;
  const load = nightlyLoad(active, total);
  const bookedRooms = Math.max(0, ...nightsOf(checkIn, checkOut).map((night) => load.get(night) ?? 0));
  return {
    totalRooms: total,
    bookedRooms,
    remainingRooms: Math.max(0, total - bookedRooms),
    wholeBooked,
    overlappingIds,
    canBookWhole: inventory.mode === "both" && bookedRooms === 0,
  };
}

/**
 * Whether a request fits. `null` means it does. `entire` properties are not checked here:
 * their bookings keep today's behaviour (an overlap is shown as a warning, not blocked).
 */
export function checkRoomRequest(
  inventory: RoomInventory,
  availability: Availability,
  request: RoomRequest,
): RoomRequestProblem | null {
  if (!usesRoomInventory(inventory.mode)) return null;
  if (request.kind === "whole") {
    if (inventory.mode !== "both") return "whole_not_offered";
    return availability.canBookWhole ? null : "whole_unavailable";
  }
  if (!Number.isInteger(request.count) || request.count < 1) return "rooms_required";
  if (availability.remainingRooms === 0) return "rooms_unavailable";
  if (request.count > availability.remainingRooms) return "too_many_rooms";
  return null;
}

/** The request a booking represents: its room quantity, or the whole property. */
export function roomRequestOf(rooms: number | null): RoomRequest {
  return rooms === null ? { kind: "whole" } : { kind: "rooms", count: rooms };
}

/**
 * Inventory changes must leave room for bookings already made.
 * `minRooms`: the most rooms that room-quantity bookings need on any night from `today` on.
 * `hasRoomBookings`: some upcoming or current booking is for a number of rooms, so the
 * property can't switch to whole-property only.
 */
export function inventoryInUse(
  bookings: readonly InventoryBooking[],
  today: ISODate,
): { minRooms: number; hasRoomBookings: boolean } {
  const upcoming = bookings.filter(
    (booking) => !booking.cancelled && booking.checkOut > today && booking.rooms !== null,
  );
  const load = nightlyLoad(upcoming, Number.MAX_SAFE_INTEGER);
  const future = [...load.entries()].filter(([night]) => night >= today).map(([, rooms]) => rooms);
  return { minRooms: Math.max(0, ...future), hasRoomBookings: upcoming.length > 0 };
}

/** Adapts booking records (or any booking-like value) to what availability needs. */
export function toInventoryBooking(booking: {
  id: string;
  checkIn: ISODate;
  checkOut: ISODate;
  roomsBooked: number | null;
  status: string;
}): InventoryBooking {
  return {
    id: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    rooms: booking.roomsBooked,
    cancelled: booking.status === "cancelled",
  };
}
