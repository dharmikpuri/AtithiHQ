"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import { countryName } from "@/domain/countries";
import { GuestDetailsFields } from "@/features/guest-details/guest-details-fields";
import { guestDetailsSchema, type GuestDetailsValues } from "@/features/guest-details/guest-details-schema";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/phone";
import { emptyDraftGuest, type DraftGuest } from "../draft";
import { GuestShell } from "./guest-shell";
import type { StepFrameProps } from "./step-frame";

interface OthersStepProps {
  frame: StepFrameProps;
  guestCount: number;
  leadNationality: string;
  companions: DraftGuest[];
  onChange: (companions: DraftGuest[]) => void;
  onContinue: () => void;
  ctaLabel: string;
  submitting?: boolean;
}

/**
 * Step 2 — everyone else on the booking, filled in by the person who booked.
 * One form covers the whole group, so every guest needs a name before moving on
 * (phone and ID stay optional).
 */
export function OthersStep({
  frame,
  guestCount,
  leadNationality,
  companions,
  onChange,
  onContinue,
  ctaLabel,
  submitting,
}: OthersStepProps) {
  const t = useCopy().guestForm.others;
  const expected = Math.max(0, guestCount - 1);
  const emptySlots = Math.max(0, expected - companions.length);

  // Shown once they try to continue with names still missing.
  const [showMissing, setShowMissing] = useState(false);
  const [editing, setEditing] = useState<DraftGuest | null>(null);
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const openSheet = (guest: DraftGuest | null) => {
    setEditing(guest);
    setSheetKey((value) => value + 1);
    setOpen(true);
  };

  function save(guest: DraftGuest) {
    const exists = companions.some((item) => item.key === guest.key);
    onChange(exists ? companions.map((item) => (item.key === guest.key ? guest : item)) : [...companions, guest]);
    setOpen(false);
  }

  return (
    <GuestShell
      {...frame}
      footer={
        <Button
          size="xl"
          fullWidth
          loading={submitting}
          onClick={() => {
            if (emptySlots > 0) setShowMissing(true);
            else onContinue();
          }}
        >
          {ctaLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-title-1 text-ink">{t.title}</h1>
          <p className="text-body text-ink-3">{t.subtitle(expected)}</p>
        </div>

        <div className="flex flex-col gap-2">
          {expected > 0 && (
            <p className="px-1 text-subhead font-semibold text-ink-2 tabular">
              {t.added(Math.min(companions.length, expected), expected)}
            </p>
          )}
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {companions.map((guest) => (
              <li key={guest.key}>
                <button
                  type="button"
                  onClick={() => openSheet(guest)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle active:bg-canvas"
                >
                  <Avatar name={guest.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-ink">{guest.name}</span>
                    <span className="block truncate text-subhead text-ink-3 tabular">
                      {[guest.phone ? formatPhone(guest.phone) : null, countryName(guest.nationality)]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="text-callout font-semibold text-brand-600">{t.edit}</span>
                </button>
              </li>
            ))}
            {Array.from({ length: emptySlots }, (_, index) => (
              <li key={`slot-${index}`}>
                <button
                  type="button"
                  onClick={() => openSheet(null)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-brand-50/50 active:bg-canvas",
                    showMissing && "bg-danger-50/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed",
                      showMissing ? "border-danger-500 text-danger-600" : "border-brand-200 text-brand-500",
                    )}
                  >
                    <UserPlus className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-medium text-ink">
                      {t.slot(companions.length + index + 2)}
                    </span>
                    <span className="block text-subhead text-ink-3">{t.slotHint}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ink-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          {emptySlots === 0 && (
            <Button variant="ghost" className="self-start" leadingIcon={<UserPlus />} onClick={() => openSheet(null)}>
              {t.addAnother}
            </Button>
          )}
        </div>

        {emptySlots > 0 &&
          (showMissing ? (
            <Notice tone="danger" role="alert">
              {t.missing(emptySlots)}
            </Notice>
          ) : (
            <Notice tone="neutral">{t.requiredNote}</Notice>
          ))}
        {expected > 0 && <p className="text-footnote text-ink-3">{t.notComing}</p>}
      </div>

      <CompanionSheet
        key={sheetKey}
        open={open}
        onOpenChange={setOpen}
        guest={editing}
        defaultNationality={leadNationality}
        onSave={save}
        onRemove={(key) => {
          onChange(companions.filter((item) => item.key !== key));
          setOpen(false);
        }}
      />
    </GuestShell>
  );
}

const SHEET_FORM_ID = "companion-form";

function CompanionSheet({
  open,
  onOpenChange,
  guest,
  defaultNationality,
  onSave,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: DraftGuest | null;
  defaultNationality: string;
  onSave: (guest: DraftGuest) => void;
  onRemove: (key: string) => void;
}) {
  const t = useCopy().guestForm.others;
  const base = guest ?? emptyDraftGuest(defaultNationality);
  const form = useForm<GuestDetailsValues>({ resolver: zodResolver(guestDetailsSchema), defaultValues: base });
  const submit = form.handleSubmit((values) => onSave({ ...base, ...values }));

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={guest ? t.sheetEditTitle : t.sheetAddTitle}
      description={t.sheetDescription}
      footer={
        <div className="flex flex-col gap-2">
          <Button type="submit" form={SHEET_FORM_ID} size="xl" fullWidth>
            {t.save}
          </Button>
          {guest && (
            <Button
              variant="ghost"
              size="lg"
              className="text-danger-600 hover:bg-danger-50"
              leadingIcon={<Trash2 />}
              onClick={() => onRemove(guest.key)}
            >
              {t.remove}
            </Button>
          )}
        </div>
      }
    >
      <form id={SHEET_FORM_ID} onSubmit={submit} noValidate>
        <GuestDetailsFields form={form} autoFocus={!guest} />
      </form>
    </Sheet>
  );
}
