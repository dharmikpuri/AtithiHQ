"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/content";
import { GuestDetailsFields } from "@/features/guest-details/guest-details-fields";
import { leadGuestDetailsSchema, type GuestDetailsValues } from "@/features/guest-details/guest-details-schema";
import type { DraftGuest } from "../draft";
import { GuestShell } from "./guest-shell";
import type { StepFrameProps } from "./step-frame";

const FORM_ID = "guest-you-form";

/** Step 1 — the person who booked. Their mobile number is the one thing we require. */
export function YouStep({
  frame,
  lead,
  onSave,
  ctaLabel,
}: {
  frame: StepFrameProps;
  lead: DraftGuest;
  onSave: (lead: DraftGuest) => void;
  ctaLabel: string;
}) {
  const t = useCopy().guestForm;
  const form = useForm<GuestDetailsValues>({
    resolver: zodResolver(leadGuestDetailsSchema),
    defaultValues: lead,
  });

  const submit = form.handleSubmit((values) => onSave({ ...lead, ...values }));

  return (
    <GuestShell
      {...frame}
      footer={
        <Button type="submit" form={FORM_ID} size="xl" fullWidth>
          {ctaLabel}
        </Button>
      }
    >
      <form id={FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-title-1 text-ink">{t.you.title}</h1>
          <p className="text-body text-ink-3">{t.you.subtitle}</p>
        </div>
        <GuestDetailsFields form={form} phoneRequired phoneHint={t.you.phoneHint} />
      </form>
    </GuestShell>
  );
}
