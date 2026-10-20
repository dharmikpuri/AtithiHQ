"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useCopy } from "@/content";
import { cn } from "@/lib/cn";
import { AccountMenu } from "./account-menu";

const WIDTHS = {
  narrow: "max-w-2xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
  /** Lists and detail pages: the full width of the screen, with side padding that grows on big screens. */
  fluid: "max-w-none 2xl:px-14 min-[1920px]:px-20",
};

/** Centred content column with responsive side padding. */
export function Page({
  children,
  width = "default",
  className,
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-10", WIDTHS[width], className)}>{children}</div>;
}

/**
 * Large title for top-level screens (Bookings, Guests, Payments, Settings).
 * On phones it also carries the account menu (Settings, Log out); larger screens have it in the sidebar.
 */
export function PageTitle({
  title,
  subtitle,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-5 md:items-end md:pt-8 lg:pt-10 lg:pb-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-title-1 text-ink lg:text-large-title">{title}</h1>
        {subtitle && <p className="mt-1 truncate text-callout text-ink-3">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <AccountMenu className="-mr-1 md:hidden" />
      </div>
    </header>
  );
}

/**
 * Visible heading for screens under a `ScreenHeader` on tablet and desktop
 * (on phones the app bar already shows the title).
 */
export function ScreenTitle({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hidden pt-2 pb-6 sm:block", className)}>
      <h2 className="text-title-1 text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-callout text-ink-3">{subtitle}</p>}
    </div>
  );
}

function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return scrolled;
}

/**
 * Sticky app bar for screens one level down (booking detail, forms).
 * Shows a back control, a short title and optional actions.
 */
export function ScreenHeader({
  title,
  backHref,
  backLabel,
  onBack,
  actions,
  leading,
  width = "default",
  revealTitleOnScroll = false,
}: {
  title: ReactNode;
  backHref?: string;
  /** Shown next to the chevron on larger screens, e.g. "Bookings". */
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
  /** Replaces the back control, e.g. a close button on forms. */
  leading?: ReactNode;
  width?: keyof typeof WIDTHS;
  /** For screens whose content starts with the same title: show it in the bar only once scrolled. */
  revealTitleOnScroll?: boolean;
}) {
  const t = useCopy();
  const scrolled = useScrolled();
  const pastHero = useScrolled(72);
  const backContent = (
    <>
      <ChevronLeft className="size-6 sm:size-5" aria-hidden />
      <span className="sr-only sm:not-sr-only">{backLabel ?? t.common.actions.back}</span>
    </>
  );
  const backClass =
    "-ml-2 flex h-11 min-w-11 items-center justify-center gap-0.5 rounded-full px-2 text-callout font-medium text-ink-2 hover:bg-ink/5 hover:text-ink sm:justify-start sm:pr-3";

  return (
    <div
      className={cn(
        "sticky top-0 z-30 border-b bg-canvas/90 pt-safe backdrop-blur-md transition-colors duration-200",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <Page width={width}>
        <div className="flex h-14 items-center gap-2 md:h-16">
          {leading ??
            (backHref ? (
              <Link href={backHref} className={backClass} aria-label={backLabel ?? t.common.actions.back}>
                {backContent}
              </Link>
            ) : (
              onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className={backClass}
                  aria-label={backLabel ?? t.common.actions.back}
                >
                  {backContent}
                </button>
              )
            ))}
          <h1
            className={cn(
              "min-w-0 flex-1 truncate text-headline text-ink transition-opacity duration-200 sm:sr-only",
              revealTitleOnScroll && !pastHero && "opacity-0",
            )}
          >
            {title}
          </h1>
          {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
        </div>
      </Page>
    </div>
  );
}
