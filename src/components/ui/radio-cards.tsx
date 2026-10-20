"use client";

import { RadioGroup } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field";

interface RadioCardsProps<T extends string> {
  value: T | null | undefined;
  onChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode; description?: ReactNode; disabled?: boolean }[];
  className?: string;
  "aria-label"?: string;
}

/**
 * Single choice shown as large cards, each with a one-line explanation.
 * For settings where the difference between options needs a word of context.
 */
export function RadioCards<T extends string>({ value, onChange, options, className, ...props }: RadioCardsProps<T>) {
  const field = useFieldControl();
  return (
    <RadioGroup.Root
      value={value ?? ""}
      onValueChange={(next) => onChange(next as T)}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-label"] ? undefined : field ? `${field.id}-label` : undefined}
      aria-describedby={field?.describedBy}
      className={cn("flex flex-col gap-2.5", className)}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            "group flex min-h-14 w-full items-start gap-3.5 rounded-2xl border bg-surface px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-150",
            "border-line-strong hover:border-ink-4 hover:bg-subtle active:bg-canvas",
            "ring-brand-600 ring-inset data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-50/70 data-[state=checked]:ring-1",
            "data-disabled:cursor-not-allowed data-disabled:bg-canvas data-disabled:opacity-55 data-disabled:hover:border-line-strong",
          )}
        >
          <span
            aria-hidden
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-surface transition-colors group-data-[state=checked]:border-brand-600"
          >
            <span className="size-2.5 scale-0 rounded-full bg-brand-600 transition-transform duration-150 group-data-[state=checked]:scale-100" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-body font-semibold text-ink">{option.label}</span>
            {option.description && (
              <span className="text-subhead leading-5 text-ink-3 group-data-[state=checked]:text-ink-2">
                {option.description}
              </span>
            )}
          </span>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
