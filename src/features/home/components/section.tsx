import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";

/** Page-width column used by every home page section. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

const SECTION_TONES = {
  plain: "",
  surface: "bg-surface",
  /** Soft brand tint, alternated with white so sections read as separate bands. */
  tint: "bg-brand-50",
  dark: "bg-brand-950 text-white",
};

/** A full-width band of the page with consistent vertical rhythm. */
export function Section({
  id,
  labelledBy,
  tone = "surface",
  className,
  children,
}: {
  id?: string;
  /** Id of the section's heading, so assistive tech announces the region by name. */
  labelledBy: string;
  tone?: keyof typeof SECTION_TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative py-20 sm:py-24 lg:py-28", SECTION_TONES[tone], className)}
    >
      {children}
    </section>
  );
}

/** Small rounded label above a heading: "Benefits", "Step 1"… */
export function Eyebrow({ children, inverted = false }: { children: ReactNode; inverted?: boolean }) {
  return (
    <p
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 text-subhead font-medium",
        inverted ? "bg-white/10 text-brand-100 ring-1 ring-white/15" : "bg-brand-100 text-brand-800",
      )}
    >
      {children}
    </p>
  );
}

/** Eyebrow, heading and intro paragraph at the top of a section. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lede,
  align = "center",
  inverted = false,
  className,
}: {
  /** Heading id, referenced by the section's `aria-labelledby`. */
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "center" | "start";
  inverted?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
        className,
      )}
    >
      <Eyebrow inverted={inverted}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className={cn(
          "text-title-1 text-balance sm:text-large-title lg:text-display",
          inverted ? "text-white" : "text-brand-950",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className={cn("text-body text-pretty sm:text-lead", inverted ? "text-white/75" : "text-ink-3")}>{lede}</p>
      )}
    </header>
  );
}

/** A heading whose second part is set in the brand blue, on a line of its own from tablet up. */
export function AccentHeading({
  id,
  as: Tag = "h2",
  lead,
  accent,
  className,
}: {
  id?: string;
  as?: "h2" | "h3";
  lead: string;
  accent: string;
  className?: string;
}) {
  return (
    <Tag id={id} className={cn("text-title-1 text-balance text-ink sm:text-large-title lg:text-display", className)}>
      {lead} <span className="text-brand-600 sm:block">{accent}</span>
    </Tag>
  );
}

/** Short benefits with icons, two to a row from tablet up. */
export function PointGrid({
  points,
  icons,
  className,
}: {
  points: readonly string[];
  /** One icon per point, in the same order. */
  icons: readonly LucideIcon[];
  className?: string;
}) {
  return (
    <ul className={cn("grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2", className)}>
      {points.map((point, index) => (
        <li key={point} className="flex items-center gap-3 text-body font-semibold text-ink">
          <IconTile icon={icons[index]} size="sm" tone="solid" />
          {point}
        </li>
      ))}
    </ul>
  );
}

/**
 * The showcase frame: a white card sitting on a solid navy block offset behind it.
 * Product illustrations go inside; they are decorative and hidden from assistive tech.
 */
export function OffsetCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn("relative mr-3 mb-3 sm:mr-5 sm:mb-5", className)}>
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[1.75rem] bg-brand-900 sm:translate-x-5 sm:translate-y-5" />
      <div
        inert
        className="relative overflow-hidden rounded-[1.75rem] border border-brand-900 bg-linear-to-b from-brand-50 to-surface p-5 sm:p-8"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Text on one side, an illustration on the other. Alternate `reverse` down the page.
 * Stacks on phones with the text first.
 */
export function FeatureRow({
  reverse = false,
  visual,
  children,
}: {
  reverse?: boolean;
  visual: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div className={cn("flex flex-col items-start gap-5", reverse && "lg:order-2")}>{children}</div>
      <div className={cn("reveal", reverse && "lg:order-1")}>{visual}</div>
    </div>
  );
}
