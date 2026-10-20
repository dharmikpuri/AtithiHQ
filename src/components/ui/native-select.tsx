"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field";
import { controlShell } from "./input";

/**
 * Styled native `<select>`. On phones this opens the system picker, which is
 * the most familiar and accessible option for long lists like countries.
 */
export function NativeSelect({
  className,
  shellClassName,
  children,
  id,
  ...props
}: ComponentProps<"select"> & { shellClassName?: string }) {
  const field = useFieldControl();
  return (
    <div className={cn(controlShell, "relative h-12", shellClassName)}>
      <select
        id={id ?? field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={cn(
          "h-full w-full cursor-pointer appearance-none rounded-xl bg-transparent pr-10 pl-3.5 text-body text-ink outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 size-5 text-ink-3" aria-hidden />
    </div>
  );
}
