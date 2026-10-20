const plural = (count: number, one: string, other: string) => (count === 1 ? one : other);

/** 1st, 2nd, 3rd, 4th … 11th, 12th, 13th, 21st … */
const ordinal = (n: number) => {
  const tens = n % 100;
  const suffix =
    tens >= 11 && tens <= 13 ? "th" : (({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th");
  return `${n}${suffix}`;
};

export const guests = {
  list: {
    metaTitle: "Guests",
    title: "Guests",
    searchLabel: "Search guests",
    searchPlaceholder: "Search by name or number",
    sortLabel: "Sort guests",
    sorts: {
      recent: "Recent stay",
      stays: "Most visits",
      spend: "Top spend",
      name: "Name A–Z",
    },
    columns: { guest: "Guest", guests: "Guests", lastStay: "Stay", spent: "Spent" },
    returning: "Returning",
    /** "2nd visit" — which stay at the property this booking is for the primary guest. */
    visit: (visit: number) => `${ordinal(visit)} visit`,
    /** One row per booking: the primary guest, with everyone else tucked under this. */
    members: {
      viewAll: (count: number) => `View all members (${count})`,
      hide: "Hide members",
      listLabel: (name: string) => `Staying with ${name}`,

      matched: "Matches your search",
      guests: (count: number) => `${count} ${plural(count, "guest", "guests")}`,
    },
    lastStay: (date: string) => `Last stay ${date}`,
    upcoming: (date: string) => `Upcoming · ${date}`,
    next: (date: string) => `Next stay ${date}`,
    emptyValue: "—",
    nothingSpent: "Nothing spent yet",
    results: (count: number) => `${count} ${plural(count, "guest", "guests")} found`,
    empty: {
      title: "Your guest book is empty",
      body: "Guests appear here on their own as you add bookings — with every stay and what they've paid.",
    },
    noResults: {
      title: (query: string) => `No guests match “${query}”`,
      body: "Check the spelling, or try part of their mobile number.",
      clear: "Clear search",
    },
  },

  filters: {
    returning: "Returning guests only",
    returningHint: "The primary guest has stayed before",
    nationality: "Nationality",
    nationalityOptions: { india: "India", foreign: "Other countries" },
    stay: "Stay",
    stayOptions: { current: "Here now", upcoming: "Upcoming", past: "Past stays" },
    dates: "Check-in date",
  },

  export: {
    fileName: "guests",
    sheet: "Guests",
    what: "guests",
    summary: (bookings: number, guests: number) =>
      `${bookings} ${plural(bookings, "booking", "bookings")} · ${guests} ${plural(guests, "guest", "guests")}`,
    columns: {
      primaryGuest: "Primary guest",
      guestName: "Guest name",
      role: "Role",
      booking: "Booking",
      checkIn: "Check-in",
      checkOut: "Check-out",
      phone: "Phone",
      nationality: "Nationality",
      stayStatus: "Stay status",
      details: "Details",
    },
    primary: "Primary guest",
    member: "Member",
    received: "Received",
    pending: "Pending",
    past: "Checked out",
    cancelled: "Cancelled",
  },

  /** Where a stay stands today. Past stays need no label. */
  stayStatus: {
    upcoming: "Upcoming",
    arriving: "Arriving today",
    staying: "Staying now",
    departing: "Leaving today",
    cancelled: "Cancelled",
  },

  profile: {
    metaTitle: "Guest",
    title: "Guest",
    back: "Guests",
    backToList: "All guests",
    menu: "Guest options",
    edit: "Edit details",
    returning: "Returning guest",
    guestSince: (date: string) => `Guest since ${date}`,
    firstStayOn: (date: string) => `First stay on ${date}`,
    call: "Call",
    callLabel: (phone: string) => `Call ${phone}`,
    whatsapp: "WhatsApp",
    whatsappLabel: (name: string) => `WhatsApp ${name}`,
    newBooking: (firstName: string) => (firstName ? `New booking for ${firstName}` : "New booking"),
    notFound: "This guest doesn't exist, or no longer has any stays.",

    stats: {
      label: "Summary",
      stays: "Stays",
      nights: "Nights",
      spent: "Total spent",
      lastStay: "Last stay",
      currentStay: "Current stay",
      nextStay: "Next stay",
      upcoming: (count: number) => `${count} upcoming`,
      bookedByOthers: "Booked by others",
      inDays: (days: number) => (days === 1 ? "Tomorrow" : `In ${days} days`),
    },

    stays: {
      title: "Stays",
      booked: "Booked this stay",
      with: (name: string) => `With ${name}`,
    },

    details: {
      title: "Details",
      edit: "Edit",
      id: "ID on file",
      noPhone: "Not added",
      addPhone: "Add",
      noId: "No ID on file",
      idValue: (type: string, last4: string) => `${type} ••${last4}`,
      deleteOn: (date: string) => `Deleted automatically on ${date}`,
    },
  },

  editSheet: {
    title: "Edit details",
    description: (firstName: string) =>
      firstName ? `Changes show on all of ${firstName}'s stays.` : "Changes show on all of their stays.",
    saved: "Guest details saved",
  },
};
