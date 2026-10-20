import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export const buttonStyles = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
        accent: "bg-accent-600 text-white shadow-sm hover:bg-accent-700 active:bg-accent-800",
        secondary:
          "border border-line-strong bg-surface text-ink shadow-card hover:border-ink-4 hover:bg-subtle active:bg-canvas",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200",
        ghost: "text-ink-2 hover:bg-ink/5 active:bg-ink/10",
        danger: "bg-danger-600 text-white shadow-sm hover:bg-danger-700",
        "danger-soft": "bg-danger-50 text-danger-700 hover:bg-danger-100",
        link: "h-auto px-0 text-brand-600 underline-offset-4 hover:underline active:scale-100",
        /** For navy and dark surfaces. */
        inverse: "bg-white text-brand-700 shadow-sm hover:bg-brand-50 active:bg-brand-100",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-subhead [&_svg]:size-4",
        md: "h-11 rounded-xl px-4 text-callout [&_svg]:size-4.5",
        lg: "h-12 rounded-xl px-5 text-body [&_svg]:size-5",
        xl: "h-14 rounded-2xl px-6 text-body [&_svg]:size-5",
      },
      fullWidth: { true: "w-full" },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonStyles> & {
    /** Render the child element (e.g. a Next `Link`) with button styles. */
    asChild?: boolean;
    loading?: boolean;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(buttonStyles({ variant, size, fullWidth }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="invisible inline-flex items-center gap-2">
            {leadingIcon}
            {children}
            {trailingIcon}
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </span>
        </>
      ) : (
        <>
          {leadingIcon}
          {children}
          {trailingIcon}
        </>
      )}
    </button>
  );
}
