import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const iconButtonStyles = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-150 select-none",
    "active:scale-95 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        ghost: "text-ink-2 hover:bg-ink/5 active:bg-ink/10",
        secondary: "border border-line-strong bg-surface text-ink-2 shadow-card hover:bg-subtle",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        plain: "text-ink-3 hover:text-ink",
      },
      size: {
        sm: "size-9 [&_svg]:size-4.5",
        md: "size-11 [&_svg]:size-5",
        lg: "size-12 [&_svg]:size-5.5",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

type IconButtonProps = ComponentProps<"button"> &
  VariantProps<typeof iconButtonStyles> & {
    /** Required: icon-only buttons need an accessible name. */
    "aria-label": string;
    asChild?: boolean;
  };

export function IconButton({ className, variant, size, asChild, type, ...props }: IconButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  return (
    <Component
      type={asChild ? undefined : (type ?? "button")}
      className={cn(iconButtonStyles({ variant, size }), className)}
      {...props}
    />
  );
}
