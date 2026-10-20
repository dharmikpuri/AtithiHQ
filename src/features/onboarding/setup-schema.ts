import { z } from "zod";
import { getCopy } from "@/content";
import { isGstRate, isValidGstin } from "@/domain/gst";
import { isIndianStateCode } from "@/domain/indian-states";
import { BOOKING_MODES, DEFAULT_ROOM_COUNT, MAX_ROOMS, MIN_ROOMS, usesRoomInventory } from "@/domain/inventory";
import { isPropertyType } from "@/domain/property-types";
import { isDifferentPhone, isValidEmail, isValidPincode } from "@/domain/registration";
import type { PhoneE164 } from "@/domain/types";
import { nameField, requiredPhoneField } from "@/lib/validation";

const v = getCopy().common.validation;

/** Area or locality shown to guests. Also used when editing it in Settings. */
export const locationField = z.string().trim().min(2, v.required).max(120, v.nameTooLong);

/** Booking mode and room count (a quantity). Also used by the Settings editor. */
export const inventorySchema = z
  .object({ bookingMode: z.enum(BOOKING_MODES), roomCount: z.number().int() })
  .superRefine(({ bookingMode, roomCount }, ctx) => {
    if (!usesRoomInventory(bookingMode)) return;
    const min = MIN_ROOMS[bookingMode];
    if (roomCount < min) ctx.addIssue({ code: "custom", path: ["roomCount"], message: v.roomsTooFew(min) });
    if (roomCount > MAX_ROOMS)
      ctx.addIssue({ code: "custom", path: ["roomCount"], message: v.roomsTooMany(MAX_ROOMS) });
  });

/** Whether the property is GST registered, and its GSTIN and rate. Also used by the Settings editor. */
export const gstSchema = z
  .object({ registered: z.boolean(), gstin: z.string(), rate: z.number().nullable() })
  .superRefine(({ registered, gstin, rate }, ctx) => {
    // Not registered: the GSTIN and rate are ignored.
    if (!registered) return;
    if (!isValidGstin(gstin)) ctx.addIssue({ code: "custom", path: ["gstin"], message: v.gstinInvalid });
    if (!isGstRate(rate)) ctx.addIssue({ code: "custom", path: ["rate"], message: v.gstRateRequired });
  });

/**
 * The registration form. The rules themselves live in `domain/registration.ts`, shared with
 * the route guards and the backend; this only attaches messages. `primaryPhone` is the verified
 * number, passed in so the alternate number can be checked against it.
 */
export function registrationSchema(primaryPhone: PhoneE164) {
  return z.object({
    owner: z.object({
      name: nameField,
      alternatePhone: requiredPhoneField.refine((value) => isDifferentPhone(value, primaryPhone), v.alternatePhoneSame),
      email: z.string().trim().refine(isValidEmail, v.emailInvalid),
    }),
    property: z.object({
      // A plain string until one is picked (the form starts empty); narrowed on submit.
      type: z.string().refine((value): boolean => isPropertyType(value), v.propertyTypeRequired),
      name: nameField,
      location: locationField,
      city: nameField,
      state: z.string().refine(isIndianStateCode, v.stateRequired),
      pincode: z.string().trim().refine(isValidPincode, v.pincodeInvalid),
    }),
    inventory: inventorySchema,
    gst: gstSchema,
    consent: z.boolean().refine((accepted) => accepted, v.consentRequired),
  });
}

export type RegistrationValues = z.infer<ReturnType<typeof registrationSchema>>;

export const EMPTY_REGISTRATION: RegistrationValues = {
  owner: { name: "", alternatePhone: "", email: "" },
  property: { type: "", name: "", location: "", city: "", state: "", pincode: "" },
  inventory: { bookingMode: "entire", roomCount: DEFAULT_ROOM_COUNT },
  gst: { registered: false, gstin: "", rate: null },
  consent: false,
};
