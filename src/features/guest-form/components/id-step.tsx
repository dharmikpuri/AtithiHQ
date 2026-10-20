"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, IdCard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useCopy } from "@/content";
import type { IdRequirement } from "@/domain/types";
import { guestDetailsSchema, type GuestDetailsValues } from "@/features/guest-details/guest-details-schema";
import { IdDocumentFields } from "@/features/guest-details/id-document-fields";
import { cn } from "@/lib/cn";
import { draftHasId, type DraftGuest } from "../draft";
import { GuestShell } from "./guest-shell";
import type { StepFrameProps } from "./step-frame";

interface IdStepProps {
  frame: StepFrameProps;
  requirement: Exclude<IdRequirement, "off">;
  retentionLabel: string;
  guests: DraftGuest[];
  onChange: (guest: DraftGuest) => void;
  onSubmit: () => void;
  submitting: boolean;
}

/**
 * Step 3 — optional photo ID for each guest. Never blocks submission:
 * whatever the host's rule, a guest can always send their details and show ID at check-in.
 */
export function IdStep({ frame, requirement, retentionLabel, guests, onChange, onSubmit, submitting }: IdStepProps) {
  const t = useCopy();
  const c = t.guestForm.id;
  const withId = guests.filter(draftHasId).length;

  const [editing, setEditing] = useState<DraftGuest | null>(null);
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);

  return (
    <GuestShell
      {...frame}
      footer={
        <div className="flex flex-col gap-2">
          <Button size="xl" fullWidth onClick={onSubmit} loading={submitting}>
            {t.guestForm.submit}
          </Button>
          {withId < guests.length && (
            <p className="text-center text-footnote text-ink-3">
              {requirement === "required" ? c.skipRequired : c.skipOptional}
            </p>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-title-1 text-ink">{c.title}</h1>
          <p className="text-body text-ink-3">{requirement === "required" ? c.subtitleRequired : c.subtitleOptional}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-1 text-subhead font-semibold text-ink-2 tabular">{c.summary(withId, guests.length)}</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {guests.map((guest) => {
              const has = draftHasId(guest);
              return (
                <li key={guest.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(guest);
                      setSheetKey((value) => value + 1);
                      setOpen(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle active:bg-canvas"
                  >
                    <Avatar name={guest.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-medium text-ink">{guest.name}</span>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-subhead",
                          has ? "font-medium text-success-700" : "text-ink-3",
                        )}
                      >
                        {has && <CircleCheck className="size-4" aria-hidden />}
                        {has
                          ? t.bookings.guests.idAdded(
                              t.common.idTypes[guest.idType as Exclude<typeof guest.idType, "none">],
                              guest.idLast4,
                            )
                          : t.bookings.guests.noId}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-subhead font-semibold",
                        has ? "text-brand-600" : "bg-brand-600 text-white",
                      )}
                    >
                      {!has && <IdCard className="size-4" aria-hidden />}
                      {has ? c.change : c.add}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-brand-50 px-4 py-3.5 text-subhead leading-5 text-brand-800">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
          <p>{c.trust(retentionLabel)}</p>
        </div>
      </div>

      {editing && (
        <IdSheet
          key={sheetKey}
          guest={editing}
          open={open}
          onOpenChange={setOpen}
          onSave={(guest) => {
            onChange(guest);
            setOpen(false);
          }}
        />
      )}
    </GuestShell>
  );
}

const ID_FORM_ID = "guest-id-form";

function IdSheet({
  guest,
  open,
  onOpenChange,
  onSave,
}: {
  guest: DraftGuest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (guest: DraftGuest) => void;
}) {
  const t = useCopy().guestForm.id;
  const foreign = guest.nationality !== "IN";
  const form = useForm<GuestDetailsValues>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      ...guest,
      // Pre-select the likeliest document so it's one less tap.
      idType: guest.idType === "none" ? (foreign ? "passport" : "aadhaar") : guest.idType,
    },
  });
  const submit = form.handleSubmit((values) => onSave({ ...guest, ...values, idTouched: true }));

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.sheetTitle(guest.name.split(/\s+/)[0] ?? guest.name)}
      description={t.sheetDescription}
      footer={
        <Button type="submit" form={ID_FORM_ID} size="xl" fullWidth>
          {t.save}
        </Button>
      }
    >
      <form id={ID_FORM_ID} onSubmit={submit} noValidate>
        <IdDocumentFields form={form} allowNone={false} preferPassport={foreign} />
      </form>
    </Sheet>
  );
}
