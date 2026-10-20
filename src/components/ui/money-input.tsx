"use client";

import type { Rupees } from "@/domain/types";
import { cn } from "@/lib/cn";
import { formatAmountInput, parseAmountInput } from "@/lib/money";
import { Input } from "./input";

interface MoneyInputProps {
  value: Rupees | null | undefined;
  onChange: (value: Rupees | null) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Rupee amount with Indian digit grouping as you type (1,25,000). */
export function MoneyInput({
  value,
  onChange,
  onBlur,
  name,
  placeholder = "0",
  autoFocus,
  disabled,
  className,
}: MoneyInputProps) {
  return (
    <Input
      name={name}
      inputMode="numeric"
      autoComplete="off"
      enterKeyHint="done"
      autoFocus={autoFocus}
      disabled={disabled}
      placeholder={placeholder}
      value={formatAmountInput(value)}
      onChange={(event) => {
        const parsed = parseAmountInput(event.target.value);
        onChange(parsed === null ? null : Math.min(parsed, 99_99_99_999));
      }}
      onBlur={onBlur}
      leading={<span className="text-body font-medium text-ink-2">₹</span>}
      className={cn("tabular", className)}
    />
  );
}
