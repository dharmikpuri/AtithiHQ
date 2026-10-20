import { site } from "@/config/site";
import type {
  BookingMode,
  BookingSource,
  IdDocumentType,
  IdRequirement,
  PaymentMethod,
  PropertyType,
} from "@/domain/types";

const plural = (count: number, one: string, other: string) => `${count} ${count === 1 ? one : other}`;

export const common = {
  appName: site.name,
  tagline: "Your guest book that fills itself.",
  byline: `A ${site.company} product`,
  company: site.company,
  copyright: (year: number) => `© ${Math.max(site.since, year)} ${site.company}`,

  actions: {
    save: "Save",
    saveChanges: "Save changes",
    saving: "Saving…",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    continue: "Continue",
    done: "Done",
    edit: "Edit",
    remove: "Remove",
    retry: "Try again",
    copy: "Copy",
    copied: "Copied",
    copyLink: "Copy link",
    share: "Share",
    add: "Add",
    change: "Change",
    keepEditing: "Keep editing",
    discard: "Discard",
    clear: "Clear",
    viewAll: "View all",
    more: "More options",
  },

  nav: {
    bookings: "Bookings",
    guests: "Guests",
    payments: "Payments",
    settings: "Settings",
    newBooking: "New booking",
    mainNavigation: "Main navigation",
  },

  states: {
    loading: "Loading…",
    errorTitle: "Something went wrong",
    errorBody: "Please check your connection and try again.",
    notFoundTitle: "We couldn't find that",
    notFoundBody: "It may have been removed, or the link is incorrect.",
    offline: "You're offline. Changes will need a connection.",
  },

  discard: {
    title: "Discard changes?",
    body: "What you've entered on this screen will be lost.",
  },

  relative: { today: "today", yesterday: "yesterday" },

  count: {
    nights: (n: number) => plural(n, "night", "nights"),
    guests: (n: number) => plural(n, "guest", "guests"),
    stays: (n: number) => plural(n, "stay", "stays"),
    bookings: (n: number) => plural(n, "booking", "bookings"),
    people: (n: number) => plural(n, "person", "people"),
  },

  sources: {
    airbnb: "Airbnb",
    booking_com: "Booking.com",
    makemytrip: "MakeMyTrip",
    agoda: "Agoda",
    direct: "Direct",
    referral: "Referral",
    walk_in: "Walk-in",
    other: "Other",
  } satisfies Record<BookingSource, string>,

  /** Kinds of property, with a one-line description for the picker. */
  propertyTypes: {
    homestay: { label: "Homestay", description: "Rooms in a family home" },
    villa: { label: "Villa", description: "A private house, often with a pool" },
    guest_house: { label: "Guest house / B&B", description: "Rooms, sometimes with breakfast" },
    cottage: { label: "Cottage / Farm stay", description: "Cottages, farms and nature stays" },
    hostel: { label: "Hostel", description: "Beds and dorms for travellers" },
  } satisfies Record<PropertyType, { label: string; description: string }>,

  /** How a property is rented. */
  bookingModes: {
    entire: {
      label: "Entire property",
      description: "Guests book the whole place. One booking at a time.",
    },
    rooms: {
      label: "Room by room",
      description: "You rent rooms separately, so several bookings can share the same dates.",
    },
    both: {
      label: "Both",
      description: "Sometimes the whole place, sometimes a few rooms, depending on what's free.",
    },
  } satisfies Record<BookingMode, { label: string; description: string }>,

  /** The property's room inventory, in words. Rooms are a quantity: never named or numbered. */
  inventory: {
    rooms: (count: number) => (count === 1 ? "1 room" : `${count} rooms`),
    summaryTitle: "Your inventory",
    entire: "Booked as one unit. A new booking can't overlap another one.",
    roomsLine: (count: number) =>
      `${count === 1 ? "1 room" : `${count} rooms`} to rent separately. Bookings can share dates until all are taken.`,
    wholeLine: (count: number) => `The whole property, as one booking. It takes all ${count} rooms for those dates.`,
    splitLine: (count: number) =>
      `Or up to ${count} rooms, separately. Rooms already booked block a whole-property booking on those dates.`,
    short: (mode: string, count: number | null) =>
      count ? `${mode} · ${count === 1 ? "1 room" : `${count} rooms`}` : mode,
  },

  paymentMethods: {
    upi: "UPI",
    cash: "Cash",
    bank_transfer: "Bank transfer",
    card: "Card",
    platform: "Via platform",
    other: "Other",
  } satisfies Record<PaymentMethod, string>,

  idTypes: {
    aadhaar: "Aadhaar",
    passport: "Passport",
    driving_licence: "Driving licence",
  } satisfies Record<IdDocumentType, string>,

  idRequirements: {
    off: "Don't ask",
    optional: "Optional",
    required: "Required",
  } satisfies Record<IdRequirement, string>,

  fields: {
    fullName: "Full name",
    name: "Name",
    mobile: "Mobile number",
    phone: "Phone",
    nationality: "Nationality",
    countryCode: "Country code",
    optional: "Optional",
  },

  idDocument: {
    section: "Photo ID",
    type: "ID type",
    none: "No ID",
    last4: "Last 4 digits of the ID number",
    last4Passport: "Last 4 characters of the passport number",
    last4Hint: "Only these 4 are kept — never the full number.",
    last4Invalid: "Enter the last 4 characters",
    photo: "Photo of the ID",
    photoAdd: "Take or upload a photo",
    photoReplace: "Replace",
    photoRemove: "Remove photo",
    photoHint: "Optional. Stored privately and deleted automatically.",
    photoAdded: "Photo added",
    masked: "Number hidden",
    maskedOnDevice: "Sensitive digits are hidden on this phone before anything is sent.",
  },

  validation: {
    required: "This is required",
    nameTooShort: "Please enter at least 2 letters",
    nameTooLong: "That's a bit long — please shorten it",
    phoneInvalid: "Enter a valid mobile number",
    phoneInvalidIndia: "Enter a 10-digit mobile number",
    amountTooLarge: "That amount looks too large",
    amountPositive: "Enter an amount above ₹0",
    emailInvalid: "Enter a valid email address, like name@example.com",
    pincodeInvalid: "Enter a valid 6-digit PIN code",
    stateRequired: "Choose a state or union territory",
    propertyTypeRequired: "Choose the kind of property",
    roomsTooFew: (min: number) => (min === 1 ? "Add at least 1 room" : `Add at least ${min} rooms`),
    roomsTooMany: (max: number) => `You can list up to ${max} rooms`,
    gstinInvalid: "Enter a 15-character GSTIN (letters and numbers)",
    gstRateRequired: "Choose a GST rate",
    alternatePhoneSame: "Use a different number from your primary mobile",
    consentRequired: "Please accept the Terms & Conditions and Privacy Policy to continue",
  },

  a11y: {
    decrease: "Decrease",
    increase: "Increase",
    openMenu: "Open menu",
    closeDialog: "Close",
    loading: "Loading",
  },

  /** Masked phone numbers that the owner can reveal, call and copy. */
  phone: {
    show: "Show full number",
    hide: "Hide number",
    copy: "Copy number",
    copied: "Number copied",
    copyFailed: "Couldn't copy the number",
    call: (phone: string) => `Call ${phone}`,
  },

  filters: {
    button: "Filters",
    title: "Filters",
    description: "Narrow down the list. Your choice stays in the address, so refresh and back keep it.",
    active: (count: number) => (count === 1 ? "1 filter applied" : `${count} filters applied`),
    show: (count: number) => (count === 1 ? "Show 1 result" : `Show ${count} results`),
    reset: "Reset",
    clearAll: "Clear all",
    remove: (label: string) => `Remove filter: ${label}`,
    from: "From",
    to: "To",
    dateFrom: (date: string) => `From ${date}`,
    dateTo: (date: string) => `Until ${date}`,
    dateBetween: (from: string, to: string) => `${from} – ${to}`,
    noMatch: {
      title: "Nothing matches these filters",
      body: "Try removing a filter or two.",
      clear: "Clear filters",
    },
  },

  export: {
    button: "Export",
    title: (what: string) => `Export ${what}`,
    description: "Choose what to include, then download the file.",
    period: "What to include",
    periods: {
      view: "What's on screen",
      viewHint: "Exactly what the list shows now, filters included",
      thisMonth: "This month",
      lastMonth: "Last month",
      custom: "Choose dates",
    },
    periodHint: "By check-in date",
    format: "File type",
    xlsx: "Excel (.xlsx)",
    xlsxHint: "Opens in Excel or Google Sheets",
    csv: "CSV (.csv)",
    csvHint: "Plain text, for other software",
    summary: (what: string) => `${what} will be exported`,
    download: "Download",
    preparing: "Preparing your file…",
    done: (fileName: string) => `Downloaded ${fileName}`,
    failed: "Couldn't create the file. Please try again.",
    empty: "Nothing to export with these filters.",
    yes: "Yes",
    no: "No",
  },
};
