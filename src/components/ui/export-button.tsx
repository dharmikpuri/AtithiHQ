"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCopy } from "@/content";
import type { ISODate } from "@/domain/types";
import { cn } from "@/lib/cn";
import { monthRange, todayISO } from "@/lib/dates";
import type { ExportFormat } from "@/lib/export/table";
import { Button, buttonStyles } from "./button";
import { ChoiceChips } from "./choice-chips";
import { Field } from "./field";
import { Input } from "./input";
import { RadioCards } from "./radio-cards";
import { Sheet } from "./sheet";

/**
 * What to export:
 * - `view`: exactly what the screen shows now (tab, filters, search).
 * - `range`: everything matching the screen's other filters, within these check-in dates.
 */
export type ExportPeriod = { kind: "view" } | { kind: "range"; from: ISODate; to: ISODate };

type PeriodChoice = "view" | "thisMonth" | "lastMonth" | "custom";

interface ExportButtonProps {
  /** What is being exported, e.g. "bookings" — used in the dialog title. */
  what: string;
  /** How much a period would export, e.g. "18 bookings". Returns `null` when there is nothing. */
  describe: (period: ExportPeriod) => string | null;
  /** Builds and downloads the file; returns its name. */
  onExport: (format: ExportFormat, period: ExportPeriod) => Promise<string>;
  /** Icon-only button on phones, for crowded toolbars. */
  compact?: boolean;
  className?: string;
}

/**
 * "Export" opens a confirmation box: choose what to include and the file type (Excel by
 * default, CSV optional), see how much will be exported, then download.
 */
export function ExportButton({ what, describe, onExport, compact = false, className }: ExportButtonProps) {
  const copy = useCopy();
  const t = copy.common.export;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [choice, setChoice] = useState<PeriodChoice>("view");
  const [custom, setCustom] = useState<{ from?: ISODate; to?: ISODate }>({});
  const [format, setFormat] = useState<ExportFormat>("xlsx");

  const today = todayISO();
  const period: ExportPeriod | null =
    choice === "view"
      ? { kind: "view" }
      : choice === "thisMonth"
        ? { kind: "range", ...monthRange(today, 0) }
        : choice === "lastMonth"
          ? { kind: "range", ...monthRange(today, -1) }
          : custom.from && custom.to && custom.from <= custom.to
            ? { kind: "range", from: custom.from, to: custom.to }
            : null;
  const summary = period ? describe(period) : null;

  const openDialog = () => {
    setChoice("view");
    setFormat("xlsx");
    setCustom({});
    setOpen(true);
  };

  async function download() {
    if (!period || !summary) return;
    setBusy(true);
    try {
      const fileName = await onExport(format, period);
      toast.success(t.done(fileName));
      setOpen(false);
    } catch {
      toast.error(t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={cn(buttonStyles({ variant: "secondary", size: "md" }), compact && "px-3 sm:px-4", className)}
      >
        <Download aria-hidden />
        <span className={cn(compact && "sr-only sm:not-sr-only")}>{t.button}</span>
      </button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t.title(what)}
        description={t.description}
        dismissible={!busy}
        footer={
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              {copy.common.actions.cancel}
            </Button>
            <Button className="flex-1" leadingIcon={<Download />} loading={busy} disabled={!summary} onClick={download}>
              {t.download}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <Field label={t.period} hint={choice === "view" ? t.periods.viewHint : t.periodHint}>
            <ChoiceChips<PeriodChoice>
              value={choice}
              onChange={setChoice}
              options={[
                { value: "view", label: t.periods.view },
                { value: "thisMonth", label: t.periods.thisMonth },
                { value: "lastMonth", label: t.periods.lastMonth },
                { value: "custom", label: t.periods.custom },
              ]}
            />
          </Field>

          {choice === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={copy.common.filters.from}>
                <Input
                  type="date"
                  size="md"
                  value={custom.from ?? ""}
                  max={custom.to}
                  onChange={(event) => setCustom((value) => ({ ...value, from: event.target.value || undefined }))}
                />
              </Field>
              <Field label={copy.common.filters.to}>
                <Input
                  type="date"
                  size="md"
                  value={custom.to ?? ""}
                  min={custom.from}
                  onChange={(event) => setCustom((value) => ({ ...value, to: event.target.value || undefined }))}
                />
              </Field>
            </div>
          )}

          <Field label={t.format}>
            <RadioCards<ExportFormat>
              value={format}
              onChange={setFormat}
              options={[
                { value: "xlsx", label: t.xlsx, description: t.xlsxHint },
                { value: "csv", label: t.csv, description: t.csvHint },
              ]}
            />
          </Field>

          <p
            aria-live="polite"
            className={cn(
              "rounded-xl px-4 py-3 text-callout font-medium",
              summary ? "bg-brand-50 text-brand-800" : "bg-subtle text-ink-3",
            )}
          >
            {summary ? t.summary(summary) : period ? t.empty : t.periodHint}
          </p>
        </div>
      </Sheet>
    </>
  );
}
