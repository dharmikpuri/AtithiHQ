import { CalendarDays, IndianRupee, Settings, Users, type LucideIcon } from "lucide-react";
import { routes } from "@/config/routes";
import type { Copy } from "@/content";

export interface NavItem {
  href: string;
  label: (t: Copy) => string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: routes.bookings, label: (t) => t.common.nav.bookings, icon: CalendarDays },
  { href: routes.guests(), label: (t) => t.common.nav.guests, icon: Users },
  { href: routes.payments, label: (t) => t.common.nav.payments, icon: IndianRupee },
  { href: routes.settings, label: (t) => t.common.nav.settings, icon: Settings },
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Full-screen tasks hide the tab bar so the form owns the screen. */
export function isFocusedTaskRoute(pathname: string) {
  return /^\/bookings\/(new|[^/]+\/edit)$/.test(pathname);
}
