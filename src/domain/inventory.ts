/**
 * How a property is rented, and its room inventory.
 *
 * Inventory is a quantity, never a list: a property has N bookable rooms, and bookings use up
 * some of that number. Rooms are not named, numbered or assigned to guests anywhere.
 *
 * - `entire`: the whole property is one bookable unit.
 * - `rooms`: N rooms are rented separately.
 * - `both`: the whole property, or some of its N rooms, depending on what is free.
 */
import type { Property } from "./types";

export const BOOKING_MODES = ["entire", "rooms", "both"] as const;

export type BookingMode = (typeof BOOKING_MODES)[number];

/** Modes that rent rooms separately, and so need a room count. */
export type RoomBasedMode = Exclude<BookingMode, "entire">;

/** Most rooms a property can list. */
export const MAX_ROOMS = 50;

/** Fewest rooms each mode accepts: renting both ways only makes sense with two rooms or more. */
export const MIN_ROOMS: Record<RoomBasedMode, number> = { rooms: 1, both: 2 };

/** A sensible starting count when an owner first switches to renting rooms. */
export const DEFAULT_ROOM_COUNT = 4;

export function isBookingMode(value: unknown): value is BookingMode {
  return typeof value === "string" && (BOOKING_MODES as readonly string[]).includes(value);
}

export function usesRoomInventory(mode: BookingMode): mode is RoomBasedMode {
  return mode !== "entire";
}

/** The property's inventory: `totalRooms` is `null` when it is rented only as a whole. */
export interface RoomInventory {
  mode: BookingMode;
  totalRooms: number | null;
}

export function isValidInventory(mode: unknown, roomCount: unknown): boolean {
  if (!isBookingMode(mode)) return false;
  if (!usesRoomInventory(mode)) return roomCount === null || roomCount === undefined;
  return Number.isInteger(roomCount) && (roomCount as number) >= MIN_ROOMS[mode] && (roomCount as number) <= MAX_ROOMS;
}

/** Drops the room count when it doesn't apply, so `entire` always stores `null`. */
export function normaliseInventory(mode: BookingMode, roomCount: number | null): RoomInventory {
  return { mode, totalRooms: usesRoomInventory(mode) ? roomCount : null };
}

export function inventoryOf(property: Pick<Property, "bookingMode" | "roomCount">): RoomInventory {
  return normaliseInventory(property.bookingMode, property.roomCount);
}
