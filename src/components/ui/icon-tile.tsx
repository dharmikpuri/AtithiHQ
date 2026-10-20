import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Duotone treatment for line icons: the outline in the current colour and its closed
 * shapes softly filled with the same colour. Spread onto any lucide icon: `<Users {...duotone} />`.
 */
export const duotone = { fill: "currentColor", fillOpacity: 0.16 } as const;

export const iconTileStyles = cva("inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0", {
  variants: {
    tone: {
      brand: "bg-linear-to-br from-brand-50 to-brand-100 text-brand-600 ring-1 ring-brand-200/70 ring-inset",
      accent: "bg-linear-to-br from-accent-50 to-accent-100 text-accent-600 ring-1 ring-accent-200/70 ring-inset",
      success: "bg-linear-to-br from-success-50 to-success-100 text-success-700 ring-1 ring-success-100 ring-inset",
      /** Filled brand tile, for the strongest emphasis. */
      solid: "bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-fab",
      /** For navy and dark surfaces. */
      glass: "bg-white/10 text-brand-200 ring-1 ring-white/15 ring-inset",
    },
    size: {
      sm: "size-8 rounded-lg [&_svg]:size-4",
      md: "size-10 rounded-xl [&_svg]:size-5",
      lg: "size-12 rounded-2xl [&_svg]:size-6",
      xl: "size-16 rounded-3xl [&_svg]:size-8",
    },
  },
  defaultVariants: { tone: "brand", size: "md" },
});

/** An icon on a soft rounded tile: the one way icons are framed across the app and the home page. */
export function IconTile({
  icon: Icon,
  tone,
  size,
  className,
}: { icon: LucideIcon; className?: string } & VariantProps<typeof iconTileStyles>) {
  return (
    <span aria-hidden className={cn(iconTileStyles({ tone, size }), className)}>
      <Icon {...(tone === "solid" ? {} : duotone)} />
    </span>
  );
}
