"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCopy } from "@/content";
import { COUNTRIES, countryName, findCountry } from "@/domain/countries";
import type { PhoneE164 } from "@/domain/types";
import { cn } from "@/lib/cn";
import { digitsOnly, formatNationalInput, INDIA_DIAL, splitE164 } from "@/lib/phone";
import { useFieldControl } from "./field";
import { controlInput, controlShell } from "./input";

interface PhoneInputProps {
  /** E.164 while typing (may be incomplete), or empty. */
  value: PhoneE164 | "" | null | undefined;
  onChange: (value: PhoneE164 | "") => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  defaultCountry?: string;
  className?: string;
}

/**
 * Mobile number input with a country-code picker.
 * The prefix opens the native picker; the number formats as you type.
 */
export function PhoneInput({
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  autoFocus,
  disabled,
  defaultCountry = "IN",
  className,
}: PhoneInputProps) {
  const t = useCopy();
  const field = useFieldControl();
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  // Derive the visible country and digits from the value, so resets from
  // the form (or an incoming saved number) are reflected without effects.
  const selectedDial = findCountry(selectedCountry)?.dial ?? INDIA_DIAL;
  const matchesSelected = Boolean(value) && value!.startsWith(`+${selectedDial}`);
  const parsedDial = value && !matchesSelected ? splitE164(value).dial : "";
  const countryCode = matchesSelected
    ? selectedCountry
    : (COUNTRIES.find((country) => country.dial === parsedDial)?.code ?? selectedCountry);
  const dial = findCountry(countryCode)?.dial ?? INDIA_DIAL;
  const national = value ? digitsOnly(value).slice(dial.length) : "";

  function emit(nextDial: string, digits: string) {
    onChange(digits ? `+${nextDial}${digits}` : "");
  }

  function handleNumberChange(raw: string) {
    // A pasted international number ("+44 7700…") switches the country.
    if (raw.trim().startsWith("+")) {
      const parsed = splitE164(raw);
      const country = COUNTRIES.find((item) => item.dial === parsed.dial);
      if (country) {
        setSelectedCountry(country.code);
        emit(country.dial, parsed.national.slice(0, 14));
        return;
      }
    }
    let digits = digitsOnly(raw);
    if (dial === INDIA_DIAL) {
      if (digits.length === 12 && digits.startsWith(INDIA_DIAL)) digits = digits.slice(2);
      if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
      digits = digits.slice(0, 10);
    } else {
      digits = digits.slice(0, 14);
    }
    emit(dial, digits);
  }

  return (
    <div className={cn(controlShell, "h-12", className)}>
      <div className="relative flex h-full shrink-0 items-center border-r border-line pr-2.5 pl-3.5">
        <span aria-hidden className="flex items-center gap-1 text-body font-medium text-ink tabular">
          +{dial}
          <ChevronDown className="size-4 text-ink-3" />
        </span>
        <select
          aria-label={t.common.fields.countryCode}
          value={countryCode}
          disabled={disabled}
          onChange={(event) => {
            const next = findCountry(event.target.value);
            if (!next) return;
            setSelectedCountry(next.code);
            emit(next.dial, national);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {countryName(country.code)} (+{country.dial})
            </option>
          ))}
        </select>
      </div>
      <input
        id={field?.id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder ?? (dial === INDIA_DIAL ? "93521 69357" : "")}
        value={formatNationalInput(dial, national)}
        onChange={(event) => handleNumberChange(event.target.value)}
        onBlur={onBlur}
        className={cn(controlInput, "px-3 tracking-wide tabular")}
      />
    </div>
  );
}
