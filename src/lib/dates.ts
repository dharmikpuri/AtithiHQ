import {
  addDays as addDaysFns,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { ISODate, TimeOfDay } from "@/domain/types";

/** Today's date in the user's local time zone. */
export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function toISODate(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

/** Parses `YYYY-MM-DD` as a local calendar date (not UTC midnight). */
export function fromISODate(value: ISODate): Date {
  return parseISO(value);
}

export function isISODate(value: unknown): value is ISODate {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));
}

export function addDays(value: ISODate, days: number): ISODate {
  return toISODate(addDaysFns(fromISODate(value), days));
}

/** First and last day of a month: `offset` 0 = this month, -1 = last month. */
export function monthRange(today: ISODate, offset = 0): { from: ISODate; to: ISODate } {
  const month = addMonths(fromISODate(today), offset);
  return { from: toISODate(startOfMonth(month)), to: toISODate(endOfMonth(month)) };
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return differenceInCalendarDays(fromISODate(to), fromISODate(from));
}

function sameYear(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear();
}

/** "16 Sep" — adds the year only when it is not the current year. */
export function formatDayMonth(value: ISODate, today: Date = new Date()): string {
  const date = fromISODate(value);
  return format(date, sameYear(date, today) ? "d MMM" : "d MMM yyyy");
}

/** "Thu, 16 Sep" */
export function formatWeekdayDate(value: ISODate, today: Date = new Date()): string {
  const date = fromISODate(value);
  return format(date, sameYear(date, today) ? "EEE, d MMM" : "EEE, d MMM yyyy");
}

/** "16 Sep 2026" */
export function formatFullDate(value: ISODate): string {
  return format(fromISODate(value), "d MMM yyyy");
}

/** "Sep 2026" */
export function formatMonthYear(value: ISODate): string {
  return format(fromISODate(value), "MMM yyyy");
}

/**
 * Compact stay range:
 * "16–19 Sep", "30 Sep – 2 Oct", "28 Dec 2026 – 2 Jan 2027".
 */
export function formatStayRange(checkIn: ISODate, checkOut: ISODate, today: Date = new Date()): string {
  const start = fromISODate(checkIn);
  const end = fromISODate(checkOut);
  const showYear = !sameYear(start, end) || !sameYear(start, today);

  if (!sameYear(start, end)) {
    return `${format(start, "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "d")}–${format(end, showYear ? "d MMM yyyy" : "d MMM")}`;
  }
  return `${format(start, "d MMM")} – ${format(end, showYear ? "d MMM yyyy" : "d MMM")}`;
}

/** "14:00" → "2:00 PM" */
export function formatTimeOfDay(value: TimeOfDay): string {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return format(date, minutes === 0 ? "h a" : "h:mm a");
}

/** Relative wording for recent timestamps: "today", "yesterday", "3 Sep". */
export function formatRelativeDay(
  value: string,
  labels: { today: string; yesterday: string },
  now: Date = new Date(),
): string {
  const date = parseISO(value);
  const diff = differenceInCalendarDays(now, date);
  if (diff === 0) return labels.today;
  if (diff === 1) return labels.yesterday;
  return format(date, sameYear(date, now) ? "d MMM" : "d MMM yyyy");
}

/** "14 Oct, 3:30 PM" — a moment in the user's local time zone. */
export function formatDateTime(value: string): string {
  return format(parseISO(value), "d MMM, h:mm a");
}
