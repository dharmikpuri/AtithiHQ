/** TanStack Query cache keys. Keep every key here so invalidation stays predictable. */
export const queryKeys = {
  session: ["session"] as const,
  bookings: {
    all: ["bookings"] as const,
    list: () => ["bookings", "list"] as const,
    detail: (bookingId: string) => ["bookings", "detail", bookingId] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: () => ["invoices", "list"] as const,
  },
  guests: {
    all: ["guests"] as const,
    list: () => ["guests", "list"] as const,
    detail: (guestId: string) => ["guests", "detail", guestId] as const,
  },
  guestLinks: ["guest-link"] as const,
  guestLink: (token: string) => ["guest-link", token] as const,
  receiptLink: (token: string) => ["receipt-link", token] as const,
};
