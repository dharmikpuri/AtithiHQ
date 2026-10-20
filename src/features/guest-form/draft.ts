/**
 * The guest form's working copy: everyone on the booking, edited locally
 * and sent to the host in one submission at the end.
 */
import { DEFAULT_COUNTRY } from "@/domain/constants";
import type { GuestLinkSubmittedGuest, GuestLinkView } from "@/domain/read-models";
import type { GuestDetailsInput } from "@/lib/api";
import type { GuestDetailsValues } from "@/features/guest-details/guest-details-schema";

export interface DraftGuest extends GuestDetailsValues {
  key: string;
  /** Set once the guest has saved an ID in this visit. */
  idTouched: boolean;
  /** Whether this person already had an ID on file from an earlier visit. */
  hadDocument: boolean;
}

export interface GuestDraft {
  lead: DraftGuest;
  companions: DraftGuest[];
}

let keyCounter = 0;
const newDraftKey = () => `draft-${++keyCounter}`;

function fromSubmitted(guest: GuestLinkSubmittedGuest): DraftGuest {
  return {
    key: newDraftKey(),
    name: guest.name,
    phone: guest.phone ?? "",
    nationality: guest.nationality,
    idType: guest.document?.type ?? "none",
    idLast4: guest.document?.last4 ?? "",
    idHasImage: Boolean(guest.document),
    idTouched: false,
    hadDocument: Boolean(guest.document),
  };
}

export function emptyDraftGuest(nationality = DEFAULT_COUNTRY): DraftGuest {
  return {
    key: newDraftKey(),
    name: "",
    phone: "",
    nationality,
    idType: "none",
    idLast4: "",
    idHasImage: false,
    idTouched: false,
    hadDocument: false,
  };
}

/** Starts from what the guest sent before, or from what the host typed. */
export function initialDraft(view: GuestLinkView): GuestDraft {
  const submittedLead = view.submittedGuests.find((guest) => guest.role === "lead");
  const lead = submittedLead
    ? fromSubmitted(submittedLead)
    : { ...emptyDraftGuest(), name: view.lead.name, phone: view.lead.phone ?? "" };
  return {
    lead,
    companions: view.submittedGuests.filter((guest) => guest.role === "companion").map(fromSubmitted),
  };
}

export function draftHasId(guest: DraftGuest) {
  return guest.idType !== "none";
}

export function toSubmissionGuest(guest: DraftGuest, idEnabled: boolean): GuestDetailsInput {
  const keepExisting = !idEnabled || (!guest.idTouched && guest.hadDocument);
  return {
    name: guest.name.trim(),
    phone: guest.phone || null,
    nationality: guest.nationality,
    document: keepExisting
      ? undefined
      : guest.idType === "none"
        ? null
        : { type: guest.idType, last4: guest.idLast4.toUpperCase(), hasImage: guest.idHasImage },
  };
}
