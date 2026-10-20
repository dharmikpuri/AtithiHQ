import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const badgeStyles = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full font-medium whitespace-nowrap [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-ink/6 text-ink-2",
        brand: "bg-brand-50 text-brand-700",
        success: "bg-success-50 text-success-700",
        warning: "bg-warning-50 text-warning-700",
        accent: "bg-accent-50 text-accent-700",
        danger: "bg-danger-50 text-danger-700",
        outline: "border border-line-strong bg-surface text-ink-2",
      },
      size: {
        sm: "h-6 px-2 text-footnote [&_svg]:size-3.5",
        md: "h-7 px-2.5 text-footnote [&_svg]:size-3.5",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeStyles>["tone"]>;

export function Badge({ className, tone, size, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeStyles>) {
  return <span className={cn(badgeStyles({ tone, size }), className)} {...props} />;
}

const dotTones: Record<BadgeTone, string> = {
  neutral: "bg-ink-4",
  brand: "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  accent: "bg-accent-500",
  danger: "bg-danger-500",
  outline: "bg-ink-4",
};

export function StatusDot({ tone = "neutral", className }: { tone?: BadgeTone; className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dotTones[tone], className)} />;
}
