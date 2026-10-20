"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { digitsOnly } from "@/lib/phone";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  label: string;
  describedBy?: string;
}

/**
 * One-time-code entry rendered as boxes.
 * A single real input sits on top, so paste and SMS autofill
 * (`autocomplete="one-time-code"`) work everywhere.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  invalid,
  disabled,
  autoFocus,
  label,
  describedBy,
}: OtpInputProps) {
  const [focused, setFocused] = useState(Boolean(autoFocus));
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div className="relative">
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length }, (_, index) => {
          const char = value[index];
          const isActive = focused && index === activeIndex;
          return (
            <div
              key={index}
              className={cn(
                "flex h-14 items-center justify-center rounded-xl border bg-surface text-title-2 text-ink tabular transition-[border-color,box-shadow] duration-150 sm:h-16",
                invalid
                  ? "border-danger-500"
                  : isActive
                    ? "border-brand-500 ring-4 ring-brand-500/12"
                    : "border-line-strong",
                disabled && "bg-canvas text-ink-3",
              )}
            >
              {char ?? (isActive && <span className="h-7 w-0.5 animate-pulse rounded-full bg-brand-500" />)}
            </div>
          );
        })}
      </div>
      <input
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => {
          const next = digitsOnly(event.target.value).slice(0, length);
          onChange(next);
          if (next.length === length) onComplete?.(next);
        }}
        className="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none"
      />
    </div>
  );
}
