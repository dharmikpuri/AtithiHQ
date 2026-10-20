"use client";

import { Minus, Plus } from "lucide-react";
import { useCopy } from "@/content";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Used in button labels: "Decrease guests". */
  unitLabel?: string;
  className?: string;
}

/** Large − value + control. Easier than typing a number on a phone. */
export function Stepper({ value, onChange, min = 0, max = 99, unitLabel, className }: StepperProps) {
  const t = useCopy();
  const field = useFieldControl();
  const suffix = unitLabel ? ` ${unitLabel}` : "";

  const buttonClass =
    "flex size-12 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-ink/5 active:bg-ink/10 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-labelledby={field ? `${field.id}-label` : undefined}
      className={cn("inline-flex h-12 items-center rounded-xl border border-line-strong bg-surface", className)}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`${t.common.a11y.decrease}${suffix}`}
      >
        <Minus className="size-5" />
      </button>
      <output id={field?.id} aria-live="polite" className="min-w-12 text-center text-headline text-ink tabular">
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`${t.common.a11y.increase}${suffix}`}
      >
        <Plus className="size-5" />
      </button>
    </div>
  );
}
