"use client";

import { Check, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Popover, Switch, ToggleGroup } from "radix-ui";
import { useState } from "react";
import { useCopy } from "@/content";
import { cn } from "@/lib/cn";
import { formatDayMonth } from "@/lib/dates";
import {
  countActive,
  filterChips,
  isOn,
  rangeOf,
  selected,
  type DateRange,
  type FilterField,
  type FilterState,
} from "@/lib/filters";
import { useIsDesktopLayout } from "@/lib/hooks/use-media-query";
import { Button, buttonStyles } from "./button";
import { EmptyState } from "./empty-state";
import { Field } from "./field";
import { Input } from "./input";
import { Sheet } from "./sheet";

interface FilterControlProps {
  fields: readonly FilterField[];
  /** Applied filters (from the URL). */
  values: FilterState;
  onApply: (next: FilterState) => void;
  /** How many items a draft would show, for the "Show N results" button. */
  countFor: (draft: FilterState) => number;
  className?: string;
  /** Icon-only button on phones, for crowded toolbars. */
  compact?: boolean;
}

/**
 * The "Filters" button and its panel: a bottom sheet on phones, a popover from tablet up.
 * Choices are a draft until "Show N results", so the list doesn't jump while choosing.
 */
export function FilterButton({ fields, values, onApply, countFor, className, compact = false }: FilterControlProps) {
  const t = useCopy().common.filters;
  const isDesktop = useIsDesktopLayout();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(values);
  const active = countActive(fields, values);

  const setOpenWithDraft = (next: boolean) => {
    if (next) setDraft(values);
    setOpen(next);
  };
  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const trigger = (
    <button
      type="button"
      className={cn(buttonStyles({ variant: "secondary", size: "md" }), compact && "px-3 sm:px-4", className)}
      onClick={isDesktop ? undefined : () => setOpenWithDraft(true)}
    >
      <SlidersHorizontal aria-hidden />
      <span className={cn(compact && "sr-only sm:not-sr-only")}>{t.button}</span>
      {active > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-caption font-semibold text-white tabular">
          <span aria-hidden>{active}</span>
          <span className="sr-only">{t.active(active)}</span>
        </span>
      )}
    </button>
  );

  const footer = (
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={() => setDraft({})} disabled={countActive(fields, draft) === 0}>
        {t.reset}
      </Button>
      <Button className="flex-1" onClick={apply}>
        {t.show(countFor(draft))}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Popover.Root open={open} onOpenChange={setOpenWithDraft}>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            collisionPadding={16}
            aria-label={t.title}
            className="z-50 flex max-h-[var(--radix-popover-content-available-height)] w-[23rem] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop outline-none data-[state=open]:animate-fade-in"
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
              <p className="text-headline text-ink">{t.title}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <FilterForm fields={fields} draft={draft} onChange={setDraft} />
            </div>
            <div className="border-t border-line px-5 py-3">{footer}</div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <>
      {trigger}
      <Sheet open={open} onOpenChange={setOpenWithDraft} title={t.title} description={t.description} footer={footer}>
        <FilterForm fields={fields} draft={draft} onChange={setDraft} />
      </Sheet>
    </>
  );
}

function FilterForm({
  fields,
  draft,
  onChange,
}: {
  fields: readonly FilterField[];
  draft: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const t = useCopy().common.filters;
  const set = (key: string, value: FilterState[string]) => onChange({ ...draft, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field) => {
        if (field.kind === "multi") {
          return (
            <fieldset key={field.key} className="flex flex-col gap-2.5">
              <legend className="mb-2.5 text-subhead font-semibold text-ink-2">{field.label}</legend>
              <ToggleGroup.Root
                type="multiple"
                value={selected(draft, field.key)}
                onValueChange={(value) => set(field.key, value)}
                className="flex flex-wrap gap-2"
              >
                {field.options.map((option) => (
                  <ToggleGroup.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      "group inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-subhead font-medium transition-colors duration-150",
                      "border-line-strong bg-surface text-ink-2 hover:border-ink-4 hover:text-ink active:scale-[0.97]",
                      "data-[state=on]:border-brand-600 data-[state=on]:bg-brand-600 data-[state=on]:text-white",
                    )}
                  >
                    <Check className="hidden size-4 group-data-[state=on]:block" aria-hidden />
                    {option.label}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup.Root>
            </fieldset>
          );
        }
        if (field.kind === "toggle") {
          const id = `filter-${field.key}`;
          return (
            <div key={field.key} className="flex items-center justify-between gap-4">
              <label htmlFor={id} className="flex min-w-0 flex-col gap-0.5">
                <span className="text-callout font-medium text-ink">{field.label}</span>
                {field.hint && <span className="text-footnote text-ink-3">{field.hint}</span>}
              </label>
              <Switch.Root
                id={id}
                checked={isOn(draft, field.key)}
                onCheckedChange={(checked) => set(field.key, checked)}
                className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-ink/15 transition-colors data-[state=checked]:bg-brand-600"
              >
                <Switch.Thumb className="block size-6 translate-x-0.5 rounded-full bg-white shadow-card transition-transform data-[state=checked]:translate-x-5.5" />
              </Switch.Root>
            </div>
          );
        }
        const range = rangeOf(draft, field.key);
        return (
          <fieldset key={field.key} className="flex flex-col">
            <legend className="mb-2.5 text-subhead font-semibold text-ink-2">{field.label}</legend>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.from}>
                <Input
                  type="date"
                  size="md"
                  value={range.from ?? ""}
                  max={range.to}
                  onChange={(event) => set(field.key, { ...range, from: event.target.value || undefined })}
                />
              </Field>
              <Field label={t.to}>
                <Input
                  type="date"
                  size="md"
                  value={range.to ?? ""}
                  min={range.from}
                  onChange={(event) => set(field.key, { ...range, to: event.target.value || undefined })}
                />
              </Field>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/** Applied filters as removable chips, plus "Clear all". Renders nothing when no filter is on. */
export function FilterChips({ fields, values, onApply, className }: Omit<FilterControlProps, "countFor" | "compact">) {
  const t = useCopy().common.filters;
  const formatRange = (range: DateRange) =>
    range.from && range.to
      ? t.dateBetween(formatDayMonth(range.from), formatDayMonth(range.to))
      : range.from
        ? t.dateFrom(formatDayMonth(range.from))
        : t.dateTo(formatDayMonth(range.to ?? ""));
  const chips = filterChips(fields, values, formatRange);
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onApply(chip.without)}
          aria-label={t.remove(chip.label)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 pr-2 pl-3 text-footnote font-medium text-brand-700 transition-colors hover:bg-brand-100"
        >
          {chip.label}
          <X className="size-3.5" aria-hidden />
        </button>
      ))}
      <Button variant="link" size="sm" className="px-1" onClick={() => onApply({})}>
        {t.clearAll}
      </Button>
    </div>
  );
}

/** What a filtered list shows when nothing matches. */
export function NoFilterResults({ onClear }: { onClear: () => void }) {
  const t = useCopy().common.filters.noMatch;
  return (
    <EmptyState
      compact
      icon={SearchX}
      title={t.title}
      description={t.body}
      action={
        <Button variant="secondary" leadingIcon={<X />} onClick={onClear}>
          {t.clear}
        </Button>
      }
    />
  );
}
