"use client";

import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A checkbox with its label beside it. The label may contain links (e.g. to the terms);
 * clicking the label text toggles the box, clicking a link opens it.
 */
export function Checkbox({
  id,
  label,
  error,
  className,
  ...props
}: Omit<ComponentProps<typeof CheckboxPrimitive.Root>, "children"> & {
  id: string;
  label: ReactNode;
  /** Shown under the checkbox and announced; also marks the box invalid. */
  error?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-md border-2 bg-surface transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            "data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 data-[state=checked]:text-white",
            error ? "border-danger-500" : "border-line-strong hover:border-ink-4",
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <label htmlFor={id} className="text-callout text-ink-2">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="pl-8.5 text-subhead font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
