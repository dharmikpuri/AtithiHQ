/**
 * One person's details — shared by the owner's manual entry and the guest form,
 * so both validate exactly the same way.
 */
import { z } from "zod";
import { getCopy } from "@/content";
import { DEFAULT_COUNTRY, ID_DOCUMENT_TYPES } from "@/domain/constants";
import type { BookingGuestDetails } from "@/domain/read-models";
import type { IdDocumentType } from "@/domain/types";
import type { GuestDetailsInput } from "@/lib/api";
import { nameField, optionalPhoneField, requiredPhoneField } from "@/lib/validation";

const copy = getCopy().common;

const idFields = {
  idType: z.enum(["none", ...ID_DOCUMENT_TYPES] as ["none", ...IdDocumentType[]]),
  idLast4: z.string().trim().toUpperCase(),
  idHasImage: z.boolean(),
};

function refineId(values: { idType: string; idLast4: string }, ctx: z.RefinementCtx) {
  if (values.idType !== "none" && !/^[A-Z0-9]{4}$/.test(values.idLast4)) {
    ctx.addIssue({ code: "custom", path: ["idLast4"], message: copy.idDocument.last4Invalid });
  }
}

export const guestDetailsSchema = z
  .object({ name: nameField, phone: optionalPhoneField, nationality: z.string().length(2), ...idFields })
  .superRefine(refineId);

/** The person who booked must leave a number the host can reach. */
export const leadGuestDetailsSchema = z
  .object({ name: nameField, phone: requiredPhoneField, nationality: z.string().length(2), ...idFields })
  .superRefine(refineId);

export type GuestDetailsValues = z.infer<typeof guestDetailsSchema>;

export const emptyGuestDetails: GuestDetailsValues = {
  name: "",
  phone: "",
  nationality: DEFAULT_COUNTRY,
  idType: "none",
  idLast4: "",
  idHasImage: false,
};

export function guestDetailsFromEntry(entry: BookingGuestDetails): GuestDetailsValues {
  return {
    name: entry.guest.name,
    phone: entry.guest.phone ?? "",
    nationality: entry.guest.nationality,
    idType: entry.document?.type ?? "none",
    idLast4: entry.document?.last4 ?? "",
    idHasImage: entry.document?.hasImage ?? false,
  };
}

/**
 * @param includeDocument when ID collection is off, leave any existing
 * document untouched rather than deleting it.
 */
export function toGuestDetailsInput(values: GuestDetailsValues, includeDocument = true): GuestDetailsInput {
  return {
    name: values.name.trim(),
    phone: values.phone || null,
    nationality: values.nationality,
    document: !includeDocument
      ? undefined
      : values.idType === "none"
        ? null
        : { type: values.idType, last4: values.idLast4.toUpperCase(), hasImage: values.idHasImage },
  };
}
