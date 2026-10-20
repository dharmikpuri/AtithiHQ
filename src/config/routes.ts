/**
 * Every URL in the app, in one place. Build links with these helpers instead of
 * writing paths by hand, so renaming a route is a one-line change.
 */

export type BookingsView = "today" | "upcoming" | "past" | "awaiting";

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const routes = {
  /** Public home page. */
  home: "/",
  login: "/login",
  /** "Get started": verify a mobile number, then complete registration at `setup`. */
  register: "/register",
  /** The registration form, after the number is verified. */
  setup: "/setup",
  terms: "/terms",
  privacyPolicy: "/privacy-policy",

  bookings: "/bookings",
  bookingsView: (view: BookingsView) => withQuery("/bookings", { view }),
  newBooking: (options: { guestId?: string } = {}) => withQuery("/bookings/new", { guest: options.guestId }),
  /** `created` opens the share sheet straight after a booking is made. */
  booking: (id: string, options: { created?: boolean } = {}) =>
    withQuery(`/bookings/${id}`, { created: options.created ? "1" : undefined }),
  editBooking: (id: string) => `/bookings/${id}/edit`,

  guests: (options: { query?: string; sort?: string } = {}) =>
    withQuery("/guests", { q: options.query, sort: options.sort }),
  guest: (id: string) => `/guests/${id}`,

  payments: "/payments",
  settings: "/settings",

  /** The public guest form. `preview` shows the owner what the guest sees; `from` is where "back" returns. */
  guestForm: (token: string, options: { preview?: boolean; from?: string } = {}) =>
    withQuery(`/g/${token}`, { preview: options.preview ? "1" : undefined, from: options.from }),

  /** The public page a guest opens from a shared receipt or tax invoice. Expires; see `RECEIPT_LINK_HOURS`. */
  receipt: (token: string) => `/r/${token}`,
} as const;

/** Where a signed-in owner lands. */
export const OWNER_HOME = routes.bookings;

/** Areas that need a signed-in owner. They are also kept out of search engines. */
export const OWNER_AREAS = ["/bookings", "/guests", "/payments", "/settings", "/setup"] as const;

/** True for same-site paths like "/bookings/1"; rejects "//evil.com" and "/\evil.com" (open redirects). */
export function isInternalPath(path: string): boolean {
  return /^\/(?![/\\])/.test(path);
}

export function isOwnerArea(pathname: string): boolean {
  return OWNER_AREAS.some((area) => pathname === area || pathname.startsWith(`${area}/`));
}
