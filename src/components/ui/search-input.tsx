"use client";

import { Search, X } from "lucide-react";
import { useCopy } from "@/content";
import { Input } from "./input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps) {
  const t = useCopy();
  return (
    <Input
      type="search"
      inputMode="search"
      enterKeyHint="search"
      autoComplete="off"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      shellClassName={className}
      leading={<Search className="size-5" aria-hidden />}
      trailing={
        value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t.common.actions.clear}
            className="flex size-9 items-center justify-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4.5" />
          </button>
        ) : null
      }
    />
  );
}
