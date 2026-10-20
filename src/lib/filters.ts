/**
 * List filters that live in the URL, so refresh and back/forward keep them.
 * Each screen describes its filters once (`FilterField[]`); reading, writing,
 * counting and chip labels are handled here. Pure functions — no React.
 *
 * URL shape: `?source=airbnb,direct&overdue=1&checkin_from=2026-10-01&checkin_to=2026-10-31`
 */
import type { ISODate } from "@/domain/types";
import { isISODate } from "./dates";

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterField =
  | { kind: "multi"; key: string; label: string; options: readonly FilterOption[] }
  | { kind: "toggle"; key: string; label: string; hint?: string }
  | { kind: "dateRange"; key: string; label: string };

export interface DateRange {
  from?: ISODate;
  to?: ISODate;
}

/** Current filter values by field key. Missing keys mean "no filter". */
export type FilterState = Record<string, string[] | boolean | DateRange | undefined>;

const fromParam = (key: string) => `${key}_from`;
const toParam = (key: string) => `${key}_to`;

/* --------------------------------- Reading -------------------------------- */

export function readFilters(fields: readonly FilterField[], params: URLSearchParams): FilterState {
  const state: FilterState = {};
  for (const field of fields) {
    if (field.kind === "multi") {
      const allowed = new Set(field.options.map((option) => option.value));
      const values = (params.get(field.key) ?? "").split(",").filter((value) => allowed.has(value));
      if (values.length) state[field.key] = [...new Set(values)];
    } else if (field.kind === "toggle") {
      if (params.get(field.key) === "1") state[field.key] = true;
    } else {
      const from = params.get(fromParam(field.key));
      const to = params.get(toParam(field.key));
      const range: DateRange = {
        from: isISODate(from) ? from : undefined,
        to: isISODate(to) ? to : undefined,
      };
      if (range.from || range.to) state[field.key] = range;
    }
  }
  return state;
}

/** Typed accessors, so screens don't cast. */
export const selected = (state: FilterState, key: string): string[] => {
  const value = state[key];
  return Array.isArray(value) ? value : [];
};
export const isOn = (state: FilterState, key: string): boolean => state[key] === true;
export const rangeOf = (state: FilterState, key: string): DateRange => {
  const value = state[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
};

/** True when a date falls inside the range (both ends inclusive, either end optional). */
export function inRange(date: ISODate, range: DateRange): boolean {
  return (!range.from || date >= range.from) && (!range.to || date <= range.to);
}

/* --------------------------------- Writing -------------------------------- */

/** Writes the filters into a copy of `params`, leaving every other parameter alone. */
export function writeFilters(
  fields: readonly FilterField[],
  state: FilterState,
  params: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const field of fields) {
    if (field.kind === "dateRange") {
      const range = rangeOf(state, field.key);
      setOrDelete(next, fromParam(field.key), range.from);
      setOrDelete(next, toParam(field.key), range.to);
    } else if (field.kind === "toggle") {
      setOrDelete(next, field.key, isOn(state, field.key) ? "1" : undefined);
    } else {
      const values = selected(state, field.key);
      setOrDelete(next, field.key, values.length ? values.join(",") : undefined);
    }
  }
  return next;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
  else params.delete(key);
}

/* --------------------------------- Summary -------------------------------- */

/** How many filters are applied (a date range counts once). */
export function countActive(fields: readonly FilterField[], state: FilterState): number {
  return fields.filter((field) => {
    if (field.kind === "multi") return selected(state, field.key).length > 0;
    if (field.kind === "toggle") return isOn(state, field.key);
    const range = rangeOf(state, field.key);
    return Boolean(range.from || range.to);
  }).length;
}

export interface FilterChip {
  id: string;
  label: string;
  /** The state with just this chip removed. */
  without: FilterState;
}

/** One removable chip per selected option, toggle or date range. */
export function filterChips(
  fields: readonly FilterField[],
  state: FilterState,
  formatRange: (range: DateRange) => string,
): FilterChip[] {
  const chips: FilterChip[] = [];
  for (const field of fields) {
    if (field.kind === "multi") {
      const values = selected(state, field.key);
      for (const value of values) {
        const label = field.options.find((option) => option.value === value)?.label ?? value;
        chips.push({
          id: `${field.key}:${value}`,
          label,
          without: { ...state, [field.key]: values.filter((item) => item !== value) },
        });
      }
    } else if (field.kind === "toggle") {
      if (isOn(state, field.key))
        chips.push({ id: field.key, label: field.label, without: { ...state, [field.key]: false } });
    } else {
      const range = rangeOf(state, field.key);
      if (range.from || range.to) {
        chips.push({
          id: field.key,
          label: `${field.label}: ${formatRange(range)}`,
          without: { ...state, [field.key]: undefined },
        });
      }
    }
  }
  return chips;
}
