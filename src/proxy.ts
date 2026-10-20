import { NextResponse, type NextRequest } from "next/server";
import { isOwnerArea, OWNER_HOME, routes } from "@/config/routes";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * Route protection at the edge of the app.
 * - Owner areas need a session; without one the owner is sent to sign in.
 * - The registration form needs a verified number; without one, registration starts over.
 * - Signed-in owners skip sign-in and the start of registration.
 *   (Whether their registration is complete is checked in the app, which knows the session.)
 * - The home page is open to everyone, signed in or not, including an owner part-way through
 *   registration. So are the guest form at `/g/...`, shared receipts at `/r/...`, the legal pages, robots and the
 *   sitemap.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (hasSession && (pathname === routes.login || pathname === routes.register)) {
    return NextResponse.redirect(new URL(OWNER_HOME, request.url));
  }
  if (!hasSession && pathname === routes.setup) {
    return NextResponse.redirect(new URL(routes.register, request.url));
  }
  if (!hasSession && isOwnerArea(pathname)) {
    return NextResponse.redirect(new URL(routes.login, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Must be literal for Next to read it at build time. Keep in sync with OWNER_AREAS in config/routes.ts.
  matcher: [
    "/login",
    "/register",
    "/setup",
    "/bookings/:path*",
    "/guests/:path*",
    "/payments/:path*",
    "/settings/:path*",
  ],
};
