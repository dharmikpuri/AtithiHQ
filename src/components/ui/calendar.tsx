"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/cn";

const rangeFill = "var(--color-brand-50)";

/** Calendar styled for AtithiHQ. Large, round day targets for touch. */
export function Calendar({ className, classNames, ...props }: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={false}
      className={cn("w-full", className)}
      classNames={{
        root: "relative",
        months: "flex flex-col gap-8 sm:flex-row sm:gap-8",
        month: "flex w-full flex-col gap-3",
        month_caption: "flex h-10 items-center justify-center",
        caption_label: "text-body font-semibold text-ink",
        nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
        button_previous:
          "flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-ink/5 active:bg-ink/10 disabled:opacity-30",
        button_next:
          "flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-ink/5 active:bg-ink/10 disabled:opacity-30",
        month_grid: "mx-auto border-collapse",
        weekdays: "flex",
        weekday:
          "flex h-9 w-10 items-center justify-center text-caption font-semibold uppercase tracking-wide text-ink-3 min-[380px]:w-11",
        week: "mt-1 flex",
        day: "relative size-10 p-0 text-center min-[380px]:size-11",
        day_button: cn(
          "relative z-10 flex size-10 items-center justify-center rounded-full text-callout font-medium text-ink transition-colors outline-none min-[380px]:size-11",
          "hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-brand-500",
        ),
        today:
          "[&>button]:font-bold [&>button]:text-brand-600 [&>button]:underline [&>button]:decoration-2 [&>button]:underline-offset-4",
        selected: "[&>button]:bg-brand-600 [&>button]:text-white [&>button]:hover:bg-brand-700 [&>button]:no-underline",
        // Range ends get a half-width fill (see modifiersStyles) so the band reads as one strip.
        range_middle:
          "bg-brand-50 [&>button]:!bg-transparent [&>button]:!text-brand-800 [&>button]:hover:!bg-brand-100",
        outside: "invisible",
        disabled: "[&>button]:text-ink-4 [&>button]:opacity-50 [&>button]:hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      modifiersStyles={{
        range_start: { background: `linear-gradient(to right, transparent 50%, ${rangeFill} 50%)` },
        range_end: { background: `linear-gradient(to left, transparent 50%, ${rangeFill} 50%)` },
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-5", chevronClass)} aria-hidden />
          ) : (
            <ChevronRight className={cn("size-5", chevronClass)} aria-hidden />
          ),
      }}
      {...props}
    />
  );
}
