"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, LogoMark } from "@/components/brand/logo";
import { OWNER_HOME, routes } from "@/config/routes";
import { useCopy } from "@/content";
import { propertyProfileOf } from "@/domain/profiles";
import { useCurrentSession } from "@/features/auth/queries";
import { PropertySummary } from "@/features/property/property-summary";
import { duotone } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";
import { AccountMenu } from "./account-menu";
import { isNavItemActive, NAV_ITEMS } from "./nav-items";

/**
 * Tablet: a compact rail (icons with labels).
 * Desktop: a full sidebar with the property and a prominent "New booking".
 */
export function SideNav() {
  const pathname = usePathname();
  const t = useCopy();
  const { property } = useCurrentSession();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-24 flex-col border-r border-line bg-surface md:flex lg:w-[264px]">
      <div className="flex h-20 shrink-0 items-center justify-center lg:justify-start lg:px-6">
        <Link href={OWNER_HOME} aria-label={t.common.appName} className="group/logo rounded-lg">
          <LogoMark className="size-9 lg:hidden" motion="hop" />
          <Logo className="hidden lg:inline-flex" showByline motion="hop" />
        </Link>
      </div>

      <div className="hidden px-4 lg:block">
        <PropertySummary
          compact
          profile={propertyProfileOf(property)}
          className="rounded-2xl border border-line bg-subtle px-3 py-2.5"
        />
      </div>

      <div className="mt-2 flex justify-center px-4 lg:mt-4 lg:block">
        <Link
          href={routes.newBooking()}
          className={cn(
            "flex items-center justify-center gap-2 bg-brand-600 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[0.98]",
            "size-12 rounded-2xl lg:h-12 lg:w-full lg:rounded-xl",
          )}
        >
          <Plus className="size-5" aria-hidden />
          <span className="sr-only lg:not-sr-only">{t.common.nav.newBooking}</span>
        </Link>
      </div>

      <nav aria-label={t.common.nav.mainNavigation} className="mt-4 flex-1 px-3 lg:mt-6 lg:px-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-2xl py-2.5 text-caption font-medium transition-colors duration-150",
                    "lg:h-11 lg:flex-row lg:gap-3 lg:rounded-xl lg:px-3 lg:py-0 lg:text-callout",
                    active ? "bg-brand-50 text-brand-700 lg:font-semibold" : "text-ink-2 hover:bg-ink/4 hover:text-ink",
                  )}
                >
                  <item.icon
                    className="size-5.5 lg:size-5"
                    strokeWidth={active ? 2.25 : 1.9}
                    aria-hidden
                    {...(active ? duotone : {})}
                  />
                  {item.label(t)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Account: Settings and Log out */}
      <div className="flex justify-center border-t border-line py-3 lg:hidden">
        <AccountMenu />
      </div>
      <div className="hidden border-t border-line p-3 lg:block">
        <AccountMenu variant="sidebar" />
      </div>
    </aside>
  );
}
