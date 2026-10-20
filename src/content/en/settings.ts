import { site } from "@/config/site";
import type { IdRequirement } from "@/domain/types";

const RETENTION_LABELS: Record<number, string> = {
  30: "30 days",
  90: "90 days",
  180: "6 months",
  365: "1 year",
};

export const settings = {
  metaTitle: "Settings",
  title: "Settings",
  subtitle: "Owner profile, property profile and guest form",

  groups: {
    profile: {
      title: "Owner profile",
      description: "Who runs the property and how to reach you. Guests see only your name.",
    },
    property: {
      title: "Property profile",
      description: "The place guests stay. Shown on their form and in your messages.",
    },
    guestForm: { title: "Guest form", description: "What guests are asked when they fill in their details." },
    account: { title: "Account", description: `Sign out of ${site.name} on this device.` },
  },

  ownerName: {
    label: "Full name",
    hint: "Guests see this as their host.",
    placeholder: "e.g. Oliver Bennett",
    saved: "Your name is updated",
  },
  mobile: {
    label: "Primary mobile number",
    note: "Verified · your sign-in number",
  },
  alternatePhone: {
    label: "Alternate mobile number",
    hint: "A second number we can reach you on. It must be different from your sign-in number.",
    saved: "Alternate number updated",
    notSet: "Not added",
  },
  email: {
    label: "Email address",
    hint: "For account messages. Guests never see it.",
    placeholder: "e.g. oliver@example.com",
    saved: "Email updated",
  },
  propertyType: {
    label: "Kind of property",
    description: "Sets the picture shown with your property, here and on the guest form.",
    saved: "Kind of property updated",
  },
  bookingMode: {
    label: "Booking mode",
    description: "How guests book your property, and how many rooms you rent.",
    saved: "Booking mode updated",
    roomsInUse: (rooms: number) =>
      `Upcoming bookings use up to ${rooms === 1 ? "1 room" : `${rooms} rooms`} on some nights, so you need at least ${rooms}.`,
    roomBookingsExist:
      "Some upcoming bookings are for a number of rooms. Keep a room-based mode until they check out, or edit them first.",
  },
  gst: {
    label: "GST",
    description: "Your GSTIN and rate. Printed on your tax invoices.",
    notRegistered: "Not registered",
    summary: (gstin: string, rate: number) => `${gstin} · ${rate}%`,
    saved: "GST details updated",
  },
  address: {
    label: "Address",
    description: "Where the property is. This is not your home address.",
    saved: "Address updated",
  },
  propertyName: {
    label: "Property name",
    hint: "Guests see this on their form and in your messages.",
    placeholder: "e.g. Sunrise Villa",
    saved: "Property name updated",
  },
  location: {
    label: "Area or locality",
    hint: "Shown to guests, so they recognise your property.",
    placeholder: "e.g. Assagao",
    saved: "Area updated",
  },
  checkInTime: {
    label: "Check-in time",
    description: "When guests can arrive. Shown with every booking.",
    saved: "Check-in time updated",
  },
  checkOutTime: {
    label: "Check-out time",
    description: "When guests need to leave. Shown with every booking.",
    saved: "Check-out time updated",
  },

  idRequirement: {
    label: "Photo ID",
    description: "Should guests add a photo ID when they fill in the form?",
    summaries: {
      off: "Guests aren't asked",
      optional: "Guests can add it or skip",
      required: "Guests are asked for everyone",
    } satisfies Record<IdRequirement, string>,
    options: {
      off: "Guests won't see a photo ID step.",
      optional: "Guests can add a photo ID, or skip it.",
      required: "Guests are asked for a photo ID for every person.",
    } satisfies Record<IdRequirement, string>,
    neverBlocks: "No guest is ever blocked. Anyone without an ID can still send their details and show it at check-in.",
    manual: "You can always add or correct details yourself from the booking.",
    saved: "Photo ID rule updated",
  },

  retentionConfirm: {
    shorterTitle: "Delete ID photos sooner?",
    shorterBody: (period: string) =>
      `ID photos will be deleted ${period} after check-out. Photos already older than that are deleted at the next clean-up, and this can't be undone.`,
    longerTitle: "Keep ID photos longer?",
    longerBody: (period: string) => `ID photos will be kept for ${period} after check-out before they are deleted.`,
    confirm: "Yes, change it",
    cancel: "Keep current setting",
  },

  retention: {
    label: "Delete ID photos after",
    summary: "Counted from check-out",
    description: "How long ID photos are kept after each guest checks out.",
    option: (days: number) => RETENTION_LABELS[days] ?? `${days} days`,
    reassurance: "ID photos are deleted automatically — you don't need to do anything.",
    appliesToExisting: "A change here also applies to ID photos you already have.",
    saved: "ID photo deletion updated",
  },

  preview: {
    label: "Preview guest form",
    hint: (name: string) => (name ? `See it as ${name} will` : "See it as your guests will"),
  },

  footer: {
    version: "UI preview · version 0.1.0",
  },
};
