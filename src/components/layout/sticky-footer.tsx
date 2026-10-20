import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Primary action pinned to the bottom of the screen on phones and tablets,
 * clear of the home indicator. Hidden on desktop, where actions sit in the page.
 */
export function StickyFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 backdrop-blur-md md:left-24 lg:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}

/** Spacer so content can scroll clear of the sticky footer. */
export function StickyFooterSpacer() {
  return <div aria-hidden className="h-28 lg:hidden" />;
}
