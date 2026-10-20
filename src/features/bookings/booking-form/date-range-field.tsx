"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import type { ISODate } from "@/domain/types";
import { cn } from "@/lib/cn";
import { daysBetween, formatStayRange, formatWeekdayDate, fromISODate, toISODate } from "@/lib/dates";
import { useIsDesktopLayout } from "@/lib/hooks/use-media-query";

interface DateRangeFieldProps {
  checkIn: ISODate | null;
  checkOut: ISODate | null;
  onChange: (range: { checkIn: ISODate; checkOut: ISODate }) => void;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Check-in and check-out side by side; one tap opens a calendar where
 * the owner taps the first night, then the last morning.
 */
export function DateRangeField({ checkIn, checkOut, onChange, invalid, describedBy }: DateRangeFieldProps) {
  const t = useCopy();
  const f = t.bookings.form;
  const isDesktop = useIsDesktopLayout();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const nights = checkIn && checkOut ? daysBetween(checkIn, checkOut) : 0;

  function openSheet() {
    setDraft(checkIn && checkOut ? { from: fromISODate(checkIn), to: fromISODate(checkOut) } : undefined);
    setOpen(true);
  }

  const draftNights = draft?.from && draft.to ? daysBetween(toISODate(draft.from), toISODate(draft.to)) : 0;
  const instruction = !draft?.from ? f.pickCheckIn : !draft.to ? f.pickCheckOut : null;

  const box = cn(
    "flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-xl border bg-surface px-3.5 py-2.5 text-left transition-[border-color,box-shadow] duration-150",
    "hover:border-ink-4 focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/12 focus-visible:outline-none",
    invalid ? "border-danger-500" : "border-line-strong",
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={openSheet}
          aria-describedby={describedBy}
          aria-label={
            checkIn && checkOut
              ? `${f.dates}: ${formatStayRange(checkIn, checkOut)}, ${t.common.count.nights(nights)}`
              : f.selectDates
          }
          className="flex items-stretch gap-2 rounded-xl text-left outline-none"
        >
          <span className={box}>
            <span className="text-footnote font-medium text-ink-3">{f.checkIn}</span>
            <span className={cn("truncate text-body font-semibold", checkIn ? "text-ink" : "text-ink-3")}>
              {checkIn ? formatWeekdayDate(checkIn) : f.selectDates}
            </span>
          </span>
          <span className="flex items-center text-ink-4" aria-hidden>
            <ArrowRight className="size-4" />
          </span>
          <span className={box}>
            <span className="text-footnote font-medium text-ink-3">{f.checkOut}</span>
            <span className={cn("truncate text-body font-semibold", checkOut ? "text-ink" : "text-ink-3")}>
              {checkOut ? formatWeekdayDate(checkOut) : "—"}
            </span>
          </span>
        </button>
        {nights > 0 && (
          <p className="flex items-center gap-1.5 text-subhead font-medium text-brand-700">
            <CalendarDays className="size-4" aria-hidden />
            {t.common.count.nights(nights)}
          </p>
        )}
      </div>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={f.datesTitle}
        description={
          instruction ??
          `${formatStayRange(toISODate(draft!.from!), toISODate(draft!.to!))} · ${t.common.count.nights(draftNights)}`
        }
        size="xl"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="lg" className="flex-1 sm:flex-none" onClick={() => setOpen(false)}>
              {t.common.actions.cancel}
            </Button>
            <Button
              size="lg"
              className="flex-[2] sm:ml-auto sm:flex-none sm:px-8"
              disabled={!draft?.from || !draft.to}
              onClick={() => {
                if (!draft?.from || !draft.to) return;
                onChange({ checkIn: toISODate(draft.from), checkOut: toISODate(draft.to) });
                setOpen(false);
              }}
            >
              {t.common.actions.done}
            </Button>
          </div>
        }
      >
        <div className="flex justify-center pt-1">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            resetOnSelect
            min={1}
            numberOfMonths={isDesktop ? 2 : 1}
            defaultMonth={draft?.from ?? new Date()}
          />
        </div>
      </Sheet>
    </>
  );
}
