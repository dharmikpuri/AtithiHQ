import { z } from "zod";
import { getCopy } from "@/content";
import { BOOKING_SOURCES, GUEST_COUNT, MAX_AMOUNT, PAYMENT_METHODS } from "@/domain/constants";
import type { BookingRecord } from "@/domain/read-models";
import type { BookingSource, PaymentMethod } from "@/domain/types";
import type { BookingInput, CreateBookingInput } from "@/lib/api";
import { leadGuestOf } from "@/domain/booking-rules";
import { usesRoomInventory, type RoomInventory } from "@/domain/inventory";
import { nameField, optionalPhoneField } from "@/lib/validation";

const t = getCopy();
const v = t.common.validation;
const f = t.bookings.form;

const amount = z.number().int().min(0).max(MAX_AMOUNT, v.amountTooLarge).nullable();

export const bookingFormSchema = z
  .object({
    checkIn: z.string().nullable(),
    checkOut: z.string().nullable(),
    guestCount: z.number().int().min(GUEST_COUNT.min).max(GUEST_COUNT.max),
    /** Room-based properties let both ways: book the entire property instead of some rooms. */
    bookWhole: z.boolean(),
    /** Rooms to take (a quantity). Used only by room-based properties. */
    rooms: z.number().int().min(1),
    source: z.enum(BOOKING_SOURCES as [BookingSource, ...BookingSource[]]).nullable(),
    leadName: nameField,
    leadPhone: optionalPhoneField,
    existingGuestId: z.string().nullable(),
    totalAmount: amount,
    receivedAmount: amount,
    receivedMethod: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  })
  .superRefine((values, ctx) => {
    if (!values.checkIn || !values.checkOut || values.checkOut <= values.checkIn) {
      ctx.addIssue({ code: "custom", path: ["checkIn"], message: f.datesRequired });
    }
    if (!values.source) {
      ctx.addIssue({ code: "custom", path: ["source"], message: f.sourceRequired });
    }
    const received = values.receivedAmount ?? 0;
    if (received > 0 && values.totalAmount === null) {
      ctx.addIssue({ code: "custom", path: ["receivedAmount"], message: f.receivedNeedsTotal });
    } else if (values.totalAmount !== null && received > values.totalAmount) {
      ctx.addIssue({ code: "custom", path: ["receivedAmount"], message: f.receivedTooHigh });
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const emptyBookingForm: BookingFormValues = {
  checkIn: null,
  checkOut: null,
  guestCount: 2,
  bookWhole: false,
  rooms: 1,
  source: null,
  leadName: "",
  leadPhone: "",
  existingGuestId: null,
  totalAmount: null,
  receivedAmount: null,
  receivedMethod: "upi",
};

export function bookingToFormValues(booking: BookingRecord): BookingFormValues {
  const lead = leadGuestOf(booking);
  return {
    ...emptyBookingForm,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestCount: booking.guestCount,
    bookWhole: booking.roomsBooked === null,
    rooms: booking.roomsBooked ?? 1,
    source: booking.source,
    leadName: lead?.guest.name ?? "",
    leadPhone: lead?.guest.phone ?? "",
    existingGuestId: lead?.guest.id ?? null,
    totalAmount: booking.totalAmount,
  };
}

/** The rooms the form asks for: a quantity, or `null` for the whole property. */
export function roomsBookedOf(values: Pick<BookingFormValues, "bookWhole" | "rooms">, inventory: RoomInventory) {
  if (!usesRoomInventory(inventory.mode)) return null;
  return inventory.mode === "both" && values.bookWhole ? null : values.rooms;
}

export function toBookingInput(values: BookingFormValues, inventory: RoomInventory): BookingInput {
  return {
    checkIn: values.checkIn!,
    checkOut: values.checkOut!,
    guestCount: values.guestCount,
    roomsBooked: roomsBookedOf(values, inventory),
    source: values.source!,
    totalAmount: values.totalAmount,
    lead: {
      name: values.leadName.trim(),
      phone: values.leadPhone || null,
      existingGuestId: values.existingGuestId,
    },
  };
}

/**
 * A saved booking as an update input, for quick edits outside the form (guest count, total).
 * The stored room quantity is kept as it is, whatever the property's booking mode is now.
 */
export function bookingToInput(booking: BookingRecord): BookingInput {
  const input = toBookingInput(bookingToFormValues(booking), { mode: "entire", totalRooms: null });
  return { ...input, roomsBooked: booking.roomsBooked };
}

export function toCreateBookingInput(values: BookingFormValues, inventory: RoomInventory): CreateBookingInput {
  const received = values.receivedAmount ?? 0;
  return {
    ...toBookingInput(values, inventory),
    initialPayment: received > 0 ? { amount: received, method: values.receivedMethod } : null,
  };
}
