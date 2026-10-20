import { getCopy } from "@/content";
import { cn } from "@/lib/cn";
import { MARK_GRID, MARK_PATHS, MARK_TILE_RADIUS } from "./mark";

type LogoTone = "brand" | "inverted";

/** CSS-variable colours, so the mark follows the design tokens. */
const TONES: Record<LogoTone, { tile: string; roof: string; guest: string }> = {
  brand: { tile: "var(--color-brand-600)", roof: "var(--color-surface)", guest: "var(--color-accent-400)" },
  inverted: { tile: "var(--color-surface)", roof: "var(--color-brand-600)", guest: "var(--color-accent-500)" },
};

/**
 * How the guest moves: `drop` loops it dropping in under the roof (loading screens);
 * `hop` makes it hop when a parent with the `group/logo` class is hovered.
 */
type LogoMotion = "none" | "drop" | "hop";

const GUEST_MOTION: Record<LogoMotion, string> = {
  none: "",
  drop: "animate-guest-drop",
  hop: "group-hover/logo:animate-guest-hop",
};

/** The AtithiHQ mark on its own: the "a" drawn as a roof with a guest underneath. */
export function LogoMark({
  className,
  tone = "brand",
  motion = "none",
}: {
  className?: string;
  tone?: LogoTone;
  motion?: LogoMotion;
}) {
  const colors = TONES[tone];
  return (
    <svg viewBox={`0 0 ${MARK_GRID} ${MARK_GRID}`} aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width={MARK_GRID} height={MARK_GRID} rx={MARK_TILE_RADIUS} fill={colors.tile} />
      <path d={MARK_PATHS.roof} fill={colors.roof} />
      <path d={MARK_PATHS.guest} fill={colors.guest} className={cn("[transform-box:fill-box]", GUEST_MOTION[motion])} />
    </svg>
  );
}

/** The name, set as text so it stays crisp and readable by search engines. "HQ" takes the brand blue. */
function Wordmark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const { appName } = getCopy().common;
  const split = appName.endsWith("HQ") ? appName.length - 2 : appName.length;
  return (
    <span className={cn("font-bold tracking-tight", inverted ? "text-white" : "text-ink", className)}>
      {appName.slice(0, split)}
      <span className={inverted ? "text-brand-200" : "text-brand-500"}>{appName.slice(split)}</span>
    </span>
  );
}

const SIZES = {
  sm: { mark: "size-7", text: "text-callout", gap: "gap-2" },
  md: { mark: "size-8", text: "text-headline", gap: "gap-2.5" },
  lg: { mark: "size-10", text: "text-title-3", gap: "gap-3" },
};

/** Mark + name lockup. `showByline` adds "A Futurise Solutions product" underneath. */
export function Logo({
  className,
  size = "md",
  showByline = false,
  inverted = false,
  motion = "none",
}: {
  className?: string;
  size?: keyof typeof SIZES;
  showByline?: boolean;
  inverted?: boolean;
  motion?: LogoMotion;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <LogoMark tone={inverted ? "inverted" : "brand"} className={s.mark} motion={motion} />
      <span className="flex flex-col leading-none">
        <Wordmark inverted={inverted} className={cn(s.text, "leading-none")} />
        {showByline && (
          <span className={cn("mt-1 text-micro font-medium", inverted ? "text-white/70" : "text-ink-3")}>
            {getCopy().common.byline}
          </span>
        )}
      </span>
    </span>
  );
}
