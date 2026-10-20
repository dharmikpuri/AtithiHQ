"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCopy } from "@/content";
import { duotone } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";
import { isFocusedTaskRoute, isNavItemActive, NAV_ITEMS } from "./nav-items";

/** Phone navigation: four tabs, always one tap away. */
export function BottomNav() {
  const pathname = usePathname();
  const t = useCopy();
  if (isFocusedTaskRoute(pathname)) return null;

  return (
    <nav
      aria-label={t.common.nav.mainNavigation}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch px-2">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group flex flex-1 flex-col items-center justify-center gap-1 outline-none"
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200",
                    active ? "bg-brand-100 text-brand-700" : "text-ink-3 group-active:bg-ink/5",
                    "group-focus-visible:ring-2 group-focus-visible:ring-brand-500",
                  )}
                >
                  <item.icon
                    className="size-5.5"
                    strokeWidth={active ? 2.25 : 1.9}
                    aria-hidden
                    {...(active ? duotone : {})}
                  />
                </span>
                <span
                  className={cn(
                    "text-caption leading-none",
                    active ? "font-semibold text-brand-700" : "font-medium text-ink-3",
                  )}
                >
                  {item.label(t)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
