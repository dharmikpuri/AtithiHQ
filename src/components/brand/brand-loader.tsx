import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { MARK_GRID, MARK_PATHS, MARK_TILE_RADIUS } from "./mark";

/** The roof as a stroke (the centre line of `MARK_PATHS.roof`), so it can draw itself. */
const ROOF_LINE = "M14.4 20.2 24 10.6l9.6 9.6v17.6";
const ROOF_WIDTH = 6.6;

/** One dot per guest in the group. */
const GUESTS = 4;

/**
 * The AtithiHQ loading indicator, telling the product's story in one loop: the roof draws
 * itself, a guest drops in underneath, and the group's details arrive one by one.
 * People who prefer reduced motion see the finished mark and the dots, still.
 */
export function BrandLoader({
  className,
  label,
}: {
  className?: string;
  /** Announced to screen readers. */
  label: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn("flex flex-col items-center gap-4", className)}>
      <svg viewBox={`0 0 ${MARK_GRID} ${MARK_GRID}`} aria-hidden className="size-16 drop-shadow-sm">
        <rect width={MARK_GRID} height={MARK_GRID} rx={MARK_TILE_RADIUS} className="fill-brand-600" />
        <path
          d={ROOF_LINE}
          fill="none"
          strokeWidth={ROOF_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={0}
          className="animate-loader-roof stroke-surface motion-reduce:animate-none"
        />
        <path
          d={MARK_PATHS.guest}
          className="animate-loader-guest fill-accent-400 [transform-box:fill-box] motion-reduce:animate-none"
        />
      </svg>
      <span aria-hidden className="flex gap-1.5">
        {Array.from({ length: GUESTS }, (_, index) => (
          <span
            key={index}
            className="size-2 animate-loader-dot rounded-full bg-brand-600 motion-reduce:animate-none"
            style={{ animationDelay: `${index * 0.12}s` } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
