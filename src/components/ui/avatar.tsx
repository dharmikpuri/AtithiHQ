import { cn } from "@/lib/cn";

const TONES = [
  "bg-brand-100 text-brand-700",
  "bg-accent-100 text-accent-700",
  "bg-success-100 text-success-700",
  "bg-warning-100 text-warning-700",
  "bg-lilac-100 text-lilac-700",
  "bg-sea-100 text-sea-700",
];

const SIZES = {
  sm: "size-9 text-footnote",
  md: "size-11 text-callout",
  lg: "size-14 text-headline",
  xl: "size-20 text-title-2",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Stable colour per name, so a guest always looks the same. */
function toneFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

export function Avatar({
  name,
  size = "md",
  tone = "auto",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  /** `auto` picks a stable colour from the name (guests); `brand` is the signed-in owner. */
  tone?: "auto" | "brand";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide select-none",
        SIZES[size],
        tone === "brand" ? "bg-brand-600 text-white" : toneFor(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
