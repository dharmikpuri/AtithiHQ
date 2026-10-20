"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field";

/** Shared look for every text-like control: border, focus ring, invalid state. */
export const controlShell = cn(
  "flex w-full items-center rounded-xl border border-line-strong bg-surface text-body text-ink shadow-[inset_0_1px_0_rgb(26_29_36/0.02)]",
  "transition-[border-color,box-shadow] duration-150",
  "focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/12",
  "has-[[aria-invalid=true]]:border-danger-500 has-[[aria-invalid=true]]:focus-within:ring-danger-500/12",
  "has-[:disabled]:bg-canvas has-[:disabled]:text-ink-3",
);

export const controlInput = cn(
  "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-4",
  "disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden",
);

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  leading?: ReactNode;
  trailing?: ReactNode;
  size?: "md" | "lg";
  shellClassName?: string;
};

export function Input({ leading, trailing, size = "lg", className, shellClassName, id, ...props }: InputProps) {
  const field = useFieldControl();
  return (
    <div className={cn(controlShell, size === "lg" ? "h-12" : "h-11", shellClassName)}>
      {leading && <span className="flex shrink-0 items-center pl-3.5 text-ink-3">{leading}</span>}
      <input
        id={id ?? field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={cn(controlInput, leading ? "pl-2" : "pl-3.5", trailing ? "pr-2" : "pr-3.5", className)}
        {...props}
      />
      {trailing && <span className="flex shrink-0 items-center pr-2">{trailing}</span>}
    </div>
  );
}
