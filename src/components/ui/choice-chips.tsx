"use client";

import { Check } from "lucide-react";
import { RadioGroup } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field";

interface ChoiceChipsProps<T extends string> {
  value: T | null | undefined;
  onChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  className?: string;
  "aria-label"?: string;
}

/** Single choice shown as tappable pills — one tap instead of a dropdown. */
export function ChoiceChips<T extends string>({ value, onChange, options, className, ...props }: ChoiceChipsProps<T>) {
  const field = useFieldControl();
  return (
    <RadioGroup.Root
      value={value ?? ""}
      onValueChange={(next) => onChange(next as T)}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-label"] ? undefined : field ? `${field.id}-label` : undefined}
      aria-describedby={field?.describedBy}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "group inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-callout font-medium transition-colors duration-150",
            "border-line-strong bg-surface text-ink-2 hover:border-ink-4 hover:text-ink",
            "data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 data-[state=checked]:text-white",
            "active:scale-[0.97]",
          )}
        >
          <Check className="hidden size-4 group-data-[state=checked]:block" aria-hidden />
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
