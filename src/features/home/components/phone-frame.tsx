import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A simple phone outline for product previews on the home page.
 * Previews are illustrations: they are hidden from assistive tech and can't be focused.
 */
export function PhoneFrame({
  children,
  className,
  screenClassName,
  label,
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  /** Short description announced instead of the preview's contents. */
  label: string;
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn("relative rounded-[2.5rem] bg-brand-950 p-2 shadow-glow ring-1 ring-black/10", className)}
    >
      <div
        inert
        aria-hidden
        className={cn("relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-surface", screenClassName)}
      >
        {/* Dynamic-island style camera cut-out */}
        <span className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-brand-950" />
        {children}
      </div>
    </figure>
  );
}
